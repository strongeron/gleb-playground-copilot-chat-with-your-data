# Deployment Guide

This guide will help you deploy your Copilot Chat with Your Data application to various platforms.

## Prerequisites

Before deploying, make sure you have:

1. **API Keys**: You'll need to set up environment variables for:
   - `OPENAI_API_KEY`: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
   - `TAVILY_API_KEY`: Get from [Tavily](https://tavily.com/api-key)

2. **GitHub Repository**: Your code should be pushed to GitHub

## Deployment Options

### 1. Vercel (Recommended)

Vercel is the easiest option for Next.js applications.

#### Steps:
1. Go to [Vercel](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables:
   - `OPENAI_API_KEY`
   - `TAVILY_API_KEY`
5. Click "Deploy"

Your app will be live at `https://your-project-name.vercel.app`

### 2. Netlify

#### Steps:
1. Go to [Netlify](https://netlify.com) and sign up/login
2. Click "New site from Git"
3. Connect your GitHub repository
4. Set build settings:
   - Build command: `npm run build` or `pnpm build`
   - Publish directory: `.next`
5. Add environment variables in Site settings > Environment variables
6. Deploy

### 3. Railway

#### Steps:
1. Go to [Railway](https://railway.app) and sign up/login
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Add environment variables in the Variables tab
6. Deploy

### 4. Render

#### Steps:
1. Go to [Render](https://render.com) and sign up/login
2. Click "New Web Service"
3. Connect your GitHub repository
4. Configure:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Add environment variables
6. Deploy

### 5. Manual Deployment (VPS/Server)

#### Steps:
1. Clone your repository on your server
2. Install dependencies: `npm install`
3. Set environment variables
4. Build the application: `npm run build`
5. Start the server: `npm start`

## Environment Variables

Make sure to set these environment variables in your deployment platform:

```bash
OPENAI_API_KEY=your_openai_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

## Troubleshooting

### Common Issues:

1. **Build Failures**: Make sure all dependencies are properly installed
2. **Environment Variables**: Double-check that all required environment variables are set
3. **API Limits**: Be aware of OpenAI and Tavily API rate limits
4. **Memory Issues**: Some platforms have memory limits for free tiers

### Local Testing:

Before deploying, test locally:
```bash
npm run build
npm start
```

## Custom Domain

After deployment, you can add a custom domain:
1. Go to your deployment platform's dashboard
2. Find the domain settings
3. Add your custom domain
4. Update DNS records as instructed

## Monitoring

Consider setting up monitoring for:
- API usage and costs
- Application performance
- Error tracking (e.g., Sentry)
- User analytics 