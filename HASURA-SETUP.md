# 🔧 Complete Hasura Setup Guide for Nhost (FIXED VERSION)

## Overview
This guide will walk you through setting up all the necessary permissions and configurations in Hasura to make your chatbot application work properly. This is the **FIXED VERSION** that resolves the "Failed to fetch" error.

## Prerequisites
- ✅ Nhost project created
- ✅ Database schema created (using `database-schema-simple.sql`)
- ✅ Basic tables: `chats` and `messages`

## Step 1: Enable Hasura Console

1. Go to your Nhost project dashboard
2. Click on **Hasura** in the left sidebar
3. Click **Open Hasura Console**
4. You'll see the Hasura interface

## Step 2: Set Up Table Permissions

### 2.1 Chats Table Permissions

1. In Hasura Console, go to **Data** → **chats** table
2. Click on **Permissions** tab
3. Click **Add permissions for role: user**

#### Select Permission
- **Row select permissions**: `{"user_id": {"_eq": "X-Hasura-User-Id"}}`
- **Column select permissions**: Select all columns (id, title, user_id, created_at, updated_at)

#### Insert Permission
- **Row insert permissions**: `{"user_id": {"_eq": "X-Hasura-User-Id"}}`
- **Column insert permissions**: Select only `title` and `user_id` (id and timestamps are auto-generated)

#### Update Permission
- **Row update permissions**: `{"user_id": {"_eq": "X-Hasura-User-Id"}}`
- **Column update permissions**: Select only `title` and `updated_at`

#### Delete Permission
- **Row delete permissions**: `{"user_id": {"_eq": "X-Hasura-User-Id"}}`

### 2.2 Messages Table Permissions

1. Go to **Data** → **messages** table
2. Click on **Permissions** tab
3. Click **Add permissions for role: user**

#### Select Permission
- **Row select permissions**: 
```json
{
  "chat": {
    "user_id": {
      "_eq": "X-Hasura-User-Id"
    }
  }
}
```
- **Column select permissions**: Select all columns

#### Insert Permission
- **Row insert permissions**: 
```json
{
  "chat": {
    "user_id": {
      "_eq": "X-Hasura-User-Id"
    }
  }
}
```
- **Column insert permissions**: Select `chat_id`, `content`, `is_bot`, and `user_id`

## Step 3: Set Up Table Relationships

### 3.1 Chats Table Relationships

1. Go to **Data** → **chats** table
2. Click on **Relationships** tab
3. Add these relationships:

#### Array Relationship: messages
- **Relationship name**: `messages`
- **Type**: Array relationship
- **Using**: Foreign key constraint
- **Foreign key constraint**: `messages_chat_id_fkey`
- **Column mapping**: `id` → `chat_id`

### 3.2 Messages Table Relationships

1. Go to **Data** → **messages** table
2. Click on **Relationships** tab
3. Add these relationships:

#### Object Relationship: chat
- **Relationship name**: `chat`
- **Type**: Object relationship
- **Using**: Foreign key constraint
- **Foreign key constraint**: `messages_chat_id_fkey`
- **Column mapping**: `chat_id` → `id`

## Step 4: Create Hasura Action (CRITICAL - FIXED VERSION)

### 4.1 Delete Existing Action (if any)
1. Go to **Actions** tab in Hasura Console
2. If `sendMessage` action exists, **delete it completely**
3. We'll recreate it with the correct syntax

### 4.2 Create Custom Types FIRST (IMPORTANT!)

**⚠️ CRITICAL: You MUST create custom types BEFORE creating the action!**

1. Go to **Custom Types** tab
2. **Delete any existing** `sendMessageInput` and `sendMessageOutput` types
3. **Add Input Object**:
   - **Name**: `sendMessageInput`
   - **Fields**: Copy and paste this **EXACT** syntax:
   ```graphql
   input sendMessageInput {
     chat_id: uuid!
     content: String!
     user_id: uuid!
   }
   ```

4. **Add Object**:
   - **Name**: `sendMessageOutput`
   - **Fields**: Copy and paste this **EXACT** syntax:
   ```graphql
   type sendMessageOutput {
     success: Boolean!
     message: String!
     bot_response: String
   }
   ```

5. **Click "Save"** to save the custom types

### 4.3 Create the Action (CRITICAL!)

1. Go to **Actions** tab in Hasura Console
2. Click **Create Action**
3. Fill in **EXACTLY** as shown:

**Action Name**: `sendMessage`

**Action Definition**: Copy and paste this **EXACT** syntax:
```graphql
type Mutation {
  sendMessage(
    input: sendMessageInput!
  ): sendMessageOutput
}
```

**Action Type**: `synchronous`

**Handler**: `https://your-n8n-webhook-url-here` (replace with your actual n8n webhook URL)

**Forward client headers**: ✅ **Check this box**

**Headers**: Add manually:
- Name: `x-hasura-admin-secret`
- Value: `your_hasura_admin_secret_here` (replace with your actual admin secret)

4. **Click "Create"** to create the action

### 4.4 Action Permissions (CRITICAL!)

1. Click **Permissions** tab for the `sendMessage` action
2. Click **Add permissions for role: user**
3. Set the permission check with this **EXACT** JSON:
```json
{
  "input": {
    "chat_id": {
      "_exists": {
        "_table": {
          "schema": "public",
          "name": "chats"
        },
        "_where": {
          "id": "$input.chat_id",
          "user_id": "X-Hasura-User-Id"
        }
      }
    }
  }
}
```

## Step 5: Test the Action

### 5.1 Test with GraphQL Playground

1. Go to **API** tab in Hasura Console
2. **Test the sendMessage action** with this query:

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

**Variables**: Replace with actual values:
```json
{
  "chat_id": "actual-chat-uuid",
  "content": "Test message",
  "user_id": "actual-user-uuid"
}
```

### 5.2 Check for Errors

If you get errors, check:
1. **Custom types are saved** before creating action
2. **Action definition syntax** is exactly as shown
3. **Handler URL** is correct (your n8n webhook URL)
4. **Admin secret** is correct
5. **Permissions** are set correctly

## Step 6: Enable Subscriptions

### Option 1: Check API Settings
1. Go to **Settings** → **API** (look for a different Settings tab)
2. Look for **"Enable GraphQL subscriptions"** or **"Subscriptions"** option
3. Make sure it's checked/enabled
4. Save settings

### Option 2: Check if Already Enabled
**Note**: In newer versions of Nhost/Hasura, subscriptions might be enabled by default. You can verify this by:
1. Going to **API** tab
2. Trying to run a subscription query
3. If it works, subscriptions are already enabled

## Step 7: Verify Everything Works

### 7.1 Check Permissions
- Users can only see their own chats
- Users can only insert messages in their own chats
- Users can only update/delete their own chats

### 7.2 Check Relationships
- Chat → Messages relationship works
- Message → Chat relationship works

### 7.3 Check Actions
- `sendMessage` action is accessible to authenticated users
- Action properly validates user ownership of chat

## Troubleshooting

### Common Issues

#### 1. "Failed to fetch" Error
**This usually means the action definition is incorrect.**
- **Solution**: Make sure custom types are created BEFORE the action
- **Check**: Action definition syntax matches exactly what's shown above
- **Verify**: Handler URL is correct and accessible

#### 2. Permission Denied Errors
- Check that user role has proper permissions
- Verify `X-Hasura-User-Id` header is being sent
- Check permission filters are correct

#### 3. Action Definition Issues
If you get syntax errors:
1. **Use the correct GraphQL type format** shown above
2. Make sure the return type (`sendMessageOutput`) is defined in Custom Types
3. Verify the handler URL is correct
4. Check that headers are properly configured

### Debug Tips

1. **Check Console Logs**: Look for permission denied messages
2. **Test with Admin**: Use admin role to test if it's a permission issue
3. **Verify Headers**: Ensure `X-Hasura-User-Id` is being sent from frontend
4. **Check Relationships**: Verify foreign keys and relationships are properly set up
5. **Action Syntax**: Use the exact GraphQL syntax shown above

## Final Checklist

- [ ] Chats table permissions configured
- [ ] Messages table permissions configured
- [ ] Table relationships set up
- [ ] Custom types created and saved
- [ ] Hasura Action created with correct syntax
- [ ] Action permissions configured
- [ ] Subscriptions enabled
- [ ] All permissions tested
- [ ] No permission denied errors
- [ ] Action test successful

---

**Your Hasura setup should now be complete and working! 🎉**

**Key Points to Remember:**
1. **Custom types MUST be created BEFORE the action**
2. **Use EXACT syntax** shown above
3. **Action definition** must match the GraphQL format exactly
4. **Handler URL** must be your actual n8n webhook URL
5. **Test the action** before proceeding to frontend
