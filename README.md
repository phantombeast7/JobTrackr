<div align="center">

# 🚀 JobTrackr

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/phantombeast7/JobTrackr/issues)
[![Stars](https://img.shields.io/github/stars/phantombeast7/JobTrackr?style=social)](https://github.com/phantombeast7/JobTrackr/stargazers)
[![Firebase](https://img.shields.io/badge/Firebase-Ready-orange)](https://firebase.google.com/)
[![AWS](https://img.shields.io/badge/AWS-Integrated-yellow)](https://aws.amazon.com/)
[![Google Drive](https://img.shields.io/badge/Google%20Drive-Connected-blue)](https://drive.google.com/)

<h3>Your Ultimate Job Application Companion</h3>

[Live Demo](https://jobtrackr7.netlify.app) · [Report Bug](https://github.com/phantombeast7/JobTrackr/issues) · [Request Feature](https://github.com/phantombeast7/JobTrackr/issues)

![JobTrackr Dashboard](https://jobtrackr7.netlify.app/dashboard-preview.png)

</div>

## 🌟 Overview

JobTrackr is your all-in-one solution for managing job applications efficiently. From tracking applications to managing interviews, storing resumes, and analyzing your job search progress, JobTrackr streamlines your entire job-seeking journey.

## ✨ Features

<details>
<summary><b>📊 Smart Dashboard</b></summary>

- Real-time overview of all applications
- Visual analytics and insights
- Customizable widgets
- Progress tracking
</details>

<details>
<summary><b>📝 Application Management</b></summary>

- Track application status
- Store company details
- Interview scheduling
- Follow-up reminders
- Custom notes and tags
</details>

<details>
<summary><b>📄 Resume Hub</b></summary>

- Multiple resume versions
- ATS-friendly templates
- Version control
- Direct Google Drive integration
</details>

<details>
<summary><b>⏰ Smart Reminders</b></summary>

- Interview notifications
- Follow-up reminders
- Custom alerts
- Email notifications via AWS SES
</details>

<details>
<summary><b>📁 Cloud Integration</b></summary>

- Google Drive sync
- Document management
- Automatic backups
- Secure storage
</details>

<details>
<summary><b>📈 Analytics</b></summary>

- Success rate tracking
- Application insights
- Interview performance
- Trend analysis
</details>

## 🛠️ Installation

<details>
<summary><b>1. Clone & Setup</b></summary>

```bash
# Clone the repository
git clone https://github.com/phantombeast7/JobTrackr.git

# Navigate to project
cd JobTrackr

# Install dependencies
npm install
```
</details>

<details>
<summary><b>2. Environment Configuration</b></summary>

Create `.env.local` in the root directory:

```env
# Firebase Configuration
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

# Google Drive Integration
NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID=
GOOGLE_DRIVE_CLIENT_SECRET=
NEXT_PUBLIC_GOOGLE_DRIVE_REDIRECT_URI=

# AWS SES Configuration
AWS_SES_SMTP_HOST=
AWS_SES_SMTP_PORT=
AWS_SES_USER=
AWS_SES_PASSWORD=
AWS_SES_FROM_EMAIL=
```
</details>

<details>
<summary><b>3. Service Configuration</b></summary>

### Firebase Setup
1. Create project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication & Firestore
3. Configure security rules from [FIRESTORE_RULES.md](./FIRESTORE_RULES.md)

### Google Drive Setup
1. Create project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable Drive API
3. Configure OAuth credentials

### AWS SES Setup
1. Configure in [AWS Console](https://console.aws.amazon.com/ses)
2. Verify email addresses
3. Generate SMTP credentials
</details>

## 🚀 Quick Start

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start
```

## 📊 Core Features

### Application Tracking
- Status management
- Interview scheduling
- Follow-up system
- Notes and feedback

### Resume Management
- Version control
- ATS optimization
- Template library
- Cloud storage

### Smart Notifications
- Email reminders
- Interview alerts
- Follow-up prompts
- Custom notifications

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create feature branch:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit changes:
   ```bash
   git commit -m 'Add AmazingFeature'
   ```
4. Push to branch:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request

## 📜 License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for details.

## 🔗 Quick Links

- [Documentation](https://jobtrackr7.netlify.app/docs)
- [API Reference](https://jobtrackr7.netlify.app/api)
- [Contributing Guide](./CONTRIBUTING.md)
- [Security Policy](./SECURITY.md)

## 🌐 Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Firebase, Node.js
- **Database**: Firestore
- **Storage**: Google Drive API
- **Email**: AWS SES
- **Authentication**: Firebase Auth
- **Analytics**: Firebase Analytics

## 📫 Support

- Email: support@jobtrackr.dev
- Twitter: [@JobTrackr](https://twitter.com/JobTrackr)
- Discord: [Join Community](https://discord.gg/jobtrackr)

---

<div align="center">
Made with ❤️ by <a href="https://github.com/phantombeast7">PhantomBeast</a>

[⬆ Back to Top](#-jobtrackr)
</div>
