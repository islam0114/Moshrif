import face_recognition
import cv2
import pickle
import requests
import os
import logging
import numpy as np
import threading
import time
import math
import winsound
from datetime import datetime
from typing import Dict, List, Tuple, Any
from flask import Flask, Response
from flask_cors import CORS

import config

# --- الإعدادات ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ThreadedCamera:
    def __init__(self, src):
        self.capture = cv2.VideoCapture(src)
        self.capture.set(cv2.CAP_PROP_BUFFERSIZE, 1) # تقليل البافر لمنع التأخير
        self.status, self.frame = self.capture.read()
        self.running = True
        self.lock = threading.Lock()
        self.thread = threading.Thread(target=self.update, daemon=True)
        self.thread.start()

    def update(self):
        while self.running:
            if self.capture.isOpened():
                status, frame = self.capture.read()
                if status:
                    with self.lock:
                        self.status = status
                        self.frame = frame
            time.sleep(0.005) # أسرع استجابة ممكنة

    def read(self):
        with self.lock:
            if self.frame is not None:
                return self.status, self.frame.copy()
            return False, None
        
    def stop(self):
        self.running = False
        if self.thread.is_alive():
            self.thread.join()
        self.capture.release()

class FaceAttendanceSystem:
    def __init__(self):
        self.data = self._load_encodings()
        self.marked_attendance = set() 
        self.stability_counters = {}
        self.eye_history = {} # 🔥 لتسجيل حركة العين (الحماية من الموبايل)
        self.last_results = [] 
        self.lock = threading.Lock()
        self.running = False
        self.output_frame = None 
        
        self.camera = ThreadedCamera(config.CAMERA_SOURCE)
        logger.info(f"✅ Moshrif Engine Initialized (Fast Headless & Liveness Mode) 🚀")

    def _load_encodings(self) -> Dict[str, Any]:
        if not os.path.exists(config.PICKLE_PATH):
            logger.error(f"❌ Error: {config.PICKLE_PATH} not found.")
            exit(1)
        try:
            with open(config.PICKLE_PATH, "rb") as f:
                return pickle.load(f)
        except Exception as e:
            logger.error(f"❌ Failed to load encodings: {e}")
            exit(1)

    def _send_attendance_record(self, student_id: str):
        if student_id in self.marked_attendance:
            return
        threading.Thread(target=self._process_registration, args=(student_id,)).start()

    def _process_registration(self, student_id):
        if student_id in self.marked_attendance:
            return
        try:
            self.marked_attendance.add(student_id)
            
            # 🔥 صوت "تيت" سريع وواضح (500 مللي ثانية)
            threading.Thread(target=lambda: winsound.Beep(1500, 500)).start()
            
            headers = {
                "Authorization": f"Bearer {config.JWT_TOKEN}",
                "Content-Type": "application/json"
            }
            response = requests.post(
                config.BACKEND_URL, 
                json={"student_id": student_id}, 
                headers=headers,
                timeout=1.5
            )
            
            if response.status_code in [200, 201]:
                print(f"✅ Attendance Recorded for ID: {student_id}")
            else:
                self.marked_attendance.remove(student_id)
                logger.warning(f"⚠️ Server error: {response.status_code}")

        except Exception as e:
            if student_id in self.marked_attendance:
                self.marked_attendance.remove(student_id)
            logger.error(f"❌ Connection Error: {e}")

    # 🔥 دالة حساب نسبة فتحة العين (Eye Aspect Ratio)
    def _eye_aspect_ratio(self, eye):
        A = math.hypot(eye[1][0] - eye[5][0], eye[1][1] - eye[5][1])
        B = math.hypot(eye[2][0] - eye[4][0], eye[2][1] - eye[4][1])
        C = math.hypot(eye[0][0] - eye[3][0], eye[0][1] - eye[3][1])
        if C == 0: return 0.0
        return (A + B) / (2.0 * C)

    def _is_live_and_facing(self, student_id, landmarks):
        try:
            # 1. فحص زاوية الوجه
            nose_bridge = landmarks['nose_bridge']
            left_eye = landmarks['left_eye']
            right_eye = landmarks['right_eye']
            nose_point = nose_bridge[-1]
            l_eye_center = np.mean(left_eye, axis=0)
            r_eye_center = np.mean(right_eye, axis=0)
            
            dist_l = math.hypot(nose_point[0] - l_eye_center[0], nose_point[1] - l_eye_center[1])
            dist_r = math.hypot(nose_point[0] - r_eye_center[0], nose_point[1] - r_eye_center[1])
            
            if dist_l == 0 or dist_r == 0: return False, False
            ratio = dist_l / dist_r
            is_facing = 0.5 < ratio < 1.7 

            # 2. 🔥 فحص الحيوية (الحماية ضد صورة الموبايل عبر حركة العين)
            ear_left = self._eye_aspect_ratio(left_eye)
            ear_right = self._eye_aspect_ratio(right_eye)
            avg_ear = (ear_left + ear_right) / 2.0

            if student_id not in self.eye_history:
                self.eye_history[student_id] = []
            
            self.eye_history[student_id].append(avg_ear)
            if len(self.eye_history[student_id]) > 10:
                self.eye_history[student_id].pop(0)

            # لو العين ثابتة تماماً (الفرق بين أكبر وأصغر فتحة عين شبه منعدم) = صورة
            ear_variance = max(self.eye_history[student_id]) - min(self.eye_history[student_id])
            is_live = ear_variance > 0.015 # لو في حركة دقيقة في العين يعتبر إنسان حقيقي

            return is_facing, is_live
        except: 
            return True, True 

    def _check_stability(self, person_id: str) -> bool:
        if person_id in self.marked_attendance: return True
        self.stability_counters[person_id] = self.stability_counters.get(person_id, 0) + 1
        return self.stability_counters[person_id] >= config.REQUIRED_STABLE_FRAMES

    def _draw_ui(self, frame, location, name: str, is_verified: bool, is_facing: bool, is_live: bool):
        # تصحيح الـ Scale ليتناسب مع التكبير
        upsample = getattr(config, 'UPSAMPLE_TIMES', 1)
        scale = config.SCALE_FACTOR
        
        top = int(location[0] / scale)
        right = int(location[1] / scale)
        bottom = int(location[2] / scale)
        left = int(location[3] / scale)

        if not is_live: color, text = (0, 0, 255), "FAKE/PHOTO DETECTED!"
        elif is_verified: color, text = (0, 255, 100), f"ID: {name}"
        elif not is_facing: color, text = (0, 140, 255), "Look at Cam"
        elif name == "Unknown": color, text = (80, 80, 255), "Unknown"
        else: color, text = (255, 255, 0), "Scanning Liveness..."

        cv2.rectangle(frame, (left, top), (right, bottom), color, 2, cv2.LINE_AA)
        (text_w, text_h), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_DUPLEX, 0.6, 1)
        cv2.rectangle(frame, (left, top - 25), (left + text_w + 10, top), color, cv2.FILLED)
        cv2.putText(frame, text, (left + 5, top - 7), cv2.FONT_HERSHEY_DUPLEX, 0.6, (0, 0, 0), 1, cv2.LINE_AA)

    def start_engine(self):
        self.running = True
        # 🔥 جلب إعداد التكبير للمسافات البعيدة
        upsample_times = getattr(config, 'UPSAMPLE_TIMES', 2) 

        while self.running:
            ret, frame = self.camera.read()
            if not ret or frame is None: 
                time.sleep(0.01)
                continue

            try:
                small_frame = cv2.resize(frame, (0, 0), fx=config.SCALE_FACTOR, fy=config.SCALE_FACTOR)
                rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
                
                # 🔥 تفعيل upsample_times عشان يلقط من بعيد جداً
                locations = face_recognition.face_locations(rgb_small_frame, model=config.DETECTION_MODEL, number_of_times_to_upsample=upsample_times)
                current_results = []
                current_frame_names = []

                if locations:
                    landmarks_list = face_recognition.face_landmarks(rgb_small_frame, locations)
                    encodings = face_recognition.face_encodings(rgb_small_frame, locations)

                    for idx, face_encoding in enumerate(encodings):
                        student_id, is_facing, is_live = "Unknown", True, True
                        
                        face_distances = face_recognition.face_distance(self.data["encodings"], face_encoding)
                        if len(face_distances) > 0:
                            best_match_idx = np.argmin(face_distances)
                            if face_distances[best_match_idx] <= config.TOLERANCE:
                                student_id = self.data["ids"][best_match_idx]

                        if idx < len(landmarks_list):
                            is_facing, is_live = self._is_live_and_facing(student_id, landmarks_list[idx])

                        if student_id != "Unknown" and is_facing and is_live and self._check_stability(student_id):
                            self._send_attendance_record(student_id)

                        current_frame_names.append(student_id)
                        current_results.append({
                            "loc": locations[idx], "name": student_id, 
                            "verified": student_id in self.marked_attendance, 
                            "facing": is_facing, "live": is_live
                        })
                    
                    for user in list(self.stability_counters.keys()):
                        if user not in current_frame_names and user not in self.marked_attendance:
                            self.stability_counters[user] = 0
                            if user in self.eye_history:
                                del self.eye_history[user]

                with self.lock:
                    self.last_results = current_results

            except Exception as e: pass
            time.sleep(0.02) # تسريع المعالجة

    def run_headless_stream(self):
        logger.info("📡 Video stream is routing to Frontend. UI window is hidden.")
        while self.running:
            ret, frame = self.camera.read()
            if not ret or frame is None: 
                time.sleep(0.01)
                continue

            with self.lock:
                results = self.last_results.copy()

            for res in results:
                self._draw_ui(frame, res["loc"], res["name"], res["verified"], res["facing"], res.get("live", True))

            self.output_frame = frame.copy() 
            time.sleep(0.01) # تقليل الانتظار هنا لضمان سلاسة الفيديو

# ==========================================
# 🌐 خادم الويب لبث الفيديو (Web Video Stream)
# ==========================================
stream_app = Flask(__name__)
CORS(stream_app)

def generate_frames():
    while True:
        if hasattr(system, 'output_frame') and system.output_frame is not None:
            # 🔥 ضغط جودة الصورة (JPEG Quality 65) لتقليل اللاج لأقصى درجة
            encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 65]
            ret, buffer = cv2.imencode('.jpg', system.output_frame, encode_param)
            if ret:
                frame_bytes = buffer.tobytes()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        time.sleep(0.01) # 🔥 تسريع البث للمتصفح (إزالة اللاج)

@stream_app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    system = FaceAttendanceSystem()
    
    threading.Thread(target=system.start_engine, daemon=True).start()
    threading.Thread(target=lambda: stream_app.run(host="0.0.0.0", port=8001, debug=False, use_reloader=False), daemon=True).start()
    
    try:
        system.run_headless_stream()
    except KeyboardInterrupt:
        system.running = False
        system.camera.stop()
        print("\n🛑 AI Engine Stopped Safely.")