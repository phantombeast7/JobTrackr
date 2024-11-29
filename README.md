<div align="center">

# <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=40&duration=3000&pause=1000&color=6F9EF8&center=true&vCenter=true&width=600&lines=Welcome+to+JobTrackr+🚀;Your+Smart+Job+Hunt+Companion;Track%2C+Organize%2C+Succeed" alt="Typing SVG" />

[<img src="https://img.shields.io/badge/License-MIT-F8B739.svg?style=for-the-badge&labelColor=1C2C2E&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI0Y4QjczOSIgZD0iTTEyIDJjNS41MjMgMCAxMCA0LjQ3NyAxMCAxMHMtNC40NzcgMTAtMTAgMTBTMiAxNy41MjMgMiAxMiA2LjQ3NyAyIDEyIDJ6bTAgMmE4IDggMCAxMDAgMTZhOCA4IDAgMDAwLTE2eiIvPjwvc3ZnPg==">](https://opensource.org/licenses/MIT)
[<img src="https://img.shields.io/badge/Deploy-Netlify-00C7B7?style=for-the-badge&labelColor=1C2C2E&logo=netlify">](https://jobtrackr7.netlify.app/)
[<img src="https://img.shields.io/badge/Firebase-Connected-FFCA28?style=for-the-badge&labelColor=1C2C2E&logo=firebase">](https://firebase.google.com/)
[<img src="https://img.shields.io/badge/Status-Active-4CAF50?style=for-the-badge&labelColor=1C2C2E&logo=statuspage">](https://github.com/phantombeast7/JobTrackr)

<br/>

[<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" />](#)

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=22&duration=3000&pause=1000&color=6F9EF8&center=true&vCenter=true&width=600&lines=Modern+Job+Application+Tracking;Seamless+Google+Drive+Integration;Smart+Reminder+System;Efficient+Organization" alt="Features Typing" />

<p align="center">
<strong>JobTrackr</strong> is a modern job tracking tool designed to streamline your job application process. Track applications, set reminders, store resumes, and access your data seamlessly with Google Drive integration. Built to help job seekers stay organized, efficient, and productive throughout their job search journey.
</p>

</div>

[<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" />](#)

<div align="center">

## 🌟 Features

| Feature | Description |
|:-------:|:------------|
| <img width="32" src="https://img.icons8.com/fluency/48/dashboard-layout.png" alt="Dashboard"/> **Dashboard** | A clean overview of all your job applications and reminders |
| <img width="32" src="https://img.icons8.com/fluency/48/task-completed.png" alt="Tracker"/> **Application Tracker** | Add, manage, and track job applications with custom statuses |
| <img width="32" src="https://img.icons8.com/fluency/48/alarm.png" alt="Reminder"/> **Reminder System** | Set reminders for important events like interviews and follow-ups |
| <img width="32" src="https://img.icons8.com/fluency/48/google-drive.png" alt="Drive"/> **Google Drive Integration** | Easily store and access your data on Google Drive |
| <img width="32" src="https://img.icons8.com/fluency/48/amazon-web-services.png" alt="AWS"/> **AWS SES Email Notifications** | Receive automated reminders and updates via email |

</div>

[<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" />](#)

## 🚀 Quick Start Guide

<details>
<summary><b>Step 1: Clone & Install</b></summary>

```bash
# Clone the repository
git clone https://github.com/phantombeast7/JobTrackr.git
cd JobTrackr

# Install dependencies
npm install
```
</details>

<details>
<summary><b>Step 2: Firebase Configuration</b></summary>

### 🔥 Firebase Setup

1. Create project at [Firebase Console](https://console.firebase.google.com/)
2. Get configuration:

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

### 📝 Environment Variables

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

### 🔒 Firestore Rules

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

### 📊 Firestore Indexes

```js
applications	userId Ascending resumeUrl Ascending __name__ Ascending
applications	userId Ascending createdAt Descending __name__ Descending
reminders	sent Ascending userId Ascending scheduledFor Ascending __name__ Ascending
reminders	userId Ascending scheduledFor Descending __name__ Descending
```
</details>

<details>
<summary><b>Step 3: Google Drive Setup</b></summary>

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google Drive API
3. Configure OAuth 2.0:

```bash
# Local URIs
http://localhost:3000
http://localhost:3000/api/auth/google-drive/callback

# Production URIs
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

<details>
<summary><b>Step 4: AWS SES Setup</b></summary>

1. Access [AWS Console](https://aws.amazon.com/console/)
2. Configure SES:
```env
AWS_SES_SMTP_HOST=YOUR_SMTP_HOST
AWS_SES_SMTP_PORT=YOUR_SMTP_PORT
AWS_SES_USER=YOUR_SMTP_USER
AWS_SES_PASSWORD=YOUR_SMTP_PASSWORD
AWS_SES_FROM_EMAIL=YOUR_VERIFIED_EMAIL
```
</details>

[<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" />](#)

<div align="center">

## 🤝 Contribute

<table>
<tr>
<td align="center">
<img width="60" src="https://img.icons8.com/fluency/96/bug.png" alt="Bug"/><br/>
<b>Bug Fixes</b>
</td>
<td align="center">
<img width="60" src="https://img.icons8.com/fluency/96/new.png" alt="Features"/><br/>
<b>New Features</b>
</td>
<td align="center">
<img width="60" src="https://img.icons8.com/fluency/96/light-on.png" alt="Ideas"/><br/>
<b>Suggestions</b>
</td>
</tr>
</table>

[Fork](https://github.com/phantombeast7/JobTrackr/fork) • [Create Issue](https://github.com/phantombeast7/JobTrackr/issues) • [Submit PR](https://github.com/phantombeast7/JobTrackr/pulls)

</div>

[<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" />](#)

<div align="center">

## 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT)

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=25&duration=3000&pause=1000&color=6F9EF8&center=true&vCenter=true&width=435&lines=Ready+to+Start%3F;Happy+Job+Hunting!+🎯;Made+with+❤️+by+JobTrackr+Team" alt="Footer Typing" />

</div>
