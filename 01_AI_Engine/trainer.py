import face_recognition
import pickle
import logging
import sys
from pathlib import Path
from typing import List, Dict, Any

# --- Configuration & Logging Setup ---
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger(__name__)

class Config:
    """Configuration paths and constants."""
    # Resolve paths relative to this script's location
    # Structure: 01_AI_Engine/trainer.py -> Parent is 01_AI_Engine -> Grandparent is Project Root
    BASE_DIR = Path(__file__).resolve().parent.parent
    
    # Path to the dataset containing images (05_Project_Assets/dataset)
    DATASET_DIR = BASE_DIR / "05_Project_Assets" / "dataset"
    
    # Output path for the trained model (01_AI_Engine/encodings.pickle)
    OUTPUT_PATH = BASE_DIR / "01_AI_Engine" / "encodings.pickle"
    
    # Supported image formats
    VALID_EXTENSIONS = {'.jpg', '.jpeg', '.png'}

class FaceEmbeddingGenerator:
    """
    Handles the process of loading images, detecting faces, 
    generating embeddings, and serializing the data.
    """

    def __init__(self):
        self.known_encodings: List[Any] = []
        self.known_ids: List[str] = []
        
        # Verify dataset existence
        if not Config.DATASET_DIR.exists():
            logger.error(f"❌ Dataset directory not found at: {Config.DATASET_DIR}")
            sys.exit(1)

    def process_images(self):
        """Iterates through the dataset and generates face encodings."""
        logger.info(f"[INFO] Scanning images in: {Config.DATASET_DIR}")
        
        # Get list of all files in dataset directory
        image_files = [
            p for p in Config.DATASET_DIR.iterdir() 
            if p.is_file() and p.suffix.lower() in Config.VALID_EXTENSIONS
        ]

        if not image_files:
            logger.warning("⚠️ No images found in the dataset directory.")
            return

        for image_path in image_files:
            self._encode_single_image(image_path)

        self._save_encodings()

    def _encode_single_image(self, image_path: Path):
        """
        Helper method to process a single image file.
        
        """
        student_id = image_path.stem.split('_')[0]
        
        try:
            # Load image using face_recognition (uses RGB automatically)
            image = face_recognition.load_image_file(str(image_path))
            
            # Detect face encodings (128-d vector)
            # We assume there is mainly one face per image for registration
            encodings = face_recognition.face_encodings(image)

            if len(encodings) > 0:
                # Take the first face found
                self.known_encodings.append(encodings[0])
                self.known_ids.append(student_id)
                logger.info(f"✅ Encoded: {student_id}")
            else:
                logger.warning(f"⚠️ No face detected in: {image_path.name}")
        
        except Exception as e:
            logger.error(f"❌ Error processing {image_path.name}: {e}")

    def _save_encodings(self):
        """Serializes the encoding data to a pickle file."""
        if not self.known_encodings:
            logger.warning("⚠️ No encodings were generated. Skipping save.")
            return

        data = {
            "encodings": self.known_encodings, 
            "ids": self.known_ids  # Matches the key expected by face_processor.py
        }

        try:
            # Ensure output directory exists
            Config.OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
            
            with open(Config.OUTPUT_PATH, "wb") as f:
                f.write(pickle.dumps(data))
            
            logger.info("-" * 40)
            logger.info(f"[SUCCESS] Model saved to: {Config.OUTPUT_PATH}")
            logger.info(f"[TOTAL] {len(self.known_ids)} students successfully registered.")
            logger.info("-" * 40)
            
        except IOError as e:
            logger.error(f"❌ Failed to write pickle file: {e}")

if __name__ == "__main__":
    trainer = FaceEmbeddingGenerator()
    trainer.process_images()