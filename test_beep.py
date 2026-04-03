"""Quick test script to verify beep and eye detection work."""
import cv2
import winsound
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Test 1: Can we make a beep?
logger.info("TEST 1: Playing beep...")
try:
    winsound.Beep(800, 800)
    logger.info("✓ BEEP WORKED!")
except Exception as e:
    logger.error("✗ BEEP FAILED: %s", e)

# Test 2: Can we access the eye cascade?
logger.info("\nTEST 2: Loading eye cascade...")
try:
    eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_eye.xml")
    if eye_cascade.empty():
        logger.error("✗ Eye cascade is empty!")
    else:
        logger.info("✓ Eye cascade loaded: %s", cv2.data.haarcascades + "haarcascade_eye.xml")
except Exception as e:
    logger.error("✗ Failed to load: %s", e)

# Test 3: Start camera and test eye detection
logger.info("\nTEST 3: Starting camera for 10 seconds...")
logger.info("Point your face at camera, then look away")

cap = cv2.VideoCapture(0)
if not cap.isOpened():
    logger.error("✗ Cannot open camera!")
else:
    logger.info("✓ Camera opened")
    
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    
    for i in range(100):  # 100 frames at ~30fps ≈ 3 seconds
        ret, frame = cap.read()
        if not ret:
            logger.error("Failed to read frame")
            break
        
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.08, 5, minSize=(36, 36))
        
        if len(faces) > 0:
            x, y, w, h = faces[0]
            face_region = frame[y:y+h, x:x+w]
            gray_face = cv2.cvtColor(face_region, cv2.COLOR_BGR2GRAY)
            
            eyes = eye_cascade.detectMultiScale(
                gray_face,
                scaleFactor=1.05,
                minNeighbors=3,
                minSize=(15, 15),
                maxSize=(int(w*0.4), int(h*0.4))
            )
            
            logger.info("Frame %d: Face detected, Eyes found: %d", i, len(eyes))
            
            if len(eyes) == 0:
                logger.warning("→→→ NO EYES - SHOULD BEEP! →→→")
                winsound.Beep(800, 500)
        
        # Show result
        cv2.imshow('Eye Detection Test', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()
    logger.info("✓ Camera test complete")

logger.info("\nAll tests done!")
