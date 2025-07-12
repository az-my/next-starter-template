# Google OAuth Setup Guide

This guide will help you set up Google OAuth for the Drive upload functionality.

## 1. Google Cloud Console Setup

### Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"

### Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Add authorized redirect URIs:
   - **Development**: `http://localhost:3000/drive-upload`
   - **Production**: `https://your-domain.com/drive-upload`
5. Save the Client ID and Client Secret

## 2. Environment Variables

Add these environment variables to your Cloudflare Workers secrets:

```bash
# Required for OAuth
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here

# Optional - specific folder ID for uploads
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here

# Required for production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Setting Cloudflare Workers Secrets

```bash
# Set secrets using Wrangler CLI
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put GOOGLE_DRIVE_FOLDER_ID
wrangler secret put NEXT_PUBLIC_APP_URL
```

## 3. Google Drive Folder Setup (Optional)

1. Create a folder in Google Drive where files will be uploaded
2. Right-click the folder and select "Share"
3. Copy the folder ID from the URL (the long string after `/folders/`)
4. Set this as `GOOGLE_DRIVE_FOLDER_ID` in your environment variables

## 4. Testing the Setup

1. Deploy your application to Cloudflare Workers
2. Navigate to `/drive-upload`
3. Click "Login with Google"
4. Complete the OAuth flow
5. Try uploading a file

## 5. Troubleshooting

### Common Issues

**"localhost is blocked" error:**
- Make sure you've added the correct redirect URIs in Google Cloud Console
- For development: `http://localhost:3000/drive-upload`
- For production: `https://your-domain.com/drive-upload`

**"Google client not found" error:**
- Verify your environment variables are set correctly in Cloudflare Workers
- Check that the secrets are properly configured

**"Invalid redirect URI" error:**
- Ensure the redirect URI in your Google Cloud Console matches exactly
- Check that `NEXT_PUBLIC_APP_URL` is set correctly for production

**"Missing required environment variable" error:**
- Verify all required environment variables are set
- Check the Cloudflare Workers dashboard for your secrets

### Debug Mode

The application includes debug logging. Check your Cloudflare Workers logs for:
- OAuth configuration details
- Environment variable validation
- Error messages during the OAuth flow

## 6. Security Considerations

- Never commit your `GOOGLE_CLIENT_SECRET` to version control
- Use environment variables for all sensitive configuration
- The OAuth flow includes state parameter validation for security
- Tokens are stored in localStorage (consider implementing server-side token storage for production)

## 7. Production Deployment

1. Set all environment variables in Cloudflare Workers
2. Update your Google Cloud Console redirect URIs to use your production domain
3. Test the OAuth flow in production
4. Monitor logs for any issues

## Support

If you encounter issues:
1. Check the Cloudflare Workers logs
2. Verify your Google Cloud Console configuration
3. Ensure all environment variables are set correctly
4. Test with a simple file upload first 