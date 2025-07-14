// src/app/api/incident-serpo-sync-drive/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Buffer } from 'buffer';
import { uploadToDriveWithOAuth, getDriveFolderId } from '@/lib/googleOAuthDrive';

export const runtime = 'nodejs';

// Supabase server client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// === Constants & Types ===
const IMAGE_COLUMNS = [
  'foto_odo_awal',
  'foto_tim_awal',
  'foto_odo_akhir',
  'foto_tim_akhir',
] as const;
type ImageCol = typeof IMAGE_COLUMNS[number];

interface IncidentSerpoImageRow {
  id: number;
  foto_odo_awal?: string | null;
  foto_tim_awal?: string | null;
  foto_odo_akhir?: string | null;
  foto_tim_akhir?: string | null;
}

const COLUMN_LIST = (['id', ...IMAGE_COLUMNS] as const).join(',');

// === Helpers ===
async function fetchPendingRecords(): Promise<IncidentSerpoImageRow[]> {
  const { data, error } = await supabase
    .from('incident_serpo')
    .select(COLUMN_LIST)
    .eq('is_image_uploaded', false)
    .limit(10);

  if (error) throw error;
  if (!Array.isArray(data)) return [];
  return data as unknown as IncidentSerpoImageRow[];
}

async function processSingle(
  record: IncidentSerpoImageRow,
  tokens: { access_token: string; refresh_token?: string }
) {
  const folderId = getDriveFolderId();
  // avoid `any` by directly asserting to your record type
  const uploadResults = {} as Record<ImageCol, string | null>;
  const debugLog: Array<Record<string, unknown>> = [];
  let allUploaded = true;

  for (const col of IMAGE_COLUMNS) {
    const base64 = record[col];
    if (typeof base64 !== 'string') {
      debugLog.push({ col, status: 'skipped', reason: 'No data' });
      continue;
    }

    try {
      const matches = base64.match(/^data:(.+);base64,(.*)$/) ?? [];
      const mimeType = matches[1] || 'image/jpeg';
      const payload = matches[2] || base64;
      const buffer = Buffer.from(payload, 'base64');

      const driveRes = await uploadToDriveWithOAuth(
        tokens,
        buffer,
        mimeType,
        `${col}_${record.id}`,
        folderId
      );

      uploadResults[col] = driveRes.webViewLink ?? driveRes.id ?? null;
      debugLog.push({ col, status: 'success' });
    } catch (err: unknown) {
      allUploaded = false;
      uploadResults[col] = null;
      debugLog.push({ col, status: 'error', error: (err as Error).message });
      console.error(`Error uploading ${col} (id=${record.id}):`, err);
    }
  }

  if (allUploaded) {
    try {
      const { error } = await supabase
        .from('incident_serpo')
        .update({ is_image_uploaded: true, updated_at: new Date().toISOString() })
        .eq('id', record.id);

      if (error) throw error;
      debugLog.push({ update: 'success' });
    } catch (err: unknown) {
      debugLog.push({ update: 'error', error: (err as Error).message });
      console.error(`Error marking uploaded (id=${record.id}):`, err);
    }
  }

  return { id: record.id, uploadResults, debugLog };
}

// === Route Handler ===
export async function POST(request: NextRequest) {
  // 1) ensure env
  for (const key of [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_DRIVE_FOLDER_ID',
  ]) {
    if (!process.env[key]) {
      return NextResponse.json({ error: `Missing ENV: ${key}` }, { status: 500 });
    }
  }

  // 2) parse tokens
  const { tokens } = (await request.json()) as { tokens?: { access_token: string } };
  if (!tokens?.access_token) {
    return NextResponse.json({ error: 'Invalid OAuth tokens' }, { status: 400 });
  }

  // 3) fetch & process in parallel
  let records: IncidentSerpoImageRow[];
  try {
    records = await fetchPendingRecords();
  } catch (err: unknown) {
    console.error('Fetch error:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  if (!records.length) {
    return NextResponse.json({ message: 'No records to sync.' });
  }

  const results = await Promise.all(records.map(r => processSingle(r, tokens)));

  return NextResponse.json({ results });
}
