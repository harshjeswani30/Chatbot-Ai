# 🤖 N8N Workflow Setup Guide for Chatbot

## Overview
This guide will help you set up the n8n workflow that powers your chatbot application. The workflow receives messages from Hasura Actions, processes them through OpenRouter AI, and saves responses back to your database.

## Prerequisites
- ✅ n8n instance running (self-hosted or cloud)
- ✅ OpenRouter API key
- ✅ Hasura GraphQL endpoint and admin secret
- ✅ Hasura Action configured (`sendMessage`)

## Step 1: Import the Workflow

### 1.1 Download the Workflow File
1. Use the `n8n-workflow.json` file from your project
2. This file contains the complete workflow configuration

### 1.2 Import into n8n
1. **Open your n8n instance**
2. **Go to Workflows** in the left sidebar
3. **Click "Import from File"**
4. **Select `n8n-workflow.json`**
5. **Click "Import"**

## Step 2: Configure Environment Variables

### 2.1 Set Required Environment Variables
In your n8n instance, go to **Settings** → **Environment Variables** and add:

```bash
OPENROUTER_API_KEY=your_openrouter_api_key_here
HASURA_GRAPHQL_URL=https://your-subdomain.your-region.nhost.run/v1/graphql
HASURA_ADMIN_SECRET=your_hasura_admin_secret_here
```

### 2.2 Get Your Credentials

#### OpenRouter API Key
1. Go to [openrouter.ai](https://openrouter.ai)
2. Sign up/login and get your API key
3. Copy the API key (starts with `sk-`)

#### Hasura GraphQL URL
1. In your Nhost dashboard, go to **Hasura**
2. Copy the GraphQL endpoint URL
3. Format: `https://your-subdomain.your-region.nhost.run/v1/graphql`

#### Hasura Admin Secret
1. In your Nhost dashboard, go to **Settings** → **API Keys**
2. Copy the **Hasura Admin Secret**

## Step 3: Activate the Workflow

### 3.1 Activate the Workflow
1. **In the workflow view**, click the **"Activate"** button
2. **Wait for activation** (status should show as active)

### 3.2 Get the Webhook URL
1. **Click on the "Webhook Trigger" node**
2. **Copy the webhook URL** (e.g., `https://your-n8n.com/webhook/chatbot-webhook`)
3. **Save this URL** - you'll need it for Hasura Actions

## Step 4: Update Hasura Action

### 4.1 Update Action Handler
1. **Go back to Hasura Console**
2. **Go to Actions** → **sendMessage**
3. **Update the Handler URL** with your n8n webhook URL
4. **Save the changes**

## Step 5: Test the Workflow

### 5.1 Test with Hasura Console
1. **Go to API tab** in Hasura Console
2. **Test the sendMessage action**:

```graphql
mutation TestSendMessage {
  sendMessage(input: {
    chat_id: "your-chat-id-here",
    content: "Hello, how are you?",
    user_id: "your-user-id-here"
  }) {
    success
    message
    bot_response
  }
}
```

### 5.2 Check n8n Execution
1. **Go back to n8n**
2. **Check the "Executions" tab**
3. **You should see successful executions**

## Step 6: Monitor and Debug

### 6.1 Check Workflow Status
- **Green dot**: Workflow is active
- **Red dot**: Workflow has errors
- **Gray dot**: Workflow is inactive

### 6.2 View Execution Details
1. **Click on any execution** in the Executions tab
2. **See the data flow** through each node
3. **Check for errors** in any node

### 6.3 Common Issues and Solutions

#### Issue: "OpenRouter API key invalid"
- **Solution**: Check your `OPENROUTER_API_KEY` environment variable
- **Verify**: The key starts with `sk-` and is correct

#### Issue: "Hasura connection failed"
- **Solution**: Check your `HASURA_GRAPHQL_URL` and `HASURA_ADMIN_SECRET`
- **Verify**: The URL is accessible and secret is correct

#### Issue: "Webhook not receiving data"
- **Solution**: Ensure the workflow is activated
- **Check**: The webhook URL is correct in Hasura Actions

## Step 7: Workflow Details

### 7.1 What Each Node Does

#### Webhook Trigger
- **Purpose**: Receives POST requests from Hasura Actions
- **Input**: JSON with `chat_id`, `content`, `user_id`
- **Headers**: Includes `x-hasura-user-id` for authentication

#### Validate Input
- **Purpose**: Validates input data and user authentication
- **Checks**: Required fields, user authentication, user ownership
- **Output**: Clean, validated data

#### Call OpenRouter
- **Purpose**: Sends user message to AI and gets response
- **Model**: `openai/gpt-3.5-turbo`
- **Output**: AI-generated response

#### Save Bot Response
- **Purpose**: Saves bot response to Hasura database
- **Mutation**: Inserts message with `is_bot: true`
- **Output**: Confirmation of saved message

#### Success Response
- **Purpose**: Returns success response to Hasura
- **Format**: `{"success": true, "message": "...", "bot_response": "..."}`

### 7.2 Data Flow
```
Hasura Action → Webhook → Validate → OpenRouter → Save Response → Success
```

## Step 8: Customization

### 8.1 Change AI Model
1. **Edit the "Call OpenRouter" node**
2. **Change the model value** (e.g., `anthropic/claude-3-haiku`)
3. **Save and reactivate** the workflow

### 8.2 Adjust Response Length
1. **Edit the "Call OpenRouter" node**
2. **Change `max_tokens`** value
3. **Save and reactivate** the workflow

### 8.3 Add More Validation
1. **Edit the "Validate Input" node**
2. **Add custom validation logic**
3. **Save and reactivate** the workflow

## Troubleshooting

### Common Errors

#### "Workflow import failed"
- **Check**: JSON file is valid
- **Solution**: Re-download the workflow file

#### "Environment variables not found"
- **Check**: Variables are set in n8n Settings
- **Solution**: Restart n8n after setting variables

#### "Webhook not accessible"
- **Check**: n8n is running and accessible
- **Solution**: Ensure n8n is publicly accessible or use ngrok

### Debug Mode
1. **Enable debug logging** in n8n settings
2. **Check execution logs** for detailed information
3. **Use the "Test" button** in each node

## Final Checklist

- [ ] Workflow imported successfully
- [ ] Environment variables configured
- [ ] Workflow activated
- [ ] Webhook URL copied
- [ ] Hasura Action updated
- [ ] Test execution successful
- [ ] Bot responses working

---

**Your n8n workflow should now be working with your chatbot application! 🎉**
