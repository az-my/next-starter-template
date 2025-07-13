# Google Sheets Integration Setup

This guide explains how to set up and use the Google Sheets integration to sync incident data from Supabase to Google Sheets.

## 🚀 Features

- **Automated Data Export**: Export incident data from Supabase to Google Sheets
- **OAuth Authentication**: Secure authentication using Google OAuth 2.0
- **Auto Sheet Creation**: Automatically creates sheets if they don't exist
- **Duplicate Prevention**: Tracks synced records to avoid duplicates
- **Flexible Configuration**: Support for custom spreadsheet IDs and sheet names
- **Real-time Sync**: Manual trigger for immediate data synchronization

## 📋 Prerequisites

1. **Google OAuth Setup**: Complete the OAuth setup from `OAUTH_SETUP.md`
2. **Supabase Database**: Ensure your `incident_serpo` table exists
3. **Google Sheets API**: Enabled through Google Cloud Console (included in OAuth setup)

## 🔧 Environment Variables

Add these optional environment variables to your `.env.local` file:

```env
# Google Sheets Configuration (Optional)
GOOGLE_SHEETS_SPREADSHEET_ID=your_google_spreadsheet_id_here
GOOGLE_SHEETS_SHEET_NAME=Incident Data
```

**Note**: If you don't set these environment variables, you can provide the spreadsheet ID and sheet name when making sync requests.

## 🗄️ Database Setup

Run the following SQL migration in your Supabase SQL editor:

```sql
-- Add the is_synced_to_sheet column to track synced records
ALTER TABLE incident_serpo 
ADD COLUMN IF NOT EXISTS is_synced_to_sheet BOOLEAN DEFAULT FALSE;

-- Add an index for better query performance
CREATE INDEX IF NOT EXISTS idx_incident_serpo_sheet_sync 
ON incident_serpo(is_synced_to_sheet) 
WHERE is_synced_to_sheet = FALSE;
```

**Important**: The migration script will automatically fix any column name inconsistencies by removing the incorrect `is_synced_to_sheets` (plural) column and ensuring the correct `is_synced_to_sheet` (singular) column exists.

Or run the provided migration file:
```bash
# Execute the migration file in Supabase
cat supabase-migration-add-sheets-sync.sql
```

## 📊 How to Get Your Spreadsheet ID

1. **Create or Open a Google Spreadsheet**:
   - Go to [Google Sheets](https://sheets.google.com)
   - Create a new spreadsheet or open an existing one

2. **Extract the Spreadsheet ID**:
   - Look at the URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - Copy the `SPREADSHEET_ID` part
   - Example: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

3. **Set Permissions** (Optional):
   - Share the spreadsheet with your Google account
   - Ensure you have edit permissions

## 🔄 Using the Integration

### Method 1: Incident Dashboard (Recommended)

The comprehensive incident dashboard provides a helicopter view of all your data:

1. Navigate to the main page (`/`)
2. Click "Show Incident Dashboard"
3. **View Real-time Statistics**:
   - Total records count
   - Drive sync status (synced/pending images)
   - Sheet sync status (synced/pending records)
   - Active incidents breakdown
4. **Use Advanced Filters**:
   - Search by incident ID, crossing zone, or description
   - Filter by status (active, completed, cancelled)
   - Filter by sync status (fully synced, partially synced, not synced)
5. **Monitor Sync Status**: View detailed table showing sync status for each record
6. **Refresh Data**: Click refresh to get the latest data from Supabase

### Method 2: OAuth Dashboard

1. Navigate to `/dashboard?tab=oauth`
2. Authenticate with Google OAuth
3. Go to the "Data Sync" tab
4. In the "Google Sheets Sync" section:
   - Enter your Spreadsheet ID
   - Enter the Sheet Name (default: "Incident Data")
   - Click "Sync to Sheets"

### Method 3: Main Page Component

1. Go to the main page (`/`)
2. Scroll down to the "Google Sheets Integration" section
3. Authenticate with Google if not already authenticated
4. Enter your Spreadsheet ID and Sheet Name
5. Click "Sync to Google Sheets"

### Method 4: Direct API Call

```javascript
const response = await fetch('/api/incident-serpo-sync-sheets', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    tokens: { access_token: 'your_access_token', refresh_token: 'your_refresh_token' },
    spreadsheetId: 'your_spreadsheet_id',
    sheetName: 'Incident Data' // Optional, defaults to 'Incident Data'
  })
});

const result = await response.json();
console.log(result);
```

## 📈 Data Structure

The integration exports the following columns from the `incident_serpo` table to Google Sheets:

| Column | Description |
|--------|-------------|
| ID | Unique record identifier (UUID) |
| Incident ID | Unique incident identifier |
| Crossing Zone | Location/zone where incident occurred |
| Foto Odo Awal | Initial odometer photo |
| Foto Tim Awal | Initial team photo |
| Foto Odo Akhir | Final odometer photo |
| Foto Tim Akhir | Final team photo |
| Started At | Incident start timestamp |
| Stopped At | Incident end timestamp |
| Duration | Calculated incident duration |
| Status | Current status (active, completed, cancelled) |
| Description | Detailed incident description |
| Created By | User who created the record |
| Created At | Record creation timestamp |
| Updated At | Last update timestamp |
| Drive Sync Status | Whether images are uploaded to Google Drive |
| Sheet Sync Status | Confirmation of Google Sheets sync |

## 🔍 API Response Format

### Success Response
```json
{
  "message": "Successfully synced 5 records to Google Sheets",
  "spreadsheetId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
  "sheetName": "Incident Data",
  "recordCount": 5,
  "range": "Incident Data!A2:I6",
  "updatedCells": 45
}
```

### Error Response
```json
{
  "error": "No spreadsheet ID provided. Please provide a spreadsheetId in the request body or set GOOGLE_SHEETS_SPREADSHEET_ID environment variable."
}
```

## 🛠️ Troubleshooting

### Common Issues

1. **"Missing or invalid OAuth tokens"**
   - Ensure you're authenticated with Google OAuth
   - Check if tokens have expired and need refresh

2. **"No spreadsheet ID provided"**
   - Provide a valid spreadsheet ID in the request
   - Or set the `GOOGLE_SHEETS_SPREADSHEET_ID` environment variable

3. **"Failed to access or create spreadsheet"**
   - Verify the spreadsheet ID is correct
   - Ensure you have edit permissions on the spreadsheet
   - Check if the spreadsheet exists and is accessible

4. **"No new records to sync"**
   - All records have already been synced (`is_synced_to_sheet = true`)
   - Add new records to the database or reset sync status

5. **"Column incident_serpo.is_synced_to_sheets does not exist"**
   - Run the updated migration script to fix column name inconsistencies
   - The correct column name is `is_synced_to_sheet` (singular)

### Reset Sync Status

To re-sync all records (useful for testing):

```sql
UPDATE incident_serpo 
SET is_synced_to_sheet = FALSE 
WHERE is_synced_to_sheet = TRUE;
```

## 🔐 Security Considerations

- OAuth tokens are handled securely and refreshed automatically
- Spreadsheet access is limited to the authenticated user's permissions
- No sensitive data is logged in the application
- Environment variables should be kept secure

## 📝 Customization

You can customize the integration by:

1. **Modifying Data Fields**: Edit the API route to include/exclude specific columns
2. **Custom Sheet Formatting**: Add formatting logic in the API route
3. **Batch Size**: Adjust the limit in the Supabase query (currently 100 records)
4. **Sync Conditions**: Modify the query conditions for which records to sync

## 🎯 Next Steps

- Set up automated sync using cron jobs or webhooks
- Add data validation and formatting
- Implement real-time sync using Supabase triggers
- Add support for multiple spreadsheets
- Create dashboard analytics for sync operations