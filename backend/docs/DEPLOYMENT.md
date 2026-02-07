# Deployment Guide

## Prerequisites

1. ✅ GitHub App ID: `2810915`
2. ✅ GitHub App Private Key: `starcpay.2026-02-06.private-key.pem`
3. ✅ MongoDB Atlas connection string
4. ✅ GitHub Webhook Secret (generate a secure random string)

---

## Option 1: Railway.app (Recommended - Easiest)

### Why Railway?
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Easy environment variable management
- ✅ GitHub integration
- ✅ Automatic deployments

### Steps:

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Initialize Project**
   ```bash
   cd backend
   railway init
   ```

4. **Add Environment Variables**
   ```bash
   railway variables set GITHUB_APP_ID=2810915
   railway variables set GITHUB_WEBHOOK_SECRET=your_secret_here
   railway variables set MONGODB_URL=your_mongodb_url
   railway variables set MONGODB_DB_NAME=starcpay
   railway variables set ENVIRONMENT=production
   railway variables set FRONTEND_URL=https://your-frontend-url.com
   ```

5. **Add Private Key**

   Option A: As file (recommended)
   - Upload via Railway dashboard → Variables → Add File
   - Name: `starcpay.2026-02-06.private-key.pem`

   Option B: As environment variable
   ```bash
   railway variables set GITHUB_PRIVATE_KEY_PATH=./starcpay.2026-02-06.private-key.pem
   ```
   Then manually paste the content in the Railway dashboard.

6. **Deploy**
   ```bash
   railway up
   ```

7. **Get Your URL**
   ```bash
   railway status
   ```

   Your backend will be at: `https://your-app.up.railway.app`

8. **Update GitHub Webhook**
   - Go to your GitHub App settings
   - Update webhook URL to: `https://your-app.up.railway.app/api/webhooks/github`

---

## Option 2: Render.com

### Steps:

1. **Go to [render.com](https://render.com)**

2. **Create New Web Service**
   - Connect your GitHub repository
   - Select `backend` directory

3. **Configure Service**
   - **Name**: `starcpay-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. **Add Environment Variables**
   - `GITHUB_APP_ID` = `2810915`
   - `GITHUB_PRIVATE_KEY_PATH` = `./starcpay.2026-02-06.private-key.pem`
   - `GITHUB_WEBHOOK_SECRET` = `your_secret`
   - `MONGODB_URL` = `your_mongodb_url`
   - `MONGODB_DB_NAME` = `starcpay`
   - `ENVIRONMENT` = `production`
   - `FRONTEND_URL` = `your_frontend_url`

5. **Add Private Key File**
   - In Render dashboard, go to "Secret Files"
   - Add file: `starcpay.2026-02-06.private-key.pem`
   - Paste the content

6. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment

7. **Get Your URL**
   - `https://starcpay-backend.onrender.com`

8. **Update GitHub Webhook**
   - Update webhook URL in GitHub App settings

---

## Option 3: Fly.io

### Steps:

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login**
   ```bash
   flyctl auth login
   ```

3. **Launch App**
   ```bash
   cd backend
   flyctl launch
   ```

4. **Set Secrets**
   ```bash
   flyctl secrets set GITHUB_APP_ID=2810915
   flyctl secrets set GITHUB_WEBHOOK_SECRET=your_secret
   flyctl secrets set MONGODB_URL=your_mongodb_url
   flyctl secrets set MONGODB_DB_NAME=starcpay
   flyctl secrets set ENVIRONMENT=production
   ```

5. **Add Private Key**
   ```bash
   # Base64 encode the private key
   cat starcpay.2026-02-06.private-key.pem | base64 > key.b64

   # Set as secret
   flyctl secrets set GITHUB_PRIVATE_KEY="$(cat key.b64)"

   # Clean up
   rm key.b64
   ```

   Then update `config.py` to decode from base64 if needed.

6. **Deploy**
   ```bash
   flyctl deploy
   ```

7. **Get Your URL**
   ```bash
   flyctl status
   ```

---

## Option 4: Docker Deployment

### Create Dockerfile:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Build and Run:

```bash
# Build
docker build -t starcpay-backend .

# Run
docker run -p 8000:8000 \
  -e GITHUB_APP_ID=2810915 \
  -e MONGODB_URL=your_mongodb_url \
  -v $(pwd)/starcpay.2026-02-06.private-key.pem:/app/starcpay.2026-02-06.private-key.pem \
  starcpay-backend
```

---

## Testing Deployment

### 1. Health Check
```bash
curl https://your-backend-url.com/health
```

Expected response:
```json
{"status": "healthy"}
```

### 2. API Documentation
Visit: `https://your-backend-url.com/docs`

### 3. Webhook Test
```bash
curl https://your-backend-url.com/api/webhooks/test
```

Expected response:
```json
{
  "status": "ok",
  "message": "Webhook endpoint is working",
  "timestamp": "2024-01-15T10:30:00.000000"
}
```

### 4. Create Test Project
```bash
curl -X POST https://your-backend-url.com/api/projects/ \
  -H "Content-Type: application/json" \
  -d '{
    "github_repo_url": "https://github.com/owner/repo",
    "freelancer_github_username": "developer123",
    "freelancer_wallet_address": "0x1234567890abcdef",
    "conversation": "Build auth feature, $500 budget",
    "installation_id": "12345678"
  }'
```

---

## MongoDB Atlas Setup

1. **Create Free Cluster**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up / Login
   - Create free M0 cluster

2. **Get Connection String**
   - Click "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password

3. **Whitelist IP**
   - Go to "Network Access"
   - Add IP: `0.0.0.0/0` (allow from anywhere)
   - Or add your deployment platform's IP ranges

4. **Create Database User**
   - Go to "Database Access"
   - Add new user with read/write permissions

---

## GitHub Webhook Configuration

1. **Go to GitHub App Settings**
   - https://github.com/settings/apps/your-app-name

2. **Update Webhook URL**
   - URL: `https://your-backend-url.com/api/webhooks/github`
   - Content type: `application/json`
   - Secret: (use the same value as `GITHUB_WEBHOOK_SECRET` in your .env)

3. **Enable Events**
   - ✅ Push

4. **Save**

---

## Monitoring & Logs

### Railway:
```bash
railway logs
```

### Render:
- Check logs in Render dashboard

### Fly.io:
```bash
flyctl logs
```

---

## Troubleshooting

### Error: "Private key not found"
- Ensure `.pem` file is uploaded correctly
- Check `GITHUB_PRIVATE_KEY_PATH` environment variable

### Error: "MongoDB connection failed"
- Verify MongoDB connection string
- Check network access whitelist
- Verify database user credentials

### Error: "Invalid signature" (webhook)
- Ensure `GITHUB_WEBHOOK_SECRET` matches in both:
  - GitHub App settings
  - Your backend environment variables

### Error: "Installation not found"
- Verify `installation_id` is correct
- Ensure GitHub App is installed on the repository

---

## Security Checklist

- ✅ Never commit `.env` or `.pem` files
- ✅ Use HTTPS in production
- ✅ Enable webhook signature verification
- ✅ Rotate secrets regularly
- ✅ Use MongoDB Atlas IP whitelist
- ✅ Set up proper CORS origins
- ✅ Use environment variables for all secrets

---

## Need Help?

Check the API documentation at: `https://your-backend-url.com/docs`
