<div align="center">

# <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=40&duration=3000&pause=1000&color=6F9EF8&center=true&vCenter=true&width=600&lines=Welcome+to+JobTrackr+🚀;Your+Smart+Job+Hunt+Companion;Track%2C+Organize%2C+Succeed" alt="Typing SVG" />

[<img src="https://img.shields.io/badge/License-MIT-F8B739.svg?style=for-the-badge&labelColor=1C2C2E">](https://opensource.org/licenses/MIT)
[<img src="https://img.shields.io/badge/Deploy-Netlify-00C7B7?style=for-the-badge&labelColor=1C2C2E&logo=netlify">](https://jobtrackr7.netlify.app/)
[<img src="https://img.shields.io/badge/Firebase-Connected-FFCA28?style=for-the-badge&labelColor=1C2C2E&logo=firebase">](https://firebase.google.com/)
[<img src="https://img.shields.io/badge/Status-Active-4CAF50?style=for-the-badge&labelColor=1C2C2E">](https://github.com/phantombeast7/JobTrackr)

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation Steps](#-installation-steps)
- [Project Structure](#-project-structure)
- [Configuration Guide](#-configuration-guide)
- [API Integration](#-api-integration)
- [Database Schema](#-database-schema)
- [Authentication](#-authentication)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Overview

JobTrackr is a comprehensive job application tracking system that helps job seekers manage their entire job search process efficiently. From tracking applications to managing interviews and storing important documents, JobTrackr streamlines every aspect of your job hunt.

## ✨ Features

- 📊 **Interactive Dashboard**
  - Real-time application status tracking
  - Visual analytics and insights
  - Customizable job search metrics

- 📝 **Application Management**
  - Track multiple job applications
  - Custom status workflows
  - Application history and timeline
  - Document attachment support

- 🔔 **Smart Notifications**
  - Interview reminders
  - Follow-up alerts
  - Application deadlines
  - Custom notification preferences

- 📁 **Document Management**
  - Resume versions control
  - Cover letter templates
  - Portfolio organization
  - Seamless Google Drive integration

- 📈 **Analytics & Reporting**
  - Success rate tracking
  - Interview performance metrics
  - Application source analysis
  - Custom report generation

## 🛠 Tech Stack

- **Frontend**: React.js, TypeScript, TailwindCSS
- **Backend**: Node.js, Express
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Google Drive API
- **Email Service**: AWS SES
- **Hosting**: Netlify
- **Analytics**: Firebase Analytics

## 📥 Installation Steps

### 1. Basic Setup

```bash
# Clone repository
git clone https://github.com/phantombeast7/JobTrackr.git

# Navigate to project
cd JobTrackr

# Install dependencies
npm install

# Start development server
npm run dev
```

### 2. Environment Configuration

Create `.env.local` file:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google Drive API
NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID=your_client_id
GOOGLE_DRIVE_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_GOOGLE_DRIVE_REDIRECT_URI=http://localhost:3000/api/auth/google-drive/callback

# AWS SES Configuration
AWS_SES_SMTP_HOST=your_smtp_host
AWS_SES_SMTP_PORT=your_smtp_port
AWS_SES_USER=your_ses_user
AWS_SES_PASSWORD=your_ses_password
AWS_SES_FROM_EMAIL=your_verified_email
```

## 📁 Project Structure

```
JobTrackr/
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   ├── applications/
│   │   ├── notifications/
│   │   └── shared/
│   ├── pages/
│   ├── services/
│   ├── utils/
│   └── styles/
├── public/
├── config/
└── tests/
```

## ⚙️ Configuration Guide

### Firebase Setup

1. Create a new project in [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication methods:
   - Google Sign-In
   - Email/Password
   - GitHub
3. Set up Firestore Database
4. Configure Security Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    function isValidApplication() {
      let data = request.resource.data;
      return data.userId == request.auth.uid &&
             data.companyName is string &&
             data.jobTitle is string &&
             data.status in ['Applied', 'Interviewing', 'Offered', 'Rejected'] &&
             data.applicationDate is string;
    }

    function isValidReminder() {
      let data = request.resource.data;
      return data.userId == request.auth.uid &&
             data.type in ['interview', 'followup'] &&
             data.date is string &&
             data.message is string;
    }

    // Collection rules
    match /users/{userId} {
      allow read, write: if isSignedIn() && isOwner(userId);
    }

    match /applications/{applicationId} {
      allow create: if isSignedIn() && isValidApplication();
      allow update: if isSignedIn() && isValidApplication();
      allow delete: if isSignedIn() && isOwner(resource.data.userId);
    }

    match /reminders/{reminderId} {
      allow create: if isSignedIn() && isValidReminder();
      allow update, delete: if isSignedIn() && resource.data.userId == request.auth.uid;
    }

    match /blacklistedCompanies/{companyId} {
      allow create: if isSignedIn() && request.resource.data.reportedBy == request.auth.uid;
      allow update: if isSignedIn() && resource.data.reportedBy == request.auth.uid;
      allow delete: if isSignedIn() && resource.data.reportedBy == request.auth.uid;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Google Drive Integration

1. Create project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable Google Drive API
3. Configure OAuth consent screen
4. Create credentials (OAuth 2.0 Client ID)
5. Add authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/google-drive/callback
   https://jobtrackr7.netlify.app/api/auth/google-drive/callback
   ```

### AWS SES Configuration

1. Access [AWS Management Console](https://aws.amazon.com/console/)
2. Navigate to Simple Email Service (SES)
3. Verify email addresses
4. Create SMTP credentials
5. Configure notification templates

## 🔐 Authentication

### Supported Methods:
- Google Sign-In
- Email/Password
- GitHub OAuth

### Implementation:
```typescript
import { auth } from './firebase-config';
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  GithubAuthProvider 
} from 'firebase/auth';

// Google Sign-In
const googleAuth = async () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

// GitHub Sign-In
const githubAuth = async () => {
  const provider = new GithubAuthProvider();
  return signInWithPopup(auth, provider);
};
```

## 🚀 Deployment

### Netlify Deployment Steps:

1. Connect GitHub repository
2. Configure build settings:
   ```
   Build command: npm run build
   Publish directory: dist
   ```
3. Set environment variables
4. Deploy!

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### Made with ❤️ by JobTrackr Team

[<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=25&duration=3000&pause=1000&color=6F9EF8&center=true&vCenter=true&width=435&lines=Ready+to+Start%3F;Happy+Job+Hunting!+🎯" alt="Footer Typing" />](https://jobtrackr7.netlify.app/)

</div>
