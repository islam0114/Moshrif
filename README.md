# Moshrif University ERP & Smart Attendance System 🎓

Moshrif is a comprehensive smart attendance system and university ERP powered by Artificial Intelligence (Facial Recognition & Liveness Detection). It offers an automated, secure, and seamless way to manage student attendance, track lectures, and provide real-time dashboard analytics, paired with automated email notifications.

## 🏗️ Architecture & Project Structure

The project is divided into 4 main micro-services/components:

### 1. 🧠 AI Engine (`01_AI_Engine/`)
- **Core Technology**: Python, OpenCV, `dlib` (via `face_recognition`), Flask.
- **Features**:
  - Real-time video stream processing and face detection.
  - **Custom Liveness Check (Anti-Spoofing)**: Uses Eye Aspect Ratio (EAR) and micro-movements to reject photos/mobile screens, ensuring the person is physically present.
  - Face alignment and orientation checks (student must look directly at the camera).
  - Headless video streaming to the frontend via a Flask web server (`/video_feed`).
  - Sends immediate authenticated POST requests to the Backend API to securely mark attendance.

### 2. ⚙️ Backend API (`02_Backend_API/`)
- **Core Technology**: Python, FastAPI, SQLite, JWT Auth, Pandas.
- **Features**:
  - Comprehensive RESTful API endpoints for Admin interactions, CRUDS, and attendance processing.
  - **JWT Authentication** for secure endpoint protection.
  - **Automated Email Notifications**: Beautiful HTML emails sent automatically to students upon successful attendance marking via SMTP.
  - Data aggregations for analytical dashboards (total attendance, active courses, daily stats, risk reports) using Pandas.
  - Export functionality to generate Excel (`.xlsx`) attendance sheets.

### 3. 💾 Database (`03_Database/`)
- **Core Technology**: SQLite.
- **Features**:
  - Contains lightweight SQLite database `attendance.db` and DDL scripts `create_tables.py` for setup.
  - Relational schema tables include: `students`, `courses`, `lecture_schedule`, `registrations`, `attendance_log`.

### 4. 🌐 Frontend Web (`04_Frontend_Web/`)
- **Core Technology**: React.js, TailwindCSS, Recharts.
- **Features**:
  - Interactive Smart Dashboard (Overview, Live Monitor, Course Management, Admin Panel).
  - Consumes the headless AI video stream and displays live attendance statuses directly in the browser.
  - Rich charts and statistical views powered by `recharts`.
  - Modern, responsive, and engaging UI.

---

## 🚀 Setup and Installation

### Prerequisites
- Python 3.10+
- Node.js (v16+)
- C++ Build Tools (Required in Windows to compile `dlib`)

### 1. Database Setup
```bash
cd 03_Database
python create_tables.py
# (Optional) python fill_data.py to populate with mock data
```

### 2. Backend Setup
```bash
cd 02_Backend_API
pip install fastapi uvicorn pandas bcrypt pyjwt python-dotenv openpyxl requests
```
*Note: Create a `.env` file in the `02_Backend_API` folder containing your secret environment variables:*
```env
ADMIN_PASSWORD=admin
SECRET_KEY=your_super_secret_jwt_key
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```
Run the server:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. AI Engine Setup
```bash
cd 01_AI_Engine
pip install opencv-python face_recognition flask flask-cors requests numpy
```
*Make sure you run `trainer.py` to generate the `encodings.pickle` if not already present, then run the engine:*
```bash
python face_processor.py
```

### 4. Frontend Web Setup
```bash
cd 04_Frontend_Web
npm install
npm start
```
The application will launch on `http://localhost:3000`.

---

## 🛡️ Security Details
- **Hardware Anti-Spoofing:** The AI layer algorithmically calculates eye variance and orientation ratios to physically block printouts or digital playback.
- **Micro-service Isolation:** AI Engine communicates securely with the Backend via JWT tokens.
- **Encryption:** Instructor and Admin passwords are encrypted with one-way `bcrypt` hashes inside the database.
