// src/app/api/incident-serpo-sync-sheets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
import { OAuthTokens } from '@/lib/oauthService';

export const runtime = 'nodejs';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Define the incident serpo data structure

// Default spreadsheet and sheet configuration
const DEFAULT_SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const DEFAULT_SHEET_NAME = process.env.GOOGLE_SHEETS_SHEET_NAME || 'Incident Data';

export async function POST(req: NextRequest) {
  try {
    // Check required environment variables
    const requiredEnvVars = [
      'SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      return NextResponse.json(
        { error: `Missing required environment variables: ${missingVars.join(', ')}. Please check your .env.local file.` },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { tokens, spreadsheetId, sheetName } = body as {
      tokens?: OAuthTokens;
      spreadsheetId?: string;
      sheetName?: string;
    };

    if (!tokens?.access_token) {
      return NextResponse.json(
        { error: 'Missing or invalid OAuth tokens.' },
        { status: 400 }
      );
    }

    // Use provided spreadsheet ID or default
    const targetSpreadsheetId = spreadsheetId || DEFAULT_SPREADSHEET_ID;
    if (!targetSpreadsheetId) {
      return NextResponse.json(
        { error: 'No spreadsheet ID provided. Please provide a spreadsheetId in the request body or set GOOGLE_SHEETS_SPREADSHEET_ID environment variable.' },
        { status: 400 }
      );
    }

    const targetSheetName = sheetName || DEFAULT_SHEET_NAME;

    // Initialize Google Sheets API with OAuth tokens
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    
    oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token
    });

    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    // Fetch incident data from Supabase
    const { data, error } = await supabase
      .from('incident_serpo')
      .select('*')
      .eq('is_synced_to_sheet', false)
      .limit(100); // Limit to prevent overwhelming the API

    if (error) throw error;
    if (!data || data.length === 0) {
      return NextResponse.json({ message: 'No new records to sync to Google Sheets.' });
    }

    // Check if the sheet exists, create if it doesn't
    try {
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: targetSpreadsheetId
      });
      
      const sheetExists = spreadsheet.data.sheets?.some(
        sheet => sheet.properties?.title === targetSheetName
      );

      if (!sheetExists) {
        // Create the sheet
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: targetSpreadsheetId,
          requestBody: {
            requests: [{
              addSheet: {
                properties: {
                  title: targetSheetName
                }
              }
            }]
          }
        });

        // Add headers
        const headers = [
          'ID', 'Incident ID', 'Crossing Zone', 'Foto Odo Awal', 'Foto Tim Awal',
          'Foto Odo Akhir', 'Foto Tim Akhir', 'Started At', 'Stopped At',
          'Duration', 'Status', 'Description', 'Created By', 'Created At', 'Updated At',
          'Drive Sync Status', 'Sheet Sync Status'
        ];
        
        await sheets.spreadsheets.values.update({
          spreadsheetId: targetSpreadsheetId,
          range: `${targetSheetName}!A1:Q1`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [headers]
          }
        });
      }
    } catch (err: unknown) {
      return NextResponse.json(
        { error: `Failed to access or create spreadsheet: ${err instanceof Error ? err.message : String(err)}` },
        { status: 400 }
      );
    }

    // Prepare data for Google Sheets
    const values = data.map(record => [
      record.id,
      record.id_incident,
      record.crossing_zona,
      record.foto_odo_awal || '',
      record.foto_tim_awal || '',
      record.foto_odo_akhir || '',
      record.foto_tim_akhir || '',
      record.started_at || '',
      record.stopped_at || '',
      record.duration || '',
      record.status,
      record.description || '',
      record.created_by || '',
      record.created_at,
      record.updated_at,
      record.is_image_uploaded ? 'Synced' : 'Pending',
      'Synced'
    ]);

    // Get the next available row
    const existingData = await sheets.spreadsheets.values.get({
      spreadsheetId: targetSpreadsheetId,
      range: `${targetSheetName}!A:A`
    });
    
    const nextRow = (existingData.data.values?.length || 0) + 1;
    const range = `${targetSheetName}!A${nextRow}:Q${nextRow + values.length - 1}`;

    // Insert data into Google Sheets
    const appendResult = await sheets.spreadsheets.values.update({
      spreadsheetId: targetSpreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: {
        values
      }
    });

    // Update Supabase records to mark as synced
    const recordIds = data.map(record => record.id);
    const { error: updateError } = await supabase
      .from('incident_serpo')
      .update({
        is_synced_to_sheet: true,
        updated_at: new Date().toISOString()
      })
      .in('id', recordIds);

    if (updateError) {
      console.error('Error updating sync status:', updateError);
    }

    return NextResponse.json({
      message: `Successfully synced ${data.length} records to Google Sheets`,
      spreadsheetId: targetSpreadsheetId,
      sheetName: targetSheetName,
      recordCount: data.length,
      range,
      updatedCells: appendResult.data.updatedCells
    });

  } catch (e: unknown) {
    console.error('Error syncing to Google Sheets:', e);
    return NextResponse.json(
      { error: `Failed to sync to Google Sheets: ${e instanceof Error ? e.message : String(e)}` },
      { status: 500 }
    );
  }
}