import os

# ==========================================
# (Paths)
# ==========================================
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PICKLE_PATH = os.path.join(CURRENT_DIR, "encodings.pickle")

# ==========================================
# (API Settings)
# ==========================================
BACKEND_URL = "http://localhost:8000/api/attendance/mark"


JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWlfZW5naW5lIiwiZXhwIjoyMDg2NDQxMTA4fQ.Ib_rnAPk7CABwmLNP2JdWJSMsLSUXKeUvQ9Gho6Cm5k"

# ==========================================
# (Camera Settings)
# ==========================================
CAMERA_SOURCE = "rtsp://admin:JZDRPZ@192.168.1.7:554/Streaming/Channels/102"

# ==========================================
# (AI & Detection)
# ==========================================
TOLERANCE = 0.5                # نسبة السماحية (كلما قلت، زادت الصرامة)
DETECTION_MODEL = "hog"         # الموديل المستخدم لكشف الوجوه
SCALE_FACTOR = 1              # نسبة تصغير الفريم لزيادة السرعة
UPSAMPLE_TIMES = 2          # السر هنا: ده اللي بيكبر الصورة داخلياً ويلقط الوجوه البعيدة جداً
REQUIRED_STABLE_FRAMES = 5      # عدد الفريمات المطلوبة لتأكيد ثبات الشخص