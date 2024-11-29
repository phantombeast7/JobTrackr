<div align="center">

# <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=40&duration=3000&pause=1000&color=6F9EF8&center=true&vCenter=true&width=600&lines=Welcome+to+JobTrackr+🚀;Your+Smart+Job+Hunt+Companion;Track%2C+Organize%2C+Succeed" alt="Typing SVG" />

[<img src="https://img.shields.io/badge/License-MIT-F8B739.svg?style=for-the-badge&labelColor=1C2C2E">](https://opensource.org/licenses/MIT)
[<img src="https://img.shields.io/badge/Deploy-Netlify-00C7B7?style=for-the-badge&labelColor=1C2C2E&logo=netlify">](https://jobtrackr7.netlify.app/)
[<img src="https://img.shields.io/badge/Firebase-Connected-FFCA28?style=for-the-badge&labelColor=1C2C2E&logo=firebase">](https://firebase.google.com/)
[<img src="https://img.shields.io/badge/Status-Active-4CAF50?style=for-the-badge&labelColor=1C2C2E">](https://github.com/phantombeast7/JobTrackr)

</div>

---

<div align="center">

### 🌟 Empower your job search with **JobTrackr**, an intelligent platform for managing job applications, reminders, and analytics—all in one place.

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Configuration Guide](#-configuration-guide)
- [Database Rules](#-database-rules)
- [Authentication](#-authentication)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**JobTrackr** simplifies the **job search process** by offering a feature-packed dashboard, seamless integrations, and real-time tracking tools, ensuring you never miss an opportunity.

---

## ✨ Features

### 📊 **Dashboard Insights**
- Track application progress in real-time
- Visualize career trends and patterns
- Set custom workflows for interviews and reminders

### 🔔 **Smart Notifications**
- Schedule interview reminders
- Alerts for follow-ups
- Application deadlines

### 📁 **Document Organization**
- Resume and cover letter storage via Google Drive
- Version control and sharing

### 📈 **Analytics & Reports**
- Job search performance metrics
- Application source analysis
- Success rate and trends

### 🔐 **Authentication & Security**
- Google and GitHub OAuth for secure login
- AWS SES-powered email notifications

---

## 🛠 Tech Stack

| Category | Technologies |
|----------|-------------|
| Frontend | Next.js, React, TypeScript, TailwindCSS |
| Backend | Firebase, Node.js |
| Database | Firestore |
| Storage | Google Drive API |
| Email | AWS SES |
| Authentication | Firebase Auth |
| Deployment | Netlify |

---

## 📥 Getting Started

### 1. Clone and Install

```bash
git clone https://github.com/phantombeast7/JobTrackr.git
cd JobTrackr
npm install
```

### 2. Environment Setup

Create a `.env.local` file with the following variables:

```env
# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Firebase Admin
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Google Drive
NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID=
GOOGLE_DRIVE_CLIENT_SECRET=
NEXT_PUBLIC_GOOGLE_DRIVE_REDIRECT_URI=http://localhost:3000/api/auth/google-drive/callback

# AWS SES
AWS_SES_SMTP_HOST=
AWS_SES_SMTP_PORT=587
AWS_SES_USER=
AWS_SES_PASSWORD=
AWS_SES_FROM_EMAIL=
```

---

## ⚙️ Configuration Guide

### Firebase Setup

1. Create a new project in [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication with Google and GitHub providers
3. Create a Firestore database
4. Get your Firebase config from Project Settings
5. Generate a service account key for admin access

### Google Drive API

1. Visit [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project and enable Drive API
3. Configure OAuth consent screen
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/google-drive/callback
   https://jobtrackr7.netlify.app/api/auth/google-drive/callback
   ```

### AWS SES Configuration

1. Access [AWS Console](https://aws.amazon.com/console)
2. Navigate to SES (Simple Email Service)
3. Verify your email domain
4. Create SMTP credentials
5. Configure email templates

---

## 🔐 Database Rules

### Firestore Security Rules

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
  }
}
```

### Required Indexes

```javascript
Collection: applications
Fields: userId Ascending, resumeUrl Ascending, __name__ Ascending
Fields: userId Ascending, createdAt Descending, __name__ Descending

Collection: reminders
Fields: sent Ascending, userId Ascending, scheduledFor Ascending, __name__ Ascending
Fields: userId Ascending, scheduledFor Descending, __name__ Descending
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── common/
│   └── features/
├── lib/
│   ├── firebase/
│   │   ├── config.ts
│   │   └── admin.ts
│   ├── google/
│   │   └── drive.ts
│   └── aws/
│       └── ses.ts
├── types/
│   ├── application.ts
│   └── reminder.ts
├── utils/
│   ├── date.ts
│   └── validation.ts
└── styles/
    └── globals.css
```

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes
   ```bash
   git commit -m 'Add AmazingFeature'
   ```
4. Push to the branch
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://opensource.org/licenses/MIT) file for details.

---

<div align="center">

### <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=25&duration=3000&pause=1000&color=6F9EF8&center=true&vCenter=true&width=435&lines=Made+with+%E2%9D%A4%EF%B8%8F+by+%5Bphantombeast7%5D;Empower+Your+Career+Journey!" alt="Footer Typing" />

</div>
