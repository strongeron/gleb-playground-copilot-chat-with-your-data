# Bolt.new Deployment Guide

This guide shows you how to safely deploy your Copilot Chat application to Bolt.new while keeping your API keys secure.

## 🔐 **Security First Approach**

### **Why Bolt.new is Great for API Keys:**

1. **Secure Environment Variables**: Bolt.new provides a secure way to add environment variables
2. **No Code Exposure**: Keys are never exposed in your codebase
3. **Easy Management**: Update keys without redeploying code
4. **Team Collaboration**: Share projects without sharing keys

## 🚀 **Deployment Steps**

### **Step 1: Prepare Your Project**

Your project is already prepared with:
- ✅ `bolt.json` configuration
- ✅ Proper `.gitignore` (excludes `.env.local`)
- ✅ `env.example` for reference

### **Step 2: Deploy to Bolt.new**

1. **Go to [Bolt.new](https://bolt.new)**
2. **Import your GitHub repository** (after pushing to GitHub)
3. **Bolt.new will automatically detect your Next.js project**

### **Step 3: Add Environment Variables**

Once deployed, add your API keys through Bolt.new's dashboard:

1. **Go to your project dashboard**
2. **Find "Environment Variables" section**
3. **Add your keys:**

```bash
OPENAI_API_KEY=your_openai_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

### **Step 4: Deploy**

1. **Click "Deploy"**
2. **Bolt.new will build and deploy your app**
3. **Your app will be live with working API keys!**

## 🔒 **Security Benefits**

### **What Bolt.new Provides:**

- ✅ **Encrypted Environment Variables**: Keys are encrypted at rest
- ✅ **No Code Exposure**: Keys never appear in your repository
- ✅ **Easy Updates**: Change keys without code changes
- ✅ **Team Safety**: Share code without sharing keys
- ✅ **Audit Trail**: Track who accessed environment variables

### **Your Current Security Setup:**

```
├── .env.local          ← Local development (ignored by git)
├── bolt.json           ← Bolt.new configuration
├── env.example         ← Documentation only
└── GitHub Repository   ← No keys exposed
```

## 🛠️ **Alternative Approaches**

### **Option 1: Bolt.new Environment Variables (Recommended)**
- Use Bolt.new's built-in environment variable system
- Most secure and easiest to manage

### **Option 2: External Secret Management**
- Use services like Doppler, AWS Secrets Manager, or HashiCorp Vault
- More complex but enterprise-grade security

### **Option 3: Runtime Configuration**
- Set environment variables during deployment
- Good for CI/CD pipelines

## 📋 **Bolt.new Configuration Details**

Your `bolt.json` file specifies:

```json
{
  "environmentVariables": {
    "OPENAI_API_KEY": {
      "description": "Your OpenAI API key for AI functionality",
      "required": true,
      "type": "secret"
    },
    "TAVILY_API_KEY": {
      "description": "Your Tavily API key for web search functionality", 
      "required": true,
      "type": "secret"
    }
  }
}
```

This tells Bolt.new:
- ✅ Which environment variables are needed
- ✅ That they are required for the app to work
- ✅ That they should be treated as secrets
- ✅ What each variable is for

## 🔄 **Workflow for Updates**

### **When You Need to Update API Keys:**

1. **Go to Bolt.new dashboard**
2. **Update environment variables**
3. **Redeploy (if needed)**
4. **No code changes required!**

### **When You Update Code:**

1. **Push changes to GitHub**
2. **Bolt.new auto-deploys**
3. **Environment variables remain unchanged**
4. **Your app keeps working!**

## 🚨 **Important Security Notes**

### **Do NOT:**
- ❌ Add API keys to your code
- ❌ Commit `.env.local` to git
- ❌ Share API keys in public repositories
- ❌ Use the same keys for development and production

### **Do:**
- ✅ Use Bolt.new's environment variable system
- ✅ Keep keys in `.env.local` for local development only
- ✅ Use different keys for different environments
- ✅ Regularly rotate your API keys

## 🎯 **Next Steps**

1. **Push your code to GitHub**
2. **Deploy to Bolt.new**
3. **Add your environment variables**
4. **Your app will be live and secure!**

Your API keys will be safe and your application will work perfectly on Bolt.new! 