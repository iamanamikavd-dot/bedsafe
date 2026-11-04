# BedSafe

BedSafe is an IoT-based system that helps prevent pressure ulcers (bedsores) in bedridden patients. Force-sensitive resistor (FSR) sensors detect how long a patient has been lying in one position, and the system alerts caregivers when it is time to reposition them.

## Features
- Real-time pressure monitoring from the bed sensors
- Automatic threshold-based repositioning alerts
- Patient registration and patient list
- Secure login with password reset
- Live data sync through Firebase

## Tech Stack
| Part | Technology |
|------|------------|
| Hardware | ESP32, FSR sensors |
| Firmware | Arduino (C++) |
| Backend | Python, Flask |
| Database and Auth | Firebase Realtime Database, Firebase Authentication |
| Frontend | HTML, CSS, JavaScript |

## How It Works
1. FSR sensors under the patient send pressure readings to the ESP32.
2. The ESP32 compares the readings with a threshold and uploads the data to Firebase.
3. The web dashboard reads the data live and shows the patient's status.
4. If the patient stays in one position too long, an alert is raised.

## Screenshots
| Login | Monitoring |
|-------|------------|
| ![Login](screenshots/login.png) | ![Monitoring](screenshots/monitoring.png) |

## Project Structure
```
bedsafe/
├── backend/    # Flask server
├── frontend/   # Web dashboard
└── iot/        # ESP32 Arduino code
```

## Setup
1. Clone the repo: `git clone https://github.com/iamanamikavd-dot/bedsafe.git`
2. Install dependencies: `pip install -r requirements.txt`
3. Add your Firebase config in `frontend/js/firebase-config.js`
4. Create `iot/secrets.h` with your WiFi and Firebase credentials
5. Upload the `.ino` file to the ESP32 using Arduino IDE
6. Run the backend: `python backend/app.py`

## Author
Anamika, MCA, Adi Shankara Institute of Engineering and Technology