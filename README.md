# <div align="center">🎯 **JobTrackr**</div>

<div align="center">

[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Deploy](https://img.shields.io/badge/Deploy-Netlify-00C7B7?style=for-the-badge&logo=netlify)](https://jobtrackr7.netlify.app/)
[![Firebase](https://img.shields.io/badge/Firebase-Connected-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Status](https://img.shields.io/badge/Status-Active-4CAF50?style=for-the-badge)](https://github.com/phantombeast7/JobTrackr)

<p align="center">
  <img src="https://raw.githubusercontent.com/phantombeast7/JobTrackr/main/public/logo.png" alt="JobTrackr Logo" width="200" height="200"/>
</p>

<p align="center">
  <strong>Your Ultimate Job Application Tracking Companion</strong>
</p>

<p align="center">
  <em>Track applications, set reminders, store resumes, and access your data seamlessly with Google Drive integration.</em>
</p>

</div>

---

## 🌟 **What is JobTrackr?**

**JobTrackr** is a modern, intuitive job tracking tool designed to streamline your job application process. Built with job seekers in mind, it helps you stay organized, efficient, and productive throughout your job search journey.

<div align="center">

### 🎯 **Core Features**

| Feature | Description |
|---------|-------------|
| 📊 **Dashboard** | A clean, intuitive overview of all your job applications and reminders |
| 📝 **Application Tracker** | Track applications with statuses: *Applied*, *Interviewing*, *Offered*, *Rejected* |
| ⏰ **Reminder System** | Smart reminders for interviews, follow-ups, and deadlines |
| 📁 **Google Drive Integration** | Seamless document storage and access |
| 📧 **AWS SES Notifications** | Automated email reminders and updates |

</div>

---

## 🚀 **Getting Started**

### **Prerequisites**

- Node.js (v14 or higher)
- npm/yarn
- Git
- Firebase account
- Google Cloud account
- AWS account

### **1️⃣ Clone & Install**

```bash
# Clone the repository
git clone https://github.com/phantombeast7/JobTrackr.git
cd JobTrackr

# Install dependencies
npm install
```

### **2️⃣ Firebase Setup**

<details>
<summary>Click to expand Firebase setup instructions</summary>

#### **Create Firebase Project**

1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Create new project
3. Navigate to Project Settings

#### **Firebase Configuration**

```javascript
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

#### **Environment Variables**

Create `.env.local`:

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

#### **Firestore Rules**

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

#### **Firestore Indexes**

Required indexes:
```javascript
applications	userId Ascending resumeUrl Ascending __name__ Ascending
applications	userId Ascending createdAt Descending __name__ Descending
reminders	sent Ascending userId Ascending scheduledFor Ascending __name__ Ascending
reminders	userId Ascending scheduledFor Descending __name__ Descending
```

</details>

### **3️⃣ Google Drive Setup**

<details>
<summary>Click to expand Google Drive setup instructions</summary>

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google Drive API
3. Create OAuth 2.0 credentials
4. Configure redirect URIs:

```bash
# Local
http://localhost:3000
http://localhost:3000/api/auth/google-drive/callback

# Production
https://jobtrackr7.netlify.app/
https://jobtrackr7.netlify.app/api/auth/google-drive/callback
```

5. Add to `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID=YOUR_GOOGLE_DRIVE_CLIENT_ID
GOOGLE_DRIVE_CLIENT_SECRET=YOUR_GOOGLE_DRIVE_CLIENT_SECRET
NEXT_PUBLIC_GOOGLE_DRIVE_REDIRECT_URI=http://localhost:3000/api/auth/google-drive/callback
```

</details>

### **4️⃣ AWS SES Setup**

<details>
<summary>Click to expand AWS SES setup instructions</summary>

1. Access [AWS Console](https://aws.amazon.com/console/)
2. Configure SES:
   - Create Email Identity
   - Set up SMTP credentials
3. Add to `.env.local`:

```env
AWS_SES_SMTP_HOST=YOUR_SMTP_HOST
AWS_SES_SMTP_PORT=YOUR_SMTP_PORT
AWS_SES_USER=YOUR_SMTP_USER
AWS_SES_PASSWORD=YOUR_SMTP_PASSWORD
AWS_SES_FROM_EMAIL=YOUR_VERIFIED_EMAIL
```

</details>

---

## 🤝 **Contributing**

We love contributions! Here's how you can help:

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

See our [Contributing Guidelines](CONTRIBUTING.md) for more details.

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### 🎯 **Ready to streamline your job search?**

[Get Started](https://jobtrackr7.netlify.app/) · [Report Bug](https://github.com/phantombeast7/JobTrackr/issues) · [Request Feature](https://github.com/phantombeast7/JobTrackr/issues)

<p align="center">Made with ❤️ by JobTrackr Team</p>

</div>
