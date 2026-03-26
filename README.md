<div align="center">
  <h1>🎓 Moshrif University ERP & Smart Attendance System</h1>
  <p>An advanced, AI-powered Smart Attendance and University Management System utilizing Facial Recognition, Liveness Detection, and real-time interactive dashboards.</p>
</div>

---

## 📝 About The Project

**Moshrif** is an integrated system designed to automate university attendance and manage academic operations. By leveraging state-of-the-art Computer Vision and AI algorithms, it ensures an interactive, secure, and touchless attendance experience. It completely eliminates proxy attendance through robust anti-spoofing measures and syncs everything in real-time to a fast, modern frontend.

---

## 🏗️ System Architecture (Arc)

The system is built on a modern micro-services architecture consisting of 4 seamlessly integrated layers. 

### 1. 🧠 AI Engine (01_AI_Engine) - `Computer Vision Layer`
- **Tech Stack:** Python, OpenCV, `dlib` (face_recognition), Flask.
- **Responsibilities:**
  - Captures live video feed.
  - **Liveness Check (Anti-Spoofing):** Calculates Eye Aspect Ratio (EAR) and micro-movements to reject photographs or digital screens.
  - Checks if the face is directly aligned and looking at the camera.
  - On verification, sends a JWT-authenticated POST request to the Backend API.
  - Streams the headless video feedback via Flask directly to the frontend for live monitoring.

### 2. ⚙️ Backend API (02_Backend_API) - `Business Logic Layer`
- **Tech Stack:** Python, FastAPI, SQLite, Pandas, PyJWT, smtplib.
- **Responsibilities:**
  - Acts as the core bridge securely connecting the AI, Database, and Frontend layers.
  - Exposes RESTful endpoints protected by JWT Authentication.
  - **Automated Alerts:** Sends responsive HTML emails to students confirming attendance via SMTP.
  - Processes data for the frontend dashboards (aggregating attendance logs, generating dynamic datasets using Pandas, identifying at-risk students).
  - Handles Excel (`.xlsx`) report generation and file exporting.

### 3. 💾 Database (03_Database) - `Data Layer`
- **Tech Stack:** SQLite.
- **Responsibilities:**
  - Relational database (`attendance.db`) containing the persistent logic.
  - **Tables:** `students`, `courses`, `lecture_schedule`, `registrations`, and `attendance_log`.
  - Driven by the central `create_tables.py` auto-migration script.

### 4. 🌐 Frontend Web (04_Frontend_Web) - `Presentation Layer`
- **Tech Stack:** React.js, TailwindCSS, Recharts.
- **Responsibilities:**
  - Modern, responsive **Smart Dashboard**.
  - **Live Monitor Screen:** Consumes the AI stream and simultaneously receives live socket updates.
  - **Admin Panel:** GUI to manage students, courses, map schedules, and handle registrations.
  - Interactive data visualization for attendance trends using Recharts.

### 🔄 Data Flow Summary:
1. 📷 Camera detects a face during an active lecture window.
2. 🤖 AI Engine verifies identity and proves Liveness (Anti-Spoofing), then dispatches Student ID to Backend.
3. ⚙️ Backend validates the current schedule room against database rules.
4. 💾 Attendance is permanently logged into `attendance_log`.
5. 📧 Email server immediately fires a confirmation email to the student's inbox.
6. 🌐 Frontend Dashboard state updates instantly to reflect the "Present" status on the Live Monitor.

---

## 🚀 Installation & Setup

### Prerequisites
Before you begin, ensure you have installed:
- [Python 3.10+](https://www.python.org/)
- [Node.js v16+](https://nodejs.org/)
- **C++ Build Tools** (Crucial specifically on Windows for `dlib` to compile properly).

### Step 1: Clone and Install Dependencies
Navigate to the project root directory and install all required Python modules:
```bash
# Install AI Engine and Backend dependencies via the centralized file
pip install -r requirements.txt
```

### Step 2: Initialize the Database
Generate the tables and schema for the system.
```bash
cd 03_Database
python create_tables.py
# If you have mock data: python fill_data.py
cd ..
```

### Step 3: Setup Environment Variables
Navigate to `02_Backend_API` and create a `.env` file to configure your secrets:
```env
ADMIN_PASSWORD=admin
SECRET_KEY=super_secret_key_change_me
SMTP_EMAIL=your_real_email@gmail.com
SMTP_PASSWORD=your_app_specific_password
```

---

## ▶️ Running the System

To fully boot the system, you must run the following 3 components securely located in their respective folders. It is recommended to use **3 separate terminal tabs**.

### 1. Start the Backend API (Terminal 1)
```bash
cd 02_Backend_API
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
*API will run on http://localhost:8000*

### 2. Start the AI Engine (Terminal 2)
*(Ensure the facial models `*.dat` and `encodings.pickle` exist inside the folder prior to running)*
```bash
cd 01_AI_Engine
python face_processor.py
```
*The AI stream will handle the camera on port 8001.*

### 3. Start the Frontend Application (Terminal 3)
```bash
cd 04_Frontend_Web
npm install
npm start
```
*The Web App will automatically open at http://localhost:3000*

---

## 🔐 Default Passwords & Credentials

For full access, use these initial development passwords. *(Found in `password.txt`)*

| Role / Target           | Default Credential            | Note                                    |
|-------------------------|-------------------------------|-----------------------------------------|
| **Admin Dashboard**     | `admin`                       | Change via `.env` (ADMIN_PASSWORD)      |
| **Instructor Course**   | `1234`                        | Assigned on course creation             |
| **JWT Secret**          | `super_secret_key_change_me`  | Change via `.env` (SECRET_KEY)          |

---

## 🛡️ Security Features
- **Biometric Anti-Spoofing:** Blocks digital screens and printed masks. Algorithm depends on subtle variance factors in eye states and nose bridging.
- **REST Protection:** No database endpoints are exposed without verifying valid `Bearer JWT` headers.
- **Data Protection:** Instructor passwords are treated using one-way `bcrypt` hashing before touching the SQLite file.
