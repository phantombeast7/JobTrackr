# <div align="center">🚀 **JobTrackr**</div>

<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=28&duration=3000&pause=1000&color=539BF5&center=true&vCenter=true&repeat=true&width=435&lines=Track+Your+Job+Hunt;Manage+Applications;Schedule+Interviews;Analyze+Progress" alt="Typing SVG" />

[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge&labelColor=black)](https://opensource.org/licenses/MIT)
[![Deploy](https://img.shields.io/badge/Deploy-Netlify-00C7B7?style=for-the-badge&logo=netlify&labelColor=black)](https://jobtrackr7.netlify.app/)
[![Firebase](https://img.shields.io/badge/Firebase-Connected-FFCA28?style=for-the-badge&logo=firebase&labelColor=black)](https://firebase.google.com/)
[![Status](https://img.shields.io/badge/Status-Active-4EAA25?style=for-the-badge&labelColor=black)](https://github.com/phantombeast7/JobTrackr)

<br/>

<div align="center">
  <img src="https://skillicons.dev/icons?i=react,typescript,tailwind,firebase,aws" alt="Tech Stack" />
</div>

<br/>

<p align="center">
  <img src="https://raw.githubusercontent.com/phantombeast7/JobTrackr/main/public/hero.png" alt="JobTrackr Hero" width="600px" style="border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.2);" />
</p>

</div>

<div align="center">
  <h3>
    <a href="https://jobtrackr7.netlify.app/demo">View Demo</a>
    ·
    <a href="https://github.com/phantombeast7/JobTrackr/issues">Report Bug</a>
    ·
    <a href="https://github.com/phantombeast7/JobTrackr/issues">Request Feature</a>
  </h3>
</div>

<br/>

<p align="center">
  <b>JobTrackr</b> revolutionizes your job search with a modern, intuitive interface and powerful features. Built with cutting-edge technology and following best practices for an exceptional user experience.
</p>

---

## 🌟 **Key Features**

<div align="center">
<table>
<tr>
<td align="center" width="33%">
<img width="100%" src="https://raw.githubusercontent.com/phantombeast7/JobTrackr/main/public/dashboard.gif" alt="Dashboard Demo" style="border-radius: 10px;"/>
<br/>
<h3>📊 Smart Dashboard</h3>
<p>Real-time analytics with interactive charts</p>
</td>
<td align="center" width="33%">
<img width="100%" src="https://raw.githubusercontent.com/phantombeast7/JobTrackr/main/public/tracker.gif" alt="Tracker Demo" style="border-radius: 10px;"/>
<br/>
<h3>📝 Application Tracker</h3>
<p>Elegant status management system</p>
</td>
<td align="center" width="33%">
<img width="100%" src="https://raw.githubusercontent.com/phantombeast7/JobTrackr/main/public/reminder.gif" alt="Reminder Demo" style="border-radius: 10px;"/>
<br/>
<h3>⏰ Smart Reminders</h3>
<p>AI-powered notification system</p>
</td>
</tr>
</table>
</div>

## 🎨 **Technical Features**

<div align="center">

| 🔥 Architecture | 🎯 Best Practices | 🌈 Modern Stack |
|----------------|-------------------|-----------------|
| Modular Design | Small, Focused Files | React + TypeScript |
| Clean Architecture | Single Responsibility | Tailwind CSS |
| Utility Functions | Code Reusability | Firebase |
| Type Safety | Comprehensive Testing | AWS Integration |

</div>

## ⚡ **Quick Start**

<details>
<summary>🔧 Installation Steps</summary>

```bash
# Clone the repository
git clone https://github.com/phantombeast7/JobTrackr.git

# Navigate to project directory
cd JobTrackr

# Install dependencies
npm install

# Start development server
npm run dev
```

</details>

<details>
<summary>🔑 Environment Setup</summary>

Create `.env.local\`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google Drive Integration
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

</details>

## 📁 **Project Structure**

\`\`\`bash
src/
├── components/         # Reusable UI components
│   ├── ui/            # Base UI components
│   └── features/      # Feature-specific components
├── hooks/             # Custom React hooks
├── lib/              # Utility functions and helpers
├── services/         # External service integrations
└── types/            # TypeScript type definitions
\`\`\`

## 🛡️ **Security**

<details>
<summary>Firebase Security Rules</summary>

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Authentication check
    function isAuthenticated() {
      return request.auth != null;
    }

    // User ownership check
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // Collection rules
    match /users/{userId} {
      allow read, write: if isAuthenticated() && isOwner(userId);
    }

    match /applications/{applicationId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && isOwner(resource.data.userId);
    }
  }
}
```

</details>

## 🚀 **Development**

<div align="center">

| Command | Description |
|---------|-------------|
| \`npm run dev\` | Start development server |
| \`npm run build\` | Build for production |
| \`npm run test\` | Run test suite |
| \`npm run lint\` | Lint code |

</div>

## 🤝 **Contributing**

We follow these best practices:
- Create small, focused components
- Write clean, maintainable code
- Follow single responsibility principle
- Include comprehensive tests
- Document code thoroughly

<div align="center">

1. 🍴 Fork the repository
2. 🌿 Create a feature branch
3. 💻 Make your changes
4. ✅ Run tests
5. 📬 Submit a pull request

</div>

## 💖 **Support**

<div align="center">

⭐️ Star this repo if you found it helpful!

[Buy me a coffee](https://buymeacoffee.com/phantombeast7) if you want to support development.

</div>

---

<div align="center">

Made with 💙 by [PhantomBeast7](https://github.com/phantombeast7)

<img src="https://raw.githubusercontent.com/phantombeast7/JobTrackr/main/public/wave.gif" alt="Wave" width="150px" />

</div>
