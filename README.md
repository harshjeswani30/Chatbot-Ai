# Chatbot Application

A simple and modern chatbot application built with React, Nhost Auth, Hasura GraphQL, and n8n workflow automation.

## 🚀 Features

- **Email Authentication**: Sign up and sign in using Nhost Auth
- **Real-time Chat**: Create conversations and send messages
- **AI Chatbot**: Powered by OpenRouter API through n8n workflows
- **GraphQL Only**: All communication uses GraphQL queries, mutations, and subscriptions
- **Secure**: Row-level security and proper user permissions
- **Modern UI**: Clean, responsive design with Tailwind CSS

## 🏗️ Architecture

```
Frontend (React) → Hasura GraphQL → n8n Workflow → OpenRouter API
     ↓                ↓                ↓
  Nhost Auth    Database (PostgreSQL)  Save Bot Response
```

## 📋 Prerequisites

- Node.js 16+ and pnpm
- Nhost account (free tier available)
- n8n instance (self-hosted or cloud)
- OpenRouter API key (free tier available)

## 🛠️ Setup Instructions

### 1. Backend Setup (Nhost + Hasura)

1. **Create Nhost Project**
   - Go to [nhost.io](https://nhost.io) and create a new project
   - Note your subdomain and region

2. **Database Setup**
   - In Nhost Console, go to Database → SQL Editor
   - Run the SQL commands from `database-schema.sql`
   - This creates the chats and messages tables with RLS policies

3. **Hasura Actions Setup**
   - In Nhost Console, go to Hasura → Actions
   - Create the `sendMessage` action using the configuration from `hasura-actions.yaml`
   - Set the webhook URL to your n8n workflow endpoint

### 2. n8n Workflow Setup

1. **Import Workflow**
   - In your n8n instance, import the workflow from `n8n-workflow.json`
   - Set environment variables:
     - `OPENROUTER_API_KEY`: Your OpenRouter API key
     - `HASURA_GRAPHQL_URL`: Your Hasura GraphQL endpoint
     - `HASURA_ADMIN_SECRET`: Your Hasura admin secret

2. **Activate Workflow**
   - Activate the workflow to get the webhook URL
   - Copy this URL and update your Hasura Action handler

### 3. Frontend Setup

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Environment Configuration**
   - Copy `env.example` to `.env`
   - Update with your Nhost credentials:
   ```env
   VITE_NHOST_SUBDOMAIN=your-subdomain
   VITE_NHOST_REGION=your-region
   VITE_HASURA_GRAPHQL_URL=https://your-subdomain.your-region.nhost.run/v1/graphql
   ```

3. **Run Development Server**
   ```bash
   pnpm run dev
   ```

4. **Build for Production**
   ```bash
   pnpm run build
   ```

## 🔐 Security Features

- **Row-Level Security (RLS)**: Users can only access their own data
- **Authentication Required**: All features require valid user session
- **GraphQL Permissions**: Proper insert, select, update, delete permissions
- **Secure API Calls**: External APIs only accessible through n8n workflows

## 📱 Usage

1. **Sign Up/In**: Create an account or sign in with email
2. **Create Chat**: Click the + button to start a new conversation
3. **Send Messages**: Type your message and press Enter
4. **AI Response**: The chatbot will automatically respond using OpenRouter
5. **Real-time Updates**: Messages appear instantly with GraphQL subscriptions

## 🚀 Deployment

### Netlify Deployment

1. **Connect Repository**: Connect your GitHub repo to Netlify
2. **Build Settings**:
   - Build command: `pnpm run build`
   - Publish directory: `dist`
3. **Environment Variables**: Add your environment variables in Netlify dashboard
4. **Deploy**: Your app will be automatically deployed

### Environment Variables for Production

Make sure to set these in your deployment platform:
- `VITE_NHOST_SUBDOMAIN`
- `VITE_NHOST_REGION`
- `VITE_HASURA_GRAPHQL_URL`

## 🔧 Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check Nhost subdomain and region in environment variables
   - Verify user exists in Nhost Auth

2. **GraphQL Errors**
   - Ensure Hasura Actions are properly configured
   - Check database permissions and RLS policies

3. **n8n Workflow Issues**
   - Verify webhook URL in Hasura Actions
   - Check environment variables in n8n
   - Ensure OpenRouter API key is valid

### Debug Mode

Enable debug logging by adding to your environment:
```env
DEBUG=true
```

## 📚 API Reference

### GraphQL Queries

- `GetChats`: Fetch user's chat list
- `GetMessages`: Get messages for a specific chat
- `GetChatInfo`: Get chat details

### GraphQL Mutations

- `CreateChat`: Create new chat conversation
- `InsertMessage`: Save user message
- `SendMessageAction`: Trigger chatbot workflow
- `DeleteChat`: Remove chat conversation

### GraphQL Subscriptions

- `OnMessageAdded`: Real-time message updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter any issues:

1. Check the troubleshooting section
2. Review Nhost and n8n documentation
3. Open an issue in the repository
4. Contact the development team

## 🎯 Next Steps

Potential improvements for future versions:

- [ ] File upload support
- [ ] Voice messages
- [ ] Multiple chatbot personalities
- [ ] Chat history export
- [ ] User profiles and avatars
- [ ] Group chat functionality
- [ ] Message reactions
- [ ] Advanced AI model selection
