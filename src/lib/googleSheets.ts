import { google } from 'googleapis'
import path from 'path'
import fs from 'fs'

// Path to your service account key file
const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), 'service-account.json')

export function getSheetsClient() {
  const credentials = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'))
  const scopes = ['https://www.googleapis.com/auth/spreadsheets']
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes,
  })
  return google.sheets({ version: 'v4', auth })
}

// Example usage (server-side only):
// const sheets = getSheetsClient()
// const res = await sheets.spreadsheets.values.get({
//   spreadsheetId: 'your-spreadsheet-id',
//   range: 'Sheet1!A1:D5',
// })
// console.log(res.data.values)
