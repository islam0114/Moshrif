import cv2
import dlib
import numpy as np
import os
import logging
from scipy.spatial import distance as dist
from typing import Tuple, List, Optional

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class LivenessDetector:
    """
    Implements Eye Aspect Ratio (EAR) logic to detect blinks for liveness verification.
    """
    
    # Dlib 68-point facial landmark indices for eyes
    # 
    RIGHT_EYE_IDX = (36, 42)
    LEFT_EYE_IDX = (42, 48)
    
    def __init__(self, predictor_path: Optional[str] = None):
        """
        Initialize the Dlib face detector and shape predictor.
        
        Args:
            predictor_path (str, optional): Custom path to the .dat file. 
                                            If None, attempts to find it dynamically.
        """
        # Resolve path dynamically if not provided
        if predictor_path is None:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            self.predictor_path = os.path.join(current_dir, "shape_predictor_68_face_landmarks.dat")
        else:
            self.predictor_path = predictor_path

        # Validate file existence
        if not os.path.exists(self.predictor_path):
            logger.error(f"❌ Error: Shape predictor not found at {self.predictor_path}")
            raise FileNotFoundError(f"Could not find {self.predictor_path}. Please check the file location.")

        logger.info(f"[INFO] Loading face landmarks from: {self.predictor_path}")
        
        # Initialize Dlib components
        self.detector = dlib.get_frontal_face_detector()
        self.predictor = dlib.shape_predictor(self.predictor_path)

    def _calculate_ear(self, eye_points: np.ndarray) -> float:
        """
        Compute the Eye Aspect Ratio (EAR) for a single eye.
        
        Formula:
            EAR = (|p2 - p6| + |p3 - p5|) / (2 * |p1 - p4|)
        
        Args:
            eye_points (np.ndarray): 6 (x, y) coordinates representing the eye.
            
        Returns:
            float: The aspect ratio.
        """
        # Compute the euclidean distances between the two sets of
        # vertical eye landmarks (x, y)-coordinates
        A = dist.euclidean(eye_points[1], eye_points[5])
        B = dist.euclidean(eye_points[2], eye_points[4])

        # Compute the euclidean distance between the horizontal
        # eye landmark (x, y)-coordinates
        C = dist.euclidean(eye_points[0], eye_points[3])

        # Compute the eye aspect ratio
        ear = (A + B) / (2.0 * C)
        return ear

    def is_live(self, frame: np.ndarray, threshold: float = 0.20) -> Tuple[bool, float]:
        """
        Detects if a subject is blinking based on the Eye Aspect Ratio.

        Args:
            frame (np.ndarray): The current video frame (BGR).
            threshold (float): The EAR threshold below which an eye is considered closed.

        Returns:
            Tuple[bool, float]: 
                - bool: True if eye is closed (EAR < threshold), False otherwise.
                - float: The calculated average EAR value.
        """
        # Convert frame to grayscale for Dlib processing
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Detect faces in the grayscale frame
        rects = self.detector(gray, 0)

        # Loop over the face detections (we assume the primary face is the target)
        for rect in rects:
            # Determine the facial landmarks for the face region
            shape = self.predictor(gray, rect)
            
            # Convert the landmark (x, y)-coordinates to a NumPy array
            shape_np = np.array([[p.x, p.y] for p in shape.parts()])

            # Extract the left and right eye coordinates
            left_eye_pts = shape_np[self.LEFT_EYE_IDX[0] : self.LEFT_EYE_IDX[1]]
            right_eye_pts = shape_np[self.RIGHT_EYE_IDX[0] : self.RIGHT_EYE_IDX[1]]

            # Calculate the Eye Aspect Ratio for both eyes
            left_ear = self._calculate_ear(left_eye_pts)
            right_ear = self._calculate_ear(right_eye_pts)

            # Average the EAR together for more stability
            avg_ear = (left_ear + right_ear) / 2.0

            # Return status and value
            # Note: We return the raw status so the main processor can handle the counter logic
            return (avg_ear < threshold), avg_ear

        # Fallback if no face is detected
        return False, 0.0