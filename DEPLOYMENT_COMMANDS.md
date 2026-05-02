# INSTALLATION & DEPLOYMENT COMMANDS

Copy and paste these commands in order.

---

## 🏗️ LOCAL SETUP

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 2: Create Backend .env File
```bash
cat > .env << 'EOF'
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/expense_tracker
JWT_SECRET=your_super_secret_key_min_32_characters_long_1234567890
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
EOF
```

### Step 3: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### Step 4: Create Frontend .env File
```bash
cat > .env.local << 'EOF'
VITE_API_URL=http://localhost:5000
EOF
```

### Step 5: Run Backend (Terminal 1)
```bash
cd backend
npm run dev
```

### Step 6: Run Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

**Access at:** http://localhost:5173

---

## 🚀 PRODUCTION DEPLOYMENT

### Backend Deployment (Render)

1. **Push to GitHub:**
```bash
git add .
git commit -m "Expense Tracker Enhancement"
git push origin main
```

2. **On Render Dashboard:**
   - Click "New" → "Web Service"
   - Select your GitHub repository
   - Name: `expense-tracker-backend`
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Add Environment Variables:**
```
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/expense_tracker
JWT_SECRET=<generate_with_command_below>
NODE_ENV=production
FRONTEND_URL=https://your-vercel-frontend-url.vercel.app
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

4. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Copy the URL (e.g., `https://expense-tracker-backend.onrender.com`)

---

### Frontend Deployment (Vercel)

1. **On Vercel Dashboard:**
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Framework: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Install Command: `npm install`

2. **Add Environment Variables:**
```
VITE_API_URL=https://your-render-backend-url.onrender.com
```

3. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete
   - Access your frontend

---

## ✅ POST-DEPLOYMENT VERIFICATION

### Test Backend API
```bash
# Replace with your actual backend URL
BACKEND_URL="https://your-render-backend-url.onrender.com"

# Test health check
curl $BACKEND_URL/api/health

# Test with your login credentials
curl -X POST $BACKEND_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"your_password"}'
```

### Test Frontend
- Open your Vercel URL
- Login with your credentials
- Test all features:
  - [ ] Add expense
  - [ ] View expenses
  - [ ] View analytics
  - [ ] Toggle dark mode
  - [ ] Export PDF
  - [ ] Export CSV

---

## 🔄 ENVIRONMENT VARIABLES REFERENCE

### MongoDB Atlas Setup
1. Go to https://www.mongodb.com/cloud/atlas
2. Create cluster
3. Create database user
4. Get connection string
5. Update MONGODB_URI

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🛠️ TROUBLESHOOTING COMMANDS

### Clear Node Modules
```bash
rm -rf node_modules
npm cache clean --force
npm install
```

### Check Port Availability
```bash
# Mac/Linux
lsof -i :5000
lsof -i :5173

# Windows
netstat -ano | findstr :5000
netstat -ano | findstr :5173
```

### Kill Process on Port
```bash
# Mac/Linux
lsof -ti:5000 | xargs kill -9
lsof -ti:5173 | xargs kill -9

# Windows
taskkill /PID <PID> /F
```

### Test MongoDB Connection
```bash
# Use MongoDB Compass
# Connection string: mongodb+srv://user:pass@cluster.mongodb.net/expense_tracker
```

---

## 📦 NPM SCRIPTS

### Backend
```bash
npm run dev          # Development server with nodemon
npm start            # Production server
npm install          # Install dependencies
```

### Frontend
```bash
npm run dev          # Development server
npm run build        # Build for production
npm run preview      # Preview production build
npm install          # Install dependencies
```

---

## 🔐 SECURITY CHECKLIST

- [ ] Use HTTPS (automatic on Vercel)
- [ ] JWT_SECRET is long (32+ characters)
- [ ] CORS origin is set to your frontend URL
- [ ] NODE_ENV is "production"
- [ ] Database credentials are in environment variables
- [ ] Never commit .env files
- [ ] Rate limiting is enabled
- [ ] Helmet security headers are enabled

---

## 📊 EXAMPLE DATA FOR TESTING

### Create Test Expense
```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Grocery Shopping",
    "amount": 45.50,
    "category": "Food",
    "type": "expense",
    "date": "2024-01-15",
    "description": "Weekly groceries"
  }'
```

### Create Test Income
```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Monthly Salary",
    "amount": 3000,
    "category": "Salary",
    "type": "income",
    "date": "2024-01-01",
    "description": "Monthly income"
  }'
```

---

## 🎯 DEPLOYMENT SUMMARY

1. **Local Testing:**
   - Backend: `npm run dev` on port 5000
   - Frontend: `npm run dev` on port 5173

2. **Production Render (Backend):**
   - Service: Web Service
   - Build: `npm install`
   - Start: `npm start`

3. **Production Vercel (Frontend):**
   - Project: Import from GitHub
   - Build: `npm run build`
   - Environment: Add VITE_API_URL

4. **Access Production:**
   - Frontend: Your Vercel URL
   - Backend: Your Render URL
   - API: <Render URL>/api/*

---

## 🚨 EMERGENCY COMMANDS

### If Backend Won't Start
```bash
cd backend
rm -rf node_modules
npm install
npm run dev
```

### If Frontend Won't Start
```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

### If Port is Occupied
```bash
# Mac/Linux - Kill process on port
lsof -ti:5000 | xargs kill -9

# Windows - Find and kill PID
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Reset Database
```bash
# In MongoDB Atlas:
# 1. Go to your cluster
# 2. Click "Collections"
# 3. Delete all collections
# 4. Restart application
```

---

## 📱 MOBILE TESTING

### Test Responsive Design
```bash
# Chrome DevTools: Press F12
# Then press Ctrl+Shift+M (or Cmd+Shift+M on Mac)
# Test different screen sizes
```

---

## 🎉 FINAL CHECKLIST

- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Environment variables configured
- [ ] Local development working
- [ ] All features tested locally
- [ ] Code pushed to GitHub
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Production tested
- [ ] Users notified of launch

---

**You're all set! Happy coding! 🚀**
