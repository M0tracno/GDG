# 🎓 AI Teacher Assistant

An AI-powered educational platform built with React that automates grading, provides personalized feedback, and generates quizzes using Google's Gemini and Vertex AI.

## ✨ Features

### 👩‍🏫 For Faculty
- **AI-Generated Quizzes**: Create quizzes instantly on any subject with customizable difficulty levels and question types
- **Automated Grading**: Grade assignments and assessments quickly with AI assistance
- **Personalized Feedback**: Generate tailored feedback for students based on their performance
- **Student Performance Analytics**: Track student progress with detailed analytics
- **Course Management**: Organize courses, assignments, and materials in one place

### 👨‍🎓 For Students
- **Interactive Dashboard**: Access assignments, grades, and feedback in a user-friendly interface
- **AI-Powered Learning Resources**: Get personalized learning recommendations
- **Progress Tracking**: Monitor academic performance over time
- **Quiz Taking**: Take quizzes with immediate feedback

### 👪 For Parents
- **Student Performance Monitoring**: Track children's academic progress
- **Teacher Communication**: Communicate directly with teachers
- **Attendance Tracking**: View attendance records
- **Event Notifications**: Stay updated on important academic events

### 🔧 For Administrators
- **User Management**: Add and manage user accounts
- **System Settings**: Configure platform settings
- **Data Management**: Handle data backup and restoration
- **Activity Monitoring**: Track platform usage and activities

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Firebase CLI
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ai-teacher-assistant.git
   cd ai-teacher-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Firebase and Google Cloud credentials
   ```

4. **Firebase Setup**
   ```bash
   firebase login
   firebase init
   ```

5. **Start development server**
   ```bash
   npm start
   ```

### 🌐 Deployment

#### Firebase Hosting
```bash
npm run build
firebase deploy
```

#### Environment Variables
Create `.env.production` with:
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config
```

## 🛠️ Tech Stack

- **Frontend**: React 18, Material-UI v7, React Router
- **Backend**: Firebase Functions, Node.js
- **Database**: Firestore
- **Authentication**: Firebase Auth
- **AI Services**: Google Gemini, Vertex AI
- **Storage**: Firebase Storage
- **Hosting**: Firebase Hosting

## 📁 Project Structure

```
├── src/                    # React source code
│   ├── components/         # Reusable components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── utils/             # Utility functions
│   └── hooks/             # Custom React hooks
├── public/                # Static assets
├── cloud-functions/       # Firebase Functions
├── docs/                  # Documentation
├── scripts/               # Build and utility scripts
│   ├── fixes/            # Fix scripts
│   └── deployment/       # Deployment scripts
├── firebase.json          # Firebase configuration
└── package.json          # Dependencies
```

## Technologies Used

- **React**: Frontend UI library
- **Material-UI**: Component library for responsive design
- **MongoDB**: Database for storing user and application data
- **Express**: Backend API server
- **Mongoose**: MongoDB object modeling tool
- **JWT**: JSON Web Token based authentication
- **Gemini API**: Google's generative AI for content creation and analysis
- **Vertex AI**: Google Cloud's AI platform for advanced analytics
- **React Router**: Navigation management
- **Chart.js**: Data visualization

## Installation

### Prerequisites
- Node.js (v14 or later)
- npm (v6 or later)
- MongoDB (v4.4 or later)
- Google AI API keys (Gemini and/or Vertex AI)

### Codebase Organization

The codebase has been organized to reduce redundancy and improve maintainability. For details on the organization structure and development workflow, please see the [CODEBASE_ORGANIZATION.md](./CODEBASE_ORGANIZATION.md) document.

### Setup Instructions

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ai-teacher-assistant.git
   cd ai-teacher-assistant
   ```

2. Install dependencies for both frontend and backend:
   ```
   # Install frontend dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/gdc
   MONGODB_DB_NAME=gdc

   # JWT Configuration
   REACT_APP_JWT_SECRET=your_jwt_secret_here
   REACT_APP_JWT_EXPIRATION=3600

   # Authentication Configuration
   AUTH_RATE_LIMIT=5 # Max login attempts per minute
   AUTH_LOCKOUT_TIME=15 # Minutes to lock account after too many failed attempts
   
   # AI API Keys
   REACT_APP_GEMINI_API_KEY=your_gemini_api_key
   REACT_APP_VERTEX_API_KEY=your_vertex_api_key
   REACT_APP_GCP_PROJECT_ID=your_gcp_project_id
   
   ```

4. Start MongoDB:
   ```
   mongod
   ```

5. Start the backend server:
   ```
   cd backend
   npm start
   ```

6. In a new terminal, start the frontend development server:
   ```
   npm start
   ```

6. Open [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

### User Types and Access

The application supports four user types, each with their own login flow:

1. **Faculty**: Email/password login with CAPTCHA
2. **Students**: Student ID/email and password login
3. **Parents**: Phone number authentication with OTP
4. **Administrators**: Email/password with security key and CAPTCHA

### Creating an AI-Generated Quiz (Faculty)

1. Log in as a faculty member
2. Navigate to "Create Quiz" in the dashboard
3. Enter quiz details (title, topics, question count, etc.)
4. Click "Generate Quiz with AI"
5. Review and optionally edit the generated quiz
6. Save the quiz to make it available to students

### Grading Assignments with AI (Faculty)

1. Log in as a faculty member
2. Navigate to "Grade Assignments" in the dashboard
3. Select an assignment to grade
4. Choose auto-grading or manual grading options
5. For auto-grading, review AI-suggested scores and feedback
6. Make adjustments if necessary and save the grades

### Viewing Academic Performance (Student/Parent)

1. Log in as a student or parent
2. View the dashboard for an overview of grades and performance
3. Navigate to specific sections for detailed information on assignments, quizzes, and feedback

## Project Structure

```
ai-teacher-assistant/
├── public/                  # Public assets
├── src/                     # Source files
│   ├── auth/                # Authentication components and context
│   │   ├── faculty/         # Faculty-specific components
│   │   ├── student/         # Student-specific components
│   │   ├── parent/          # Parent-specific components
│   │   └── admin/           # Admin-specific components
│   ├── pages/               # Page components
│   ├── services/            # API and service functions
│   ├── App.js               # Main app component
│   └── index.js             # Application entry point
└── package.json             # Project dependencies
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google's Generative AI APIs for powering the AI features
- Firebase for authentication and database solutions
- Material-UI for the responsive design components 