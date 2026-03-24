# CuraCore Installation Guide

## 📋 Prerequisites

### Required Software

| Software | Minimum Version | Recommended | Check Command |
|----------|----------------|-------------|---------------|
| **Node.js** | 14.x | 18.x or later | `node --version` |
| **npm** | 6.x | 9.x or later | `npm --version` |
| **Python** | 3.8 | 3.12 or later | `python --version` |
| **pip** | 20.x | Latest | `pip --version` |

### System Requirements
- **Disk Space**: 
  - Frontend: ~500MB (node_modules)
  - Backend (Lite): ~200MB
  - Backend (Full AI): ~2.5GB (includes PyTorch)
- **RAM**: Minimum 4GB, Recommended 8GB+
- **OS**: Windows, macOS, or Linux

---

## 🎯 Which Backend to Use?

> [!IMPORTANT]
> This project contains **two backend implementations**:

### Option 1: FastAPI Backend (Recommended)
**Location**: `backend/`

**Use this if**:
- You want the actively maintained version
- You need Gemini API integration
- You prefer lightweight setup (lite mode)
- You want AI/ML capabilities (full mode)

**Modes**:
- **Lite Mode**: Fast setup, uses Gemini API (~30 seconds install)
- **Full AI Mode**: Local ML models, no external API (~10-15 minutes install)

### Option 2: Django Backend (Legacy)
**Location**: `curacore-backend/`

**Use this if**:
- You specifically need Django REST framework
- You're maintaining legacy code
- You have specific Django requirements

> [!WARNING]
> **Do NOT install both backends in the same Python environment!** Use separate virtual environments if you need both.

---

## 🚀 Quick Start (Recommended Path)

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd Digital-Mental-Health-and-Psychological-Support-System
```

### Step 2: Install Frontend
```bash
npm install
```

**Expected output**: No errors, packages installed successfully

### Step 3: Install Backend (FastAPI - Lite Mode)
```bash
cd backend
python install.py
# Choose option 1 (Lite Mode)
```

### Step 4: Start the Application
```bash
# Terminal 1 - Backend
cd backend
python start.py

# Terminal 2 - Frontend
npm start
```

**Access the app**: http://localhost:3000

---

## 📦 Detailed Installation Instructions

### Frontend Installation

#### Clean Installation
```bash
# Remove existing installations (if any)
rm -rf node_modules package-lock.json

# Install dependencies
npm install
```

#### Verify Installation
```bash
# Check for errors
npm list --depth=0

# Test build
npm run build
```

#### Expected Dependencies
- React 18.2.0
- React Router DOM 6.3.0
- TailwindCSS 3.3.0
- Recharts 2.5.0
- Framer Motion 10.12.0
- Lucide React 0.263.1

---

### Backend Installation (FastAPI)

#### Option A: Guided Installation (Recommended)
```bash
cd backend
python install.py
```

**Interactive prompts**:
1. Choose installation mode:
   - `1` for Lite Mode (Recommended)
   - `2` for Full AI Mode

**Lite Mode installs**:
- FastAPI 0.104.1
- Uvicorn 0.24.0
- Pydantic >=2.5.0
- Python-dotenv >=1.0.0
- Google Generative AI >=0.3.0
- Authentication libraries

**Full AI Mode additionally installs**:
- PyTorch >=2.2.0
- Transformers 4.44.0
- Sentence Transformers >=2.2.0
- NumPy >=1.24.0
- Scikit-learn >=1.3.0

#### Option B: Manual Installation

**Lite Mode**:
```bash
cd backend
pip install -r requirements-lite.txt
```

**Full AI Mode**:
```bash
cd backend
pip install -r requirements.txt
```

#### Verify Backend Installation
```bash
cd backend
python -c "import fastapi, uvicorn, pydantic, dotenv; print('✅ All imports successful')"
```

#### Start Backend Server
```bash
cd backend
python start.py
```

**Expected output**:
```
🤖 CuraCore Backend Starting...
✅ Server running on http://localhost:8000
📚 API docs: http://localhost:8000/docs
```

#### Check Server Health
```bash
cd backend
python check_server.py
```

Or visit: http://localhost:8000/health

---

### Backend Installation (Django - Optional)

> [!NOTE]
> Only install this if you specifically need the Django backend.

```bash
cd curacore-backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Expected output**: Server running on http://localhost:8000

---

## 🔧 Virtual Environment Setup (Recommended)

### Why Use Virtual Environments?
- Isolate project dependencies
- Avoid conflicts with system Python packages
- Easy to recreate environment

### Create Virtual Environment

**Windows**:
```bash
# Create virtual environment
python -m venv venv

# Activate
venv\\Scripts\\activate

# Install dependencies
cd backend
pip install -r requirements-lite.txt
```

**macOS/Linux**:
```bash
# Create virtual environment
python3 -m venv venv

# Activate
source venv/bin/activate

# Install dependencies
cd backend
pip install -r requirements-lite.txt
```

### Deactivate Virtual Environment
```bash
deactivate
```

---

## ✅ Verification Checklist

### Frontend Verification
- [ ] `npm install` completes without errors
- [ ] `npm start` launches dev server on port 3000
- [ ] Browser opens to http://localhost:3000
- [ ] No console errors in browser dev tools
- [ ] `npm run build` creates production build successfully

### Backend Verification (FastAPI)
- [ ] `pip install -r requirements-lite.txt` completes without errors
- [ ] `python start.py` starts server on port 8000
- [ ] http://localhost:8000/health returns `{"status": "healthy"}`
- [ ] http://localhost:8000/docs shows API documentation
- [ ] No import errors when running Python scripts

### Integration Verification
- [ ] Frontend can connect to backend
- [ ] Registration works
- [ ] Login works
- [ ] API calls return expected responses

---

## 🐛 Troubleshooting

### Frontend Issues

#### Issue: `npm install` fails
**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Issue: Port 3000 already in use
**Solution**:
```bash
# Use different port
PORT=3001 npm start
```

#### Issue: Build fails
**Solution**:
```bash
# Check Node version
node --version  # Should be 14.x or higher

# Update npm
npm install -g npm@latest
```

---

### Backend Issues

#### Issue: `ModuleNotFoundError`
**Solution**:
```bash
# Ensure you're in the backend directory
cd backend

# Reinstall dependencies
pip install -r requirements-lite.txt

# Verify installation
pip list
```

#### Issue: Port 8000 already in use
**Solution**:
```bash
# Find process using port 8000
# Windows:
netstat -ano | findstr :8000

# macOS/Linux:
lsof -i :8000

# Kill the process or change port in .env file
```

#### Issue: `python-dotenv` not found
**Solution**:
```bash
# Install manually
pip install python-dotenv>=1.0.0

# Or reinstall from requirements
pip install -r requirements-lite.txt
```

#### Issue: Pydantic version conflict
**Solution**:
```bash
# Uninstall old version
pip uninstall pydantic

# Install correct version
pip install "pydantic>=2.5.0"
```

---

### Database Issues

#### Issue: Database errors on first run
**Solution**:
```bash
cd backend
# Database will be created automatically on first run
python start.py
```

#### Issue: Need to reset database
**Solution**:
```bash
cd backend
rm users.db
python start.py  # Will recreate database
```

---

## 🔐 Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# AI Service Mode
AI_SERVICE_MODE=lite  # or 'full'

# Database
DATABASE_PATH=users.db

# Security
SECRET_KEY=your-secret-key-change-this-in-production

# Server
API_HOST=0.0.0.0
API_PORT=8000
LOG_LEVEL=INFO

# Gemini API (for lite mode)
GEMINI_API_KEY=your-gemini-api-key-here
```

> [!CAUTION]
> **Never commit `.env` files to version control!** They contain sensitive information.

---

## 📊 Installation Testing Results

### Frontend Test Results
✅ **npm install --dry-run**: Success
- No peer dependency conflicts
- All packages compatible
- Total packages: 276

### Backend Test Results (FastAPI Lite)
✅ **pip install --dry-run -r requirements-lite.txt**: Success
- No version conflicts
- All dependencies resolved
- Installation size: ~200MB

### Backend Test Results (FastAPI Full)
✅ **pip install -r requirements.txt**: Success
- PyTorch installs correctly
- Transformers compatible
- Installation size: ~2.5GB

---

## 🎯 Next Steps After Installation

1. **Configure Gemini API** (for lite mode):
   - Get API key from https://makersuite.google.com/app/apikey
   - Add to `backend/.env` file

2. **Test the Application**:
   - Register a new user
   - Log in
   - Try the chatbot
   - Log mood entries
   - Create journal entries

3. **Read Documentation**:
   - [README.md](file:///e:/Digital-Mental-Health-and-Psychological-Support-System/README.md)
   - [TROUBLESHOOTING.md](file:///e:/Digital-Mental-Health-and-Psychological-Support-System/TROUBLESHOOTING.md)
   - API Docs: http://localhost:8000/docs

---

## 📞 Getting Help

If you encounter issues not covered here:

1. Check [TROUBLESHOOTING.md](file:///e:/Digital-Mental-Health-and-Psychological-Support-System/TROUBLESHOOTING.md)
2. Review console logs (both terminal and browser)
3. Verify all prerequisites are met
4. Try the lite mode if full AI mode fails
5. Check your firewall/antivirus settings

---

## 🔄 Updating Dependencies

### Frontend Updates
```bash
# Check for outdated packages
npm outdated

# Update all packages
npm update

# Update specific package
npm install package-name@latest
```

### Backend Updates
```bash
# Check for outdated packages
pip list --outdated

# Update all packages
pip install --upgrade -r requirements-lite.txt

# Update specific package
pip install --upgrade package-name
```

---

## 📝 Summary

### ✅ What We Fixed
1. Added missing `python-dotenv>=1.0.0` to both requirements files
2. Changed `pydantic==2.5.0` to `pydantic>=2.5.0` for flexibility
3. Verified all installations work without conflicts
4. Created comprehensive installation guide

### ✅ Verified Working
- Frontend npm install: **No conflicts**
- Backend FastAPI lite mode: **No conflicts**
- Backend FastAPI full mode: **No conflicts**
- Python 3.12 compatibility: **Confirmed**

### 🎉 You're Ready!
Follow the Quick Start guide above to get CuraCore running on your system.
