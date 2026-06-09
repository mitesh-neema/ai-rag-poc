# Quick Fix for Frontend Build Issues

If you're experiencing build errors when starting the frontend, follow these steps:

## Step 1: Install Dependencies

The frontend folder needs npm packages installed. Run:

```bash
cd frontend
npm install --legacy-peer-deps
```

**Note:** Use `--legacy-peer-deps` if you encounter dependency resolution issues.

## Step 2: Verify Installation

After installation completes, verify by checking:

```bash
ls node_modules/@angular/core
```

You should see the Angular core package files.

## Step 3: Start the Development Server

```bash
npm start
```

Or:

```bash
npx ng serve
```

The app should compile and be available at http://localhost:4200

## Common Issues & Solutions

### Issue: "Cannot find module" errors

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Issue: TypeScript errors about 'marked'

**Solution:** The package.json has been updated to include `@types/marked`. Reinstall:
```bash
npm install --legacy-peer-deps
```

### Issue: Port 4200 already in use

**Solution:**
```bash
# Kill existing process
lsof -ti:4200 | xargs kill -9

# Or use a different port
ng serve --port 4201
```

### Issue: Angular CLI not found

**Solution:**
```bash
npm install -g @angular/cli@17
```

## Alternative: Use npx

If you don't want to install packages globally:

```bash
cd frontend
npx @angular/cli@17 serve
```

## Verify All Services

Once frontend is running, make sure all three services are up:

1. **MCP Server** (Terminal 1):
   ```bash
   cd mcp-server
   npm install
   npm run dev
   ```
   Should show: ✅ Ready to serve RAG context! (Port 3001)

2. **Backend API** (Terminal 2):
   ```bash
   cd backend
   npm install  
   npm run dev
   ```
   Should show: ✅ Ready to generate proposals! (Port 3000)

3. **Frontend** (Terminal 3):
   ```bash
   cd frontend
   npm install --legacy-peer-deps
   npm start
   ```
   Should show: ✔ Compiled successfully (Port 4200)

## Test the Complete Flow

1. Open http://localhost:4200
2. You should see the welcome screen with example prompts
3. Click an example or type your own proposal request
4. Click Send and wait for the AI-generated proposal

## Still Having Issues?

1. Check that Node.js version is 18+: `node --version`
2. Check that all three services are running on correct ports
3. Look at browser console (F12) for any errors
4. Check backend logs for Claude API key issues
5. Verify backend/.env has your actual Claude API key

## Clean Install (Last Resort)

If nothing works, do a complete clean install:

```bash
# Clean everything
cd frontend
rm -rf node_modules package-lock.json
rm -rf .angular

# Reinstall
npm cache clean --force
npm install --legacy-peer-deps

# Try starting
npm start
```
