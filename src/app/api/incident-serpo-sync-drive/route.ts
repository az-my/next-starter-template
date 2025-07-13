// src/app/api/incident-serpo-sync-drive/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Buffer } from 'buffer';
import {
  uploadToDriveWithOAuth,
  getDriveFolderId,
} from '@/lib/googleOAuthDrive';

export const runtime = 'nodejs';

const supabase = createClient(
  process.env.SUPABASE_URL!,              // your server‐side URL
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // your service‐role key
);

const IMAGE_COLUMNS = [
  'foto_odo_awal',
  'foto_tim_awal',
  'foto_odo_akhir',
  'foto_tim_akhir',
] as const;

// 1) Define exactly the shape of what you’re selecting:
type IncidentSerpoImageRow = {
  id: number;
} & {
  [K in typeof IMAGE_COLUMNS[number]]?: string | null;
};

// 2) Build a comma-separated list from that array:
const COLUMN_LIST = ['id', ...IMAGE_COLUMNS].join(',');

export async function POST(req: NextRequest) {
  try {
    // Check required environment variables first
    const requiredEnvVars = [
      'SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GOOGLE_DRIVE_FOLDER_ID'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      return NextResponse.json(
        { error: `Missing required environment variables: ${missingVars.join(', ')}. Please check your .env.local file.` },
        { status: 500 }
      );
    }

    const { tokens } = (await req.json()) as {
      tokens?: { access_token: string; refresh_token?: string };
    };
    if (!tokens?.access_token) {
      return NextResponse.json(
        { error: 'Missing or invalid OAuth tokens.' },
        { status: 400 }
      );
    }

    // 3) Tell supabase and TS that you expect IncidentSerpoImageRow
    const { data, error } = await supabase
      .from<IncidentSerpoImageRow>('incident_serpo')
      .select(COLUMN_LIST)
      .eq('is_image_uploaded', false)
      .limit(10);

    if (error) throw error;
    if (!data || data.length === 0) {
      return NextResponse.json({ message: 'No records to sync.' });
    }

    const folderId = getDriveFolderId();
    const results: Array<{
      id: number;
      uploadResults: Record<string, string | null>;
      debugLog: any[];
    }> = [];

    for (const record of data) {
      const uploadResults: Record<string, string | null> = {};
      let allUploaded = true;
      const debugLog: any[] = [];

      for (const col of IMAGE_COLUMNS) {
        const base64 = record[col];
        if (!base64) {
          debugLog.push({ col, status: 'skipped', reason: 'No data' });
          continue;
        }

        try {
          const matches = base64.match(/^data:(.+);base64,(.*)$/);
          const mimeType = matches?.[1] || 'image/jpeg';
          const payload = matches?.[2] || base64;
          const buffer = Buffer.from(payload, 'base64');

          const driveRes = await uploadToDriveWithOAuth(
            tokens,
            buffer,
            mimeType,
            `${col}_${record.id}`,
            folderId
          );

          uploadResults[col] = driveRes.webViewLink || driveRes.id || null;
          debugLog.push({ col, status: 'success', driveRes });
        } catch (err: any) {
          allUploaded = false;
          uploadResults[col] = null;
          debugLog.push({
            col,
            status: 'error',
            message: err.message,
            stack: err.stack,
          });
          console.error(`Error uploading ${col} for record ${record.id}:`, err);
        }
      }

      if (allUploaded) {
        try {
          await supabase
            .from('incident_serpo')
            .update({
              is_image_uploaded: true,
              updated_at: new Date().toISOString(),
            })
            .eq('id', record.id);
          debugLog.push({ update: 'success' });
        } catch (err: any) {
          debugLog.push({ update: 'error', message: err.message });
          console.error(`Error updating record ${record.id}:`, err);
        }
      }

      results.push({ id: record.id, uploadResults, debugLog });
    }

    return NextResponse.json({ results });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
