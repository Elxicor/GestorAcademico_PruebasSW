# Student Companion App 📘

> *Organize your academic life, one task at a time.*

Student Companion is a **production-ready Flutter application** designed specifically for students to manage academic tasks, deadlines, and priorities in a simple yet powerful way.  
The app focuses on **clarity, offline reliability, and real-world usability**, rather than demo-style features.

---

## 📖 Overview

In modern academic life, students often struggle with:
- Forgetting deadlines  
- Poor task prioritization  
- Scattered notes across apps  
- Overwhelming to-do lists  

**Student Companion** solves these problems by providing a **single, focused platform** for task planning, progress tracking, and daily academic clarity — without requiring an internet connection.

---

## 🛠️ Core Objectives

- Improve student productivity  
- Reduce missed deadlines  
- Encourage structured planning  
- Provide a distraction-free experience  
- Work reliably **offline-first**  

---

## 🚀 Features

### 📝 Task Management
- Create, edit, and delete tasks seamlessly  
- Assign **subjects**, **notes**, **priority**, and **due dates**  
- One-tap toggle for completed / pending tasks  
- Priority-based task organization  
- Smooth animations and instant UI updates  

### 📊 Dashboard & Insights
- Clean home dashboard with **upcoming tasks**
- Quick academic insights:
  - Total tasks created
  - Completed vs pending tasks
  - High-priority tasks
  - Overdue tasks
  - Number of active subjects
- Pull-to-refresh support for instant updates  

### 🎯 Priority System
- High Priority → Red  
- Medium Priority → Orange  
- Low Priority → Green  
- Visual cues help students **focus on what matters most**  

### ⏰ Due Date Intelligence
- Automatic sorting by due date  
- Human-readable dates:
  - Today  
  - Tomorrow  
  - Yesterday  
- Overdue tasks clearly highlighted  

### 🔍 Smart Search & Filters
- Search across:
  - Task title  
  - Subject  
  - Notes  
- Advanced filters:
  - All tasks  
  - Pending  
  - Completed  
  - High priority  
  - Overdue  

### 💾 Offline First Architecture
- No login required  
- No internet dependency  
- Data stored securely on device  
- Fast read/write operations  
- Reliable performance even on low-end devices  

---

## 🎨 UI / UX Philosophy

- Minimalistic and distraction-free  
- Built using **Material Design 3**  
- Indigo-based color palette  
- Student-friendly typography  
- Clean empty-state guidance screens  
- Designed primarily for **mobile-first usage**  

---

## 🧠 Tech Stack

- **Flutter 3.19**
- **Dart**
- **Material 3**
- **SharedPreferences** for local persistence
- Platform support:
  - iOS
  - Android
  - macOS (experimental)
  - Web (experimental)

---

## 🏗️ Project Architecture

```
lib/
├── main.dart                      # Application entry point
├── models/
│   └── task.dart                  # Task model & priority enum
├── screens/
│   ├── home_screen.dart           # Dashboard & statistics
│   └── tasks_screen.dart          # Task listing, filters & search
├── utils/
│   ├── database_service.dart      # Local CRUD operations
│   └── app_date_utils.dart        # Date helpers & formatting
└── widgets/
    └── task_card.dart             # Reusable UI component
```

### Architecture Highlights
- Clear separation of concerns  
- Service-based local storage handling  
- Reusable widgets for scalability  
- Easy to extend with future features  

---

## 📱 Platform Support

| Platform | Status | Notes |
|--------|--------|------|
| iOS | ✅ Fully Supported | Tested on physical iPhone |
| Android | ✅ Supported | Stable build |
| macOS | ⚠️ Experimental | Limited testing |
| Web | ⚠️ Experimental | UI-focused |
| Windows/Linux | ⚠️ Experimental | Basic support |

---

## 🚦 Getting Started

### Prerequisites
- Flutter SDK ≥ 3.19
- Android Studio or Xcode
- Emulator or physical device

### Installation

```bash
git clone https://github.com/jaygautam-creator/student_companion.git
cd student_companion
flutter pub get
flutter run
```

---

## 🧪 Testing & Validation

Tested on:
- iPhone 12 (Physical Device)
- iOS Simulator
- Android Emulator (Pixel Series)
- Real student task workflows

---

## 🔮 Future Roadmap

### Planned Features
- Local notifications for reminders  
- Dark mode with system sync  
- Calendar-based task view  
- Subject-wise analytics  
- Study streak tracking  
- Export / Import tasks  
- Firebase cloud sync  
- Pomodoro study timer  
- Grade & course tracking  

---

## 🎓 Educational Value

This project demonstrates:
- Real-world Flutter architecture  
- Offline-first mobile app design  
- State handling & persistence  
- UI/UX decision-making  
- Production-level folder structuring  

Ideal for:
- Flutter learners  
- Mobile app portfolios  
- Academic project submissions  
- Resume & interview discussion  

---

## 👨‍💻 Author

**Jay Gautam**  
B.Tech CSE (AI & ML)  
Flutter & App Development Enthusiast  

- GitHub: https://github.com/jaygautam-creator
- LinkedIn: https://www.linkedin.com/in/jay-gautam-coder/  
- Portfolio: https://jaygautamportfolio.netlify.app/

---

## 📄 License

MIT License

Copyright (c) 2024 Jay Gautam

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction.

---

⭐ If you find this project useful, consider giving it a star on GitHub!  
Built with ❤️ for students everywhere 🎓
