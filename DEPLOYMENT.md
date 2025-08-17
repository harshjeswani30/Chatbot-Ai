# 🚀 Deployment Guide for Chatbot Application

## Prerequisites

Before deploying, make sure you have:

1. ✅ **Project built successfully** - `pnpm run build` works
2. ✅ **Nhost account** - Create at [nhost.io](https://nhost.io)
3. ✅ **n8n instance** - Self-hosted or cloud version
4. ✅ **OpenRouter API key** - Get from [openrouter.ai](https://openrouter.ai)

## Step 1: Backend Setup (Nhost + Hasura)

### 1.1 Create Nhost Project
1. Go to [nhost.io](https://nhost.io) and sign up/login
2. Click "Create New Project"
3. Choose a subdomain and region
4. Wait for project to be ready (usually 2-3 minutes)

### 1.2 Database Setup (IMPORTANT: Use Simple Schema)
1. In Nhost Console, go to **Database** → **SQL Editor**
2. **IMPORTANT**: Use the contents of `database-schema-simple.sql` (NOT `database-schema.sql`)
3. Copy and paste the simple schema content
4. Click **Run** to execute the SQL commands
5. This creates:
   - `chats` table (without complex RLS)
   - `messages` table (without complex RLS)
   - Proper indexes for performance

**Why Simple Schema?**
- The complex RLS policies use `auth.uid()` which doesn't exist in Nhost's database
- Nhost handles authentication through Hasura, not directly in PostgreSQL
- We'll set up permissions in Hasura instead

### 1.3 Hasura Setup (CRITICAL STEP)
**📋 IMPORTANT**: Follow the detailed guide in `HASURA-SETUP.md` for complete Hasura configuration.

This includes:
- Setting up table permissions for `user` role
- Creating table relationships
- Setting up the `sendMessage` action
- Configuring custom types
- Enabling subscriptions

**⚠️ Don't skip this step** - It's essential for the application to work properly.

### 1.4 Quick Hasura Overview
The key permissions you need to set:

**Chats Table**:
- Users can only see/insert/update/delete their own chats
- Filter: `{"user_id": {"_eq": "X-Hasura-User-Id"}}`

**Messages Table**:
- Users can only see/insert messages in their own chats
- Filter: `{"chat": {"user_id": {"_eq": "X-Hasura-User-Id"}}}`

## Step 2: n8n Workflow Setup

### 2.1 Import Workflow
1. In your n8n instance, go to **Workflows**
2. Click **Import from File**
3. Select `n8n-workflow.json` from your project
4. The workflow will be imported with all nodes

### 2.2 Configure Environment Variables
In n8n, set these environment variables:
```bash
OPENROUTER_API_KEY=your_openrouter_api_key_here
HASURA_GRAPHQL_URL=https://your-subdomain.your-region.nhost.run/v1/graphql
HASURA_ADMIN_SECRET=your_hasura_admin_secret_here
```

### 2.3 Activate Workflow
1. Click **Activate** on the workflow
2. Copy the webhook URL (e.g., `https://your-n8n.com/webhook/chatbot-webhook`)
3. Update your Hasura Action handler with this URL

## Step 3: Frontend Configuration

### 3.1 Environment Variables
1. Copy `env.example` to `.env`
2. Update with your Nhost credentials:
```env
VITE_NHOST_SUBDOMAIN=your-subdomain
VITE_NHOST_REGION=your-region
VITE_HASURA_GRAPHQL_URL=https://your-subdomain.your-region.nhost.run/v1/graphql
```

### 3.2 Test Locally
```bash
pnpm run dev
```
Open http://localhost:3000 to test the application

## Step 4: Deploy to Netlify

### 4.1 Connect Repository
1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com) and sign up/login
3. Click **New site from Git**
4. Connect your GitHub repository

### 4.2 Build Settings
Configure these build settings in Netlify:
- **Build command**: `pnpm run build`
- **Publish directory**: `dist`
- **Node version**: `18` (or higher)

### 4.3 Environment Variables
In Netlify dashboard, add these environment variables:
- `VITE_NHOST_SUBDOMAIN`
- `VITE_NHOST_REGION`
- `VITE_HASURA_GRAPHQL_URL`

### 4.4 Deploy
1. Click **Deploy site**
2. Wait for build to complete
3. Your app will be live at a Netlify URL

## Step 5: Test the Application

### 5.1 Authentication Test
1. Open your deployed app
2. Try to sign up with a new email
3. Verify you can sign in

### 5.2 Chat Functionality Test
1. Create a new chat
2. Send a message
3. Verify the chatbot responds
4. Check real-time updates

## Troubleshooting

### Common Issues

#### 1. Build Failures
- Check Node.js version (use 18+)
- Ensure all dependencies are installed
- Verify TypeScript compilation

#### 2. Authentication Errors
- Check Nhost subdomain and region
- Verify environment variables are set
- Check browser console for errors

#### 3. GraphQL Errors
- **CRITICAL**: Follow `HASURA-SETUP.md` completely
- Ensure Hasura permissions are set correctly
- Check that `sendMessage` action is configured
- Verify table relationships are set up

#### 4. n8n Workflow Issues
- Verify webhook URL in Hasura Actions
- Check environment variables in n8n
- Ensure OpenRouter API key is valid

#### 5. Database Schema Issues
- **IMPORTANT**: Use `database-schema-simple.sql`, not `database-schema.sql`
- The simple schema avoids `auth.uid()` function issues
- Set up permissions in Hasura instead of PostgreSQL RLS

#### 6. Permission Denied Errors
- **Most common issue**: Hasura permissions not set up correctly
- Follow `HASURA-SETUP.md` step by step
- Check that `user` role has proper permissions
- Verify `X-Hasura-User-Id` header is being sent

### Debug Mode
Enable debug logging by adding to your environment:
```env
DEBUG=true
```

## Final Checklist

Before submitting your assignment:

- [ ] Application builds successfully
- [ ] Authentication works (sign up/sign in)
- [ ] **Database schema created successfully** (using simple version)
- [ ] **Hasura permissions configured** (followed HASURA-SETUP.md completely)
- [ ] Chat creation works
- [ ] Message sending works
- [ ] Chatbot responds via OpenRouter
- [ ] Real-time updates work
- [ ] Deployed to Netlify
- [ ] All environment variables configured
- [ ] n8n workflow active and working

## Submission Format

Submit in this format:
```
Name: [Your Name]
Contact: [Your Phone Number]
Deployed: [Your Netlify URL]
```

## Support

If you encounter issues:
1. Check the troubleshooting section
2. **CRITICAL**: Follow `HASURA-SETUP.md` completely
3. Review Nhost and n8n documentation
4. Check browser console for errors
5. Verify all environment variables are set correctly
6. **Use the simple database schema** to avoid auth.uid() errors

## Quick Reference Files

- `database-schema-simple.sql` - Use this for database setup
- `HASURA-SETUP.md` - **CRITICAL**: Complete Hasura configuration guide
- `n8n-workflow.json` - n8n workflow configuration
- `env.example` - Environment variables template

---

**Good luck with your internship assessment! 🎉**
