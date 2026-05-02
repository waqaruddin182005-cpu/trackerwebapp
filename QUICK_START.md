# Quick Start Guide - Expense Tracker Enhancement

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 2: Install Frontend Dependencies
```bash
cd frontend
npm install
```

### Step 3: Setup Environment Variables

**Backend (.env):**
```bash
cd backend
cat > .env << 'EOF'
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expense_tracker
JWT_SECRET=your_super_secret_key_min_32_characters_long_1234567890123456
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
EOF
```

**Frontend (.env.local):**
```bash
cd frontend
cat > .env.local << 'EOF'
VITE_API_URL=http://localhost:5000
EOF
```

### Step 4: Run Locally (Two Terminal Windows)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on: `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on: `http://localhost:5173`

---

## 📝 Environment Variables Reference

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/expense_tracker` |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | `your_long_random_secret_key` |
| `NODE_ENV` | Environment | `development` or `production` |
| `PORT` | Server port | `5000` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` or your production URL |

### Frontend (.env.local)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000` or production URL |

---

## 🔧 Common Commands

```bash
# Backend
npm run dev          # Run development server
npm start            # Run production server
npm install          # Install dependencies

# Frontend
npm run dev          # Run development server
npm run build        # Build for production
npm run preview      # Preview production build
npm install          # Install dependencies
```

---

## 🌐 Deployment Quick Links

### Render (Backend)
- Dashboard: https://dashboard.render.com
- Deploy command: `npm install`
- Start command: `npm start`

### Vercel (Frontend)
- Dashboard: https://vercel.com/dashboard
- Framework: Vite
- Build command: `npm run build`
- Install command: `npm install`

---

## ✅ Verification Checklist

After installation, verify:

- [ ] Backend starts without errors
- [ ] Frontend loads without errors
- [ ] Can login/register
- [ ] Can add expenses
- [ ] Can view analytics
- [ ] Dark mode toggle works
- [ ] Notifications work
- [ ] Export PDF works
- [ ] Export CSV works

---

## 🐛 Quick Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000 (Mac/Linux)
lsof -ti:5000 | xargs kill -9

# Kill process on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Clear npm Cache
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

### MongoDB Connection Issue
1. Verify MongoDB URI is correct
2. Check IP whitelist in MongoDB Atlas
3. Ensure credentials are correct
4. Test connection string in MongoDB Compass

---

## 📊 Test Data

To test with sample data, use this expense:
```json
{
  "title": "Sample Expense",
  "amount": 50.00,
  "category": "Food",
  "type": "expense",
  "date": "2024-01-15",
  "description": "Test expense"
}
```

---

## 🔐 JWT Secret Generation

Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📦 New Features Summary

✨ **What's New:**
- Advanced Analytics with multiple chart types
- Real-time notifications with bell icon
- PDF & CSV export functionality
- Dark/Light theme support
- Modern UI with Tailwind CSS
- Improved error handling
- Loading states and animations
- Better responsive design

---

## 🎯 Next Steps

1. ✅ Install dependencies
2. ✅ Setup environment variables
3. ✅ Run local development servers
4. ✅ Test all features
5. ✅ Deploy to production

---

**Need Help?** Refer to `IMPLEMENTATION_GUIDE.md` for detailed information.
