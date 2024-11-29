
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
- [Deployment](#-deployment)
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

| **Frontend**         | **Backend**           | **Others**                     |
|-----------------------|-----------------------|---------------------------------|
| React.js, TailwindCSS | Node.js, Firebase     | Google Drive API, AWS SES      |
| TypeScript            | Firebase Auth, Firestore | Firebase Analytics, Netlify Hosting |

---

## 📥 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/phantombeast7/JobTrackr.git
cd JobTrackr
npm install
npm run dev
```

---

## ⚙️ Configuration Guide

### Firebase Setup

1. Visit the [Firebase Console](https://console.firebase.google.com).
2. Create a new project and enable **Firestore**, **Authentication**, and **Firebase Storage**.
3. Obtain the following keys:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
4. Add these values to `.env.local`.

### Google Drive Integration

1. Navigate to the [Google Cloud Console](https://console.cloud.google.com).
2. Enable the **Google Drive API** for your project.
3. Configure **OAuth consent** and add **redirect URIs**:
   - Localhost: `http://localhost:3000/api/auth/google-drive/callback`
   - Deployed: `https://jobtrackr7.netlify.app/api/auth/google-drive/callback`
4. Retrieve the following keys:
   - `NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID`
   - `GOOGLE_DRIVE_CLIENT_SECRET`
   - `NEXT_PUBLIC_GOOGLE_DRIVE_REDIRECT_URI`

### AWS SES Configuration

1. Log in to the [AWS Management Console](https://aws.amazon.com/console/).
2. Navigate to **Simple Email Service (SES)**.
3. Verify your sender email and create **SMTP credentials**.
4. Add the following keys:
   - `AWS_SES_SMTP_HOST`
   - `AWS_SES_SMTP_PORT`
   - `AWS_SES_USER`
   - `AWS_SES_PASSWORD`
   - `AWS_SES_FROM_EMAIL`

---

## 🔐 Database Rules

### Firebase Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /applications/{applicationId} {
      allow create, update, delete: if request.auth != null;
    }
    match /reminders/{reminderId} {
      allow create, update, delete: if request.auth != null;
    }
  }
}
```

### Indexing
| Collection | Field                | Order       | Enabled  |
|------------|----------------------|-------------|----------|
| `applications` | `userId`           | Ascending   | ✅       |
| `reminders`    | `scheduledFor`     | Descending  | ✅       |

---

## 🔐 Authentication

- Enable **Google** and **GitHub OAuth** in Firebase Authentication.
- For **GitHub OAuth**:
  1. Visit [GitHub Developer Settings](https://github.com/settings/developers).
  2. Create an **OAuth App** with redirect URIs:
     - Localhost: `http://localhost:3000`
     - Production: `https://jobtrackr7.netlify.app`

---

## 🚀 Deployment

### Netlify Deployment

1. Connect your repository to Netlify.
2. Set environment variables in Netlify settings.
3. Deploy with one click!

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository.
2. Clone your fork and create a branch:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes:
   ```bash
   git commit -m 'Add AmazingFeature'
   ```
4. Push the branch and create a Pull Request.

---

## 📄 License

[MIT License](https://opensource.org/licenses/MIT)

---

<div align="center">

### <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=25&duration=3000&pause=1000&color=6F9EF8&center=true&vCenter=true&width=435&lines=Made+with+%E2%9D%A4%EF%B8%8F+by+%5Bphantombeast7%5D(https://github.com/phantombeast7)!+🚀;Empower+Your+Career+Journey!" alt="Footer Typing" />

</div>

