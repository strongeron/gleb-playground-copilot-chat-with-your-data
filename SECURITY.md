# Security Configuration

## 🔐 Password Protection

Your application is now protected with HTTP Basic Authentication.

### **Default Credentials**
- **Username**: `admin`
- **Password**: `evilmartians`

### **How It Works**
1. **Middleware Protection**: All routes (except API and static files) require authentication
2. **Browser Prompt**: Users will see a browser authentication dialog
3. **Secure Headers**: Additional security headers are applied to all responses

### **Changing Credentials**
To change the username/password:

1. **Via Vercel CLI**:
   ```bash
   vercel env rm BASIC_AUTH_USERNAME
   vercel env add BASIC_AUTH_USERNAME
   
   vercel env rm BASIC_AUTH_PASSWORD
   vercel env add BASIC_AUTH_PASSWORD
   ```

2. **Via Vercel Dashboard**:
   - Go to Project Settings → Environment Variables
   - Edit or add new values
   - Redeploy the project

## 🛡️ Security Features

### **HTTP Security Headers**
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information
- `Permissions-Policy` - Restricts browser features

### **Environment Variable Protection**
- Sensitive data is stored in Vercel environment variables
- Not exposed in GitHub repository
- Protected from build logs

### **API Route Security**
- Trace data API routes are protected
- Static assets remain accessible for proper functionality
- Build process is secured

## 🚫 What's Hidden

### **From GitHub Repository**
- Environment variables (`.env*` files)
- Vercel configuration (`.vercel` folder)
- Build artifacts (`.next`, `build` folders)
- Node modules (`node_modules`)

### **From Public Access**
- All application routes require authentication
- Trace data is protected behind login
- Dashboard access is restricted

## 🔧 Customization

### **Adding More Users**
To implement multi-user authentication, modify `middleware.ts`:

```typescript
const USERS = {
  'admin': 'evilmartians',
  'user1': 'password1',
  'user2': 'password2'
}
```

### **IP Whitelisting**
Add IP restrictions in `middleware.ts`:

```typescript
const ALLOWED_IPS = ['192.168.1.1', '10.0.0.1']
const clientIP = request.ip || request.headers.get('x-forwarded-for')
```

### **Session-Based Auth**
Replace basic auth with session-based authentication for better security.

## 🚀 Deployment

### **Automatic Deployment**
- Push to GitHub triggers Vercel deployment
- Environment variables are automatically included
- Security headers are applied

### **Manual Deployment**
```bash
vercel --prod
```

## 📱 Access URLs

- **Production**: https://gleb-playground-copilot-chat-with-your-data-mxtbzrv3n.vercel.app
- **Custom Domain**: https://gleb-playground-copilot-chat-with-y.vercel.app

## ⚠️ Important Notes

1. **Change Default Password**: The default password should be changed in production
2. **HTTPS Only**: Vercel automatically provides HTTPS
3. **Regular Updates**: Keep dependencies updated for security patches
4. **Monitor Access**: Check Vercel analytics for access patterns

## 🆘 Troubleshooting

### **Authentication Issues**
- Verify environment variables are set in Vercel
- Check middleware configuration
- Ensure proper deployment

### **Build Errors**
- Verify all environment variables are set
- Check Vercel configuration syntax
- Review build logs for errors
