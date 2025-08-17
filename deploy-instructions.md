# 🚀 Netlify Deployment Instructions

## **Step 1: Build Your App**
```bash
pnpm run build
```

## **Step 2: Deploy to Netlify**

### **Option A: Drag & Drop (Easiest)**
1. Go to [netlify.com](https://netlify.com)
2. Sign up/Login with GitHub
3. Drag the `dist` folder to the Netlify dashboard
4. Your app will be deployed instantly!

### **Option B: Git Integration (Recommended)**
1. Push your code to GitHub
2. Connect your GitHub repo to Netlify
3. Netlify will auto-deploy on every push

## **Step 3: Get Your Netlify URL**
- Netlify will give you a random URL like: `https://random-name-123456.netlify.app`
- You can customize this in the site settings

## **Step 4: Submit Your Assignment**
```
Name: [Your Name]
Contact: [Your Contact Number]
Deployed: [Your Netlify URL]
```

## **Important Notes:**
- Your app needs backend services (Nhost, Hasura) to work fully
- The frontend will deploy but chat functionality requires backend
- Consider using environment variables for production URLs
