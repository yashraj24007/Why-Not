# 🚀 Deployment Guide for WhyNot

This guide covers deploying WhyNot to popular hosting platforms.

## 📋 Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Supabase database schema deployed (run `setup.sql`)
- [ ] Supabase Storage bucket 'resumes' created with RLS policies
- [ ] Google Gemini API key obtained
- [ ] Build passes locally (`npm run build`)
- [ ] All tests pass (if applicable)

---

## 🌐 Deploy to Vercel (Recommended)

Vercel offers the best DX for React + Vite apps with zero-config deployments.

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy
```bash
# Production deployment
vercel --prod

# Preview deployment
vercel
```

### Step 4: Configure Environment Variables

Go to your Vercel project dashboard → Settings → Environment Variables:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### Step 5: Redeploy
```bash
vercel --prod
```

**Your app is now live!** 🎉

---

## 🚀 Deploy to Netlify

### Option 1: Git Integration (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [Netlify Dashboard](https://app.netlify.com/)
3. Click **"New site from Git"**
4. Connect your repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Add environment variables in Site Settings → Build & Deploy → Environment
7. Deploy!

### Option 2: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod

# Follow prompts:
# - Build command: npm run build
# - Publish directory: dist
```

---

## ☁️ Deploy to Cloudflare Pages

### Step 1: Connect Repository

1. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
2. Click **"Create a project"**
3. Connect your Git repository

### Step 2: Configure Build

```
Build command: npm run build
Build output directory: dist
Root directory: /
```

### Step 3: Environment Variables

Add in Pages → Settings → Environment Variables:
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_GEMINI_API_KEY
```

### Step 4: Deploy

Click **"Save and Deploy"**

---

## 🐳 Deploy with Docker

### Dockerfile

Create `Dockerfile` in project root:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    gzip_comp_level 6;
}
```

### Build and Run

```bash
# Build Docker image
docker build -t whynot-app .

# Run container
docker run -d -p 3000:80 \
  -e VITE_SUPABASE_URL=your_url \
  -e VITE_SUPABASE_ANON_KEY=your_key \
  -e VITE_GEMINI_API_KEY=your_key \
  whynot-app
```

---

## 🔧 Production Optimizations

### 1. Enable Compression

Most platforms handle this automatically, but verify gzip/brotli is enabled.

### 2. Configure Caching

In `vite.config.ts`:

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei']
        }
      }
    }
  }
});
```

### 3. Environment-Specific Builds

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### 4. Performance Monitoring

Add to your deployment:

- **Vercel Analytics**: Built-in, just enable in dashboard
- **Google Analytics**: Add tracking ID to your app
- **Sentry**: For error tracking

---

## 🔒 Security Checklist

- [ ] Never commit `.env` file to git
- [ ] Use Supabase Row Level Security (RLS) for all tables
- [ ] Validate file uploads (PDFs only, max 10MB)
- [ ] Sanitize user inputs (covered by Supabase)
- [ ] Use HTTPS (automatic on Vercel/Netlify/Cloudflare)
- [ ] Implement rate limiting for API calls
- [ ] Keep dependencies updated (`npm audit`)

---

## 📊 Post-Deployment Checklist

- [ ] Test user registration and login
- [ ] Verify resume upload functionality
- [ ] Test AI rejection explanation (requires Gemini API)
- [ ] Check all protected routes redirect correctly
- [ ] Test mobile responsiveness
- [ ] Verify email notifications (if configured)
- [ ] Test all user roles (Student, Mentor, Employer, Placement Officer)
- [ ] Monitor Supabase usage (Auth, Database, Storage quotas)
- [ ] Set up error tracking (Sentry recommended)

---

## 🆘 Troubleshooting

### Build Fails

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment Variables Not Loading

- Ensure variables start with `VITE_` prefix
- Redeploy after adding variables
- Check platform-specific env var syntax

### 404 on Refresh

Configure redirects:

**Netlify** (`netlify.toml`):
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Vercel** (`vercel.json`):
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Supabase Connection Issues

- Verify URL and anon key are correct
- Check RLS policies are enabled
- Ensure tables exist (run `setup.sql`)

---

## 📧 Support

For deployment issues:
1. Check [Issues](https://github.com/yourusername/why-not/issues)
2. Review platform-specific docs (Vercel/Netlify/Cloudflare)
3. Contact Supabase support for database issues

---

## 🎉 Success!

Your WhyNot platform is now live! Share it with your campus and start streamlining placements.

**Next Steps:**
- Configure email templates in Supabase
- Set up automated backups
- Monitor usage analytics
- Gather user feedback
