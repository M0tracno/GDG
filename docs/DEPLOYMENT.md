# Deployment Instructions

This document provides instructions on how to deploy the Teacher Assistant application with MongoDB (recommended for production) or SQLite database (legacy).

## Backend Deployment (Render)

### Prerequisites
- GitHub account
- Render account (sign up at https://render.com)

### Steps

1. **Push your code to GitHub**
   ```
   git add .
   git commit -m "Prepare for deployment"
   git push
   ```

2. **Connect Render to your GitHub repository**
   - Go to the Render Dashboard
   - Click "New" and select "Web Service"
   - Connect your GitHub repository
   - Select the repository containing this project

3. **Configure the Web Service**
   - Name: `teacher-assistant-api` (or your preferred name)
   - Environment: `Node`
   - Region: Choose the closest to your target users
   - Branch: `main` (or your default branch)
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && node server.js`
   - Select the Free plan

4. **Configure Environment Variables**
   - NODE_ENV: `production`
   - JWT_SECRET: (generate a strong random string)
   - PORT: `10000` (Render's default internal port)
   - DB_TYPE: `mongodb` (for MongoDB) or `sqlite` (for legacy SQLite)
   - MONGODB_URI: your MongoDB connection string (if using MongoDB)

5. **If Using SQLite: Add a Persistent Disk**
   - Size: 1 GB (minimum for free plan)
   - Mount Path: `/opt/render/project/src/data`
   - This will store your SQLite database file

   **If Using MongoDB: Set Up MongoDB Atlas**
   - Create a free MongoDB Atlas account (https://www.mongodb.com/cloud/atlas)
   - Create a new cluster
   - Configure network access to allow connections from Render's IPs
   - Create a database user with read/write permissions
   - Get your connection string and add it to the environment variables

6. **Deploy**
   - Click "Create Web Service"
   - Wait for the deployment to complete

7. **Testing the API**
   - Once deployed, your API will be available at: `https://your-service-name.onrender.com`
   - Test the API using the health check endpoint: `https://your-service-name.onrender.com/api/health-check`
   - Swagger Documentation: `https://your-service-name.onrender.com/api-docs`

## Frontend Deployment (Vercel)

### Prerequisites
- Vercel account (sign up at https://vercel.com)
- Node.js installed locally
- Vercel CLI installed: `npm install -g vercel`

### Steps

1. **Configure environment variables**
   Create a `.env.production` file in the root of your project:
   ```
   REACT_APP_API_URL=https://your-backend-service.onrender.com
   ```

2. **Install Vercel CLI and login**
   ```
   npm install -g vercel
   vercel login
   ```

3. **Deploy to Vercel**
   ```
   vercel
   ```
   - Follow the prompts to configure your project
   - Link to an existing project or create a new one
   - Set the production branch to your main branch
   - Confirm the deployment

4. **Configure Environment Variables in Vercel Dashboard**
   - Go to your project in the Vercel dashboard
   - Navigate to Settings > Environment Variables
   - Add the same environment variables from your `.env.production` file

5. **Production Deployment**
   Once you're satisfied with the preview deployment:
   ```
   vercel --prod
   ```

6. **Testing the Frontend**
   - Your frontend will be available at the URL provided by Vercel (typically `https://your-project-name.vercel.app`)
   - Ensure that it correctly connects to your backend API

## Updating the Application

### Backend (Render)
- Push changes to your GitHub repository
- Render will automatically rebuild and deploy your application

### Frontend (Vercel)
- Push changes to your GitHub repository
- Vercel will automatically rebuild and deploy your application

## Troubleshooting

### Database Connectivity Issues

#### SQLite:
- Check if the SQLite database file exists in the specified location
- Ensure that the application has write permissions to the directory
- Check the logs in Render dashboard for any database-related errors

#### MongoDB:
- Verify that your MongoDB Atlas cluster is running
- Check that the connection string is correct in your environment variables
- Ensure network access is properly configured in MongoDB Atlas
- Check for connection timeouts or authentication failures in the logs
- Run `npm run test:mongodb` locally with the same connection string to verify connectivity
- Refer to [MONGODB_ATLAS_SETUP.md](./MONGODB_ATLAS_SETUP.md) for detailed MongoDB setup instructions

### API Connection Issues
- Verify that CORS is properly configured in the backend
- Ensure that the frontend is using the correct API URL
- Check the browser console for any CORS or connection errors

### General Deployment Issues
- Review deployment logs in Render and Vercel dashboards
- Make sure all required environment variables are properly set
- Test locally with production environment variables before deploying 