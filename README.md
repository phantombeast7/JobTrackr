<div align="center">

# <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=30&duration=3000&pause=1000&color=6F9EF8&center=true&vCenter=true&width=435&lines=JobTrackr;Your+Job+Hunt+Companion" alt="Typing SVG" />

[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Deploy](https://img.shields.io/badge/Deploy-Netlify-00C7B7?style=for-the-badge&logo=netlify)](https://jobtrackr7.netlify.app/)
[![Firebase](https://img.shields.io/badge/Firebase-Connected-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge&logo=statuspage)](https://github.com/phantombeast7/JobTrackr)

<p align="center">
<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="-----------------------------------------------------" />

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&pause=1000&color=6F9EF8&center=true&vCenter=true&width=435&lines=Modern+Job+Application+Tracking;Seamless+Google+Drive+Integration;Smart+Reminder+System;Efficient+Organization" alt="Features Typing" />

**JobTrackr** is a modern job tracking tool designed to streamline your job application process. Track applications, set reminders, store resumes, and access your data seamlessly with Google Drive integration. Built to help job seekers stay organized, efficient, and productive throughout their job search journey.

</div>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="-----------------------------------------------------" />

## ✨ Features

<div align="center">

| Feature | Description |
|---------|-------------|
| 🎯 **Dashboard** | A clean overview of all your job applications and reminders |
| 📝 **Application Tracker** | Add, manage, and track job applications with custom statuses |
| ⏰ **Reminder System** | Set reminders for important events like interviews and follow-ups |
| 📁 **Google Drive Integration** | Easily store and access your data on Google Drive |
| 📧 **AWS SES Email Notifications** | Receive automated reminders and updates via email |

</div>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="-----------------------------------------------------" />

## 🛠️ Installation Guide

### Step 1: Clone the Repository
```bash
git clone https://github.com/phantombeast7/JobTrackr.git
cd JobTrackr
```

### Step 2: Install Dependencies
Make sure you have [Node.js](https://nodejs.org/) installed. Run:
```bash
npm install
```

### Step 3: Firebase Setup

<details>
<summary>📌 Click to expand Firebase setup instructions</summary>

#### Creating a Firebase Project:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click on **Add Project**, follow the prompts
3. Navigate to **Project Settings**

#### Get Firebase Config Variables:
```js
const firebaseConfig = {
  apiKey: YOUR_API_KEY, 
  authDomain: YOUR_AUTH_DOMAIN,
  projectId: YOUR_PROJECT_ID,
  storageBucket: YOUR_STORAGE_BUCKET,
  messagingSenderId: YOUR_MESSAGING_SENDER_ID,
  appId: YOUR_APP_ID,
  measurementId: YOUR_MEASUREMENT_ID
};
```

Add to `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID

FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
FIREBASE_CLIENT_EMAIL=YOUR_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY=YOUR_PRIVATE_KEY
```

#### Firebase Authentication Setup:
1. Enable **Google** and **GitHub** authentication
2. Configure GitHub OAuth application

#### Firestore Rules:
```js
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

    // Collections rules
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

#### Firestore Indexes:
```js
applications	userId Ascending resumeUrl Ascending __name__ Ascending
applications	userId Ascending createdAt Descending __name__ Descending
reminders	sent Ascending userId Ascending scheduledFor Ascending __name__ Ascending
reminders	userId Ascending scheduledFor Descending __name__ Descending
```
</details>

### Step 4: Google Drive API Setup

<details>
<summary>📌 Click to expand Google Drive setup instructions</summary>

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Google Drive API**
3. Create OAuth 2.0 credentials
4. Set redirect URIs:

Local:
```
http://localhost:3000
http://localhost:3000/api/auth/google-drive/callback
```

Production:
```
https://jobtrackr7.netlify.app/
https://jobtrackr7.netlify.app/api/auth/google-drive/callback
```

Add to `.env.local`:
```env
NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID=YOUR_GOOGLE_DRIVE_CLIENT_ID
GOOGLE_DRIVE_CLIENT_SECRET=YOUR_GOOGLE_DRIVE_CLIENT_SECRET
NEXT_PUBLIC_GOOGLE_DRIVE_REDIRECT_URI=http://localhost:3000/api/auth/google-drive/callback
```
</details>

### Step 5: AWS SES Configuration

<details>
<summary>📌 Click to expand AWS SES setup instructions</summary>

1. Access [AWS Console](https://aws.amazon.com/console/)
2. Set up SES Email Identity
3. Create SMTP credentials
4. Add to `.env.local`:
```env
AWS_SES_SMTP_HOST=YOUR_SMTP_HOST
AWS_SES_SMTP_PORT=YOUR_SMTP_PORT
AWS_SES_USER=YOUR_SMTP_USER
AWS_SES_PASSWORD=YOUR_SMTP_PASSWORD
AWS_SES_FROM_EMAIL=YOUR_VERIFIED_EMAIL
```
</details>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="-----------------------------------------------------" />

## 💡 Contribute

<div align="center">

We welcome contributions! Whether it's:

🐛 Bug Fixes | 🎯 New Features | 💡 Suggestions

Fork, Create Issue, Submit PR!

</div>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="-----------------------------------------------------" />

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://opensource.org/licenses/MIT) file for details.

<div align="center">

### Happy Job Hunting! 🚀

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&pause=1000&color=6F9EF8&center=true&vCenter=true&width=435&lines=Made+with+%E2%9D%A4%EF%B8%8F+by+JobTrackr+Team" alt="Footer Typing" />

</div>
