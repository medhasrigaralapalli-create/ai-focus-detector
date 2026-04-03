"""Simple test to trigger beeps manually."""
import winsound
import time

print("Testing beep functionality...")
print("You should hear 3 beeps in a row.\n")

for i in range(3):
    print(f"Beep {i+1}/3...")
    winsound.Beep(800, 800)  # 800Hz, 800ms
    time.sleep(0.5)

print("\nDone! If you heard all 3 beeps, sound is working.")
print("If you didn't hear anything, check your system volume.")
