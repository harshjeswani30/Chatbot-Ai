# OAuth Setup Guide for Nhost

## **GitHub OAuth Setup**

### 1. Create GitHub OAuth App
1. Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: Your Chatbot App Name
   - **Homepage URL**: `https://your-app.netlify.app` (your Netlify URL)
   - **Authorization callback URL**: `https://your-subdomain.nhost.run/v1/auth/signin/provider/github/callback`

### 2. Configure in Nhost Dashboard
1. Go to your Nhost dashboard
2. Navigate to **Authentication > Providers**
3. Enable **GitHub** provider
4. Enter your GitHub OAuth App credentials:
   - **Client ID**: From GitHub OAuth App
   - **Client Secret**: From GitHub OAuth App

## **Google OAuth Setup**

### 1. Create Google OAuth App
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API** and **Google OAuth2 API**
4. Go to **Credentials > Create Credentials > OAuth 2.0 Client IDs**
5. Configure OAuth consent screen
6. Set **Authorized redirect URIs**:
   - `https://your-subdomain.nhost.run/v1/auth/signin/provider/google/callback`

### 2. Configure in Nhost Dashboard
1. Go to your Nhost dashboard
2. Navigate to **Authentication > Providers**
3. Enable **Google** provider
4. Enter your Google OAuth App credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console

## **Important Notes**

- **Redirect URLs**: Must match exactly between your OAuth provider and Nhost
- **Environment**: Use your actual Nhost subdomain in the callback URLs
- **Security**: Never commit OAuth secrets to your code repository
- **Testing**: Test OAuth flow in development before deploying

## **Troubleshooting**

- **"Invalid redirect URI"**: Check that callback URLs match exactly
- **"Provider not configured"**: Ensure provider is enabled in Nhost dashboard
- **"OAuth error"**: Verify client ID and secret are correct
- **"Callback failed"**: Check network connectivity and URL format
