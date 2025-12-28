# Deployment Guide

This project is separated into `frontend/` and `backend/` directories for deployment on AWS Amplify and AWS EC2 respectively.

## Project Structure

```
RadOncAI/
├── frontend/          # Deploy to AWS Amplify
│   └── public/        # Static files (HTML, CSS, JS)
├── backend/          # Deploy to AWS EC2
│   ├── server.js     # Express API server
│   ├── package.json  # Backend dependencies
│   └── .env          # Environment variables (OPENAI_API_KEY, PORT)
└── README.md
```

## Backend Deployment (AWS EC2)

### Prerequisites
- EC2 instance running
- Node.js installed on EC2
- SSH access to EC2 instance

### Steps

1. **Copy backend files to EC2:**
   ```bash
   scp -i your-key.pem -r backend/ ec2-user@your-ec2-ip:~/
   ```

2. **SSH into EC2:**
   ```bash
   ssh -i your-key.pem ec2-user@your-ec2-ip
   ```

3. **Install dependencies:**
   ```bash
   cd ~/backend
   npm install
   ```

4. **Create `.env` file:**
   ```bash
   echo "OPENAI_API_KEY=your-api-key-here" > .env
   echo "PORT=3000" >> .env
   ```

5. **Set up PM2 (process manager) for production:**
   ```bash
   npm install -g pm2
   pm2 start server.js --name radoncai-backend
   pm2 save
   pm2 startup
   ```

6. **Configure Security Group:**
   - Open port 3000 (or your chosen port) in EC2 Security Group
   - Allow inbound traffic from your Amplify domain

7. **Get your EC2 public URL:**
   - Format: `http://your-ec2-public-ip:3000` or `https://your-domain.com`

## Frontend Deployment (AWS Amplify)

### Prerequisites
- AWS Amplify account
- GitHub repository connected

### Steps

1. **Connect Repository:**
   - Go to AWS Amplify Console
   - Click "New app" > "Host web app"
   - Connect your GitHub repository
   - Select the `frontend` directory as the app root

2. **Configure Build Settings:**
   - Amplify will auto-detect the `amplify.yml` file
   - Or manually set:
     - Build command: (leave empty or use amplify.yml)
     - Output directory: `public`

3. **Set Environment Variables:**
   - In Amplify Console, go to App settings > Environment variables
   - Add: `API_BASE_URL` = `http://your-ec2-public-ip:3000` (or your backend URL)
   - This will be used to configure the API endpoint at build time

4. **Deploy:**
   - Amplify will automatically build and deploy
   - Your frontend will be available at the Amplify domain

## Local Development

### Backend
```bash
cd backend
npm install
# Create .env file with OPENAI_API_KEY
npm start
```

### Frontend
```bash
cd frontend/public
# Open index.html in browser or use a local server
# For local development, config.js defaults to http://localhost:3000
```

## Environment Variables

### Backend (.env)
```
OPENAI_API_KEY=your-openai-api-key
PORT=3000
```

### Frontend (AWS Amplify Console)
```
API_BASE_URL=http://your-ec2-ip:3000
```

## CORS Configuration

The backend is configured to allow CORS from any origin. For production, you may want to restrict this to your Amplify domain:

```javascript
// In backend/server.js
app.use(cors({
  origin: 'https://your-amplify-domain.amplifyapp.com'
}));
```

## Troubleshooting

1. **Frontend can't reach backend:**
   - Check EC2 Security Group allows inbound traffic on port 3000
   - Verify API_BASE_URL is set correctly in Amplify
   - Check backend is running: `pm2 status` on EC2

2. **CORS errors:**
   - Ensure backend CORS is configured correctly
   - Check browser console for specific error messages

3. **API endpoint not updating:**
   - Clear browser cache
   - Verify config.js is being generated correctly in Amplify build logs

