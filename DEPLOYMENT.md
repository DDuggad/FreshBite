# 🚀 FreshBite Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. MongoDB Atlas Setup
- [ ] Create MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
- [ ] Create a new cluster (Free M0 tier)
- [ ] Create database user with username and password
- [ ] Configure network access to allow 0.0.0.0/0 (all IPs)
- [ ] Get connection string and replace `<username>`, `<password>`, and add database name `freshbites`
- [ ] Save connection string for later use

**Example Connection String:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/freshbites?retryWrites=true&w=majority
```

---

### 2. Railway Backend Deployment
- [ ] Go to https://railway.app/ and sign up with GitHub
- [ ] Click "New Project" → "Deploy from GitHub repo"
- [ ] Select the **FreshBite** repository
- [ ] Click "Deploy Now"
- [ ] Go to **Variables** tab and add environment variables:
  - [ ] `MONGODB_URI` = (Your Atlas connection string)
  - [ ] `JWT_SECRET` = (Generate random 32+ character string)
  - [ ] `PORT` = 5000
  - [ ] `NODE_ENV` = production
  - [ ] `FRONTEND_URL` = (Will update after Vercel deployment)
- [ ] Go to **Settings** → **Build & Deploy**:
  - [ ] Build Command: `cd backend && npm install`
  - [ ] Start Command: `cd backend && npm start`
- [ ] Go to **Settings** → **Domains** → Click "Generate Domain"
- [ ] **Save Railway URL** (e.g., https://your-app.railway.app)

---

### 3. Seed Database
- [ ] On your local machine, edit `backend/.env`:
  - [ ] Set `MONGODB_URI` to your Atlas connection string
- [ ] Run: `cd backend && node seedData.js`
- [ ] Verify data in MongoDB Atlas dashboard

---

### 4. Vercel Frontend Deployment
- [ ] Go to https://vercel.com/ and sign up with GitHub
- [ ] Click "Add New Project"
- [ ] Import **FreshBite** repository
- [ ] Configure project:
  - [ ] Framework Preset: Create React App
  - [ ] Root Directory: `frontend`
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `build`
- [ ] Go to **Settings** → **Environment Variables**:
  - [ ] `REACT_APP_API_URL` = (Your Railway backend URL)
- [ ] Click "Deploy"
- [ ] **Save Vercel URL** (e.g., https://fresh-bite.vercel.app)

---

### 5. Update Railway with Vercel URL
- [ ] Go back to Railway dashboard
- [ ] Go to **Variables** tab
- [ ] Update `FRONTEND_URL` with your Vercel URL
- [ ] Redeploy if necessary (Railway usually auto-deploys)

---

## 🧪 Testing Deployment

### Test Backend Health
- [ ] Visit: `https://your-app.railway.app/health`
- [ ] Should return:
  ```json
  {
    "status": "healthy",
    "mongodb": "connected"
  }
  ```

### Test Frontend
- [ ] Visit your Vercel URL
- [ ] Navigate to "Deals" page
- [ ] Verify deals are loading
- [ ] Try logging in with test credentials:
  - Email: `mtr@freshbites.com`
  - Password: `vendor123`
- [ ] Test vendor dashboard features
- [ ] Test creating a new deal
- [ ] Test updating stock

---

## 🔐 Environment Variables Summary

### Backend (Railway)
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/freshbites?retryWrites=true&w=majority
JWT_SECRET=your_random_secret_key_min_32_characters
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Frontend (Vercel)
```env
REACT_APP_API_URL=https://your-railway-app.railway.app
```

---

## 🎯 Quick Deployment URLs

- **GitHub Repository:** https://github.com/DDuggad/FreshBite
- **MongoDB Atlas Dashboard:** https://cloud.mongodb.com/
- **Railway Dashboard:** https://railway.app/
- **Vercel Dashboard:** https://vercel.com/

---

## 🔧 Troubleshooting

### Issue: CORS Error
**Solution:** Ensure `FRONTEND_URL` in Railway matches your Vercel URL exactly (including https://)

### Issue: MongoDB Connection Failed
**Solution:** 
- Check username/password in connection string
- Verify IP whitelist includes 0.0.0.0/0
- Ensure database name is in the connection string

### Issue: API Calls Return 404
**Solution:**
- Verify `REACT_APP_API_URL` in Vercel is set correctly
- Check Railway deployment logs for errors
- Ensure backend is running on Railway

### Issue: Deals Not Loading
**Solution:**
- Check if database is seeded
- Verify MongoDB connection in Railway logs
- Test backend health endpoint

---

## 📝 Post-Deployment Tasks

- [ ] Update repository README with actual deployment URLs
- [ ] Test all user flows (register, login, browse deals, create deal)
- [ ] Monitor Railway logs for any errors
- [ ] Set up custom domain (optional)
- [ ] Configure GitHub Actions for CI/CD (optional)
- [ ] Set up error monitoring (Sentry, LogRocket, etc.) (optional)

---

## 🎉 You're Live!

Once all checkboxes are complete, your FreshBite platform is live and ready for users!

**Frontend URL:** _____________________________________

**Backend URL:** _____________________________________

**MongoDB Atlas Cluster:** _____________________________________

---

**Made with ❤️ for reducing food waste**
