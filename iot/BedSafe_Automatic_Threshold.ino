
#define ENABLE_USER_AUTH
#define ENABLE_DATABASE

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <FirebaseClient.h>
#include <math.h>

// ==================================================
// 1. WIFI SETTINGS
// ==================================================
#define WIFI_SSID       "Atheena"
#define WIFI_PASSWORD   "atheena2003"

// ==================================================
// 2. FIREBASE SETTINGS
// ==================================================
#define API_KEY         "AIzaSyBxWr0n1fWltP4vJN0O7bT66pEbq2nle9c"
#define USER_EMAIL      "iamanamikavd@gmail.com"
#define USER_PASSWORD   "12345678"

#define DATABASE_URL \
"https://bedsafe-a2e0b-default-rtdb.asia-southeast1.firebasedatabase.app/"

// ==================================================
// 3. SENSOR SETTINGS
// ==================================================
#define A401_PIN 32

const unsigned long READ_INTERVAL = 1000;
const unsigned long SEND_INTERVAL = 5000;       // Test every 5 seconds
const unsigned long CALIBRATION_TIME = 10000;
const unsigned long ALERT_DURATION = 30000;

const int MIN_PATIENT_READING = 5;
const int PRESENT_CONFIRM_COUNT = 3;
const int EMPTY_CONFIRM_COUNT = 5;


const float LOW_FACTOR = 0.90;
const float HIGH_FACTOR = 1.10;
const float STABLE_PERCENT = 0.05;

// ==================================================
// 4. FIREBASE OBJECTS
// ==================================================
WiFiClientSecure ssl_client;

using AsyncClient = AsyncClientClass;
AsyncClient aClient(ssl_client);

UserAuth user_auth(API_KEY, USER_EMAIL, USER_PASSWORD);
FirebaseApp app;
RealtimeDatabase Database;

// ==================================================
// 5. VARIABLES
// ==================================================
int rawValue = 0;
int baseline = 0;
int lowThreshold = 0;
int highThreshold = 0;
int lastPatientReading = 0;

bool patientPresent = false;
bool calibrated = false;
bool alertActive = false;
bool firebaseWasReady = false;

String pressureLevel = "NO PATIENT";
String alertStatus = "NO PATIENT";
String positionStatus = "Bed Empty";
String riskStatus = "LOW";

int presentCount = 0;
int emptyCount = 0;

unsigned long calibrationStartedAt = 0;
unsigned long stableStartedAt = 0;
unsigned long lastReadAt = 0;
unsigned long lastSendAt = 0;

// ==================================================
// 6. FIREBASE CALLBACK
// ==================================================
void processData(AsyncResult &result) {
  if (result.isError()) {
    Serial.print("Firebase ERROR: ");
    Serial.println(result.error().message());

    Serial.print("Error code: ");
    Serial.println(result.error().code());
  }

  if (result.isEvent()) {
    Serial.print("Firebase event: ");
    Serial.println(result.eventLog().message());
  }

  if (result.available()) {
    Serial.print("Firebase response: ");
    Serial.println(result.c_str());
  }
}

// ==================================================
// 7. RESET WHEN BED IS EMPTY
// ==================================================
void resetPatientState() {
  patientPresent = false;
  calibrated = false;
  alertActive = false;

  baseline = 0;
  lowThreshold = 0;
  highThreshold = 0;
  lastPatientReading = 0;

  presentCount = 0;
  emptyCount = 0;

  pressureLevel = "NO PATIENT";
  alertStatus = "NO PATIENT";
  positionStatus = "Bed Empty";
  riskStatus = "LOW";

  calibrationStartedAt = 0;
  stableStartedAt = 0;

  Serial.println("Bed empty.");
}

// ==================================================
// 8. AUTOMATIC CALIBRATION
// ==================================================
void calibrateSensor() {
  if (!calibrated) {
    pressureLevel = "CALIBRATING";
    alertStatus = "CALIBRATING";
    positionStatus = "Calibrating";

    if (rawValue >= MIN_PATIENT_READING) {
      // No averaging: keep the latest valid reading.
      lastPatientReading = rawValue;
    }

    if (millis() - calibrationStartedAt >= CALIBRATION_TIME) {
      if (lastPatientReading >= MIN_PATIENT_READING) {
        baseline = lastPatientReading;

        lowThreshold = (int)(baseline * LOW_FACTOR);
        highThreshold = (int)(baseline * HIGH_FACTOR);

        calibrated = true;
        stableStartedAt = millis();

        Serial.println("Calibration completed.");
        Serial.print("Baseline: ");
        Serial.println(baseline);
        Serial.print("Low threshold: ");
        Serial.println(lowThreshold);
        Serial.print("High threshold: ");
        Serial.println(highThreshold);
      } else {
        // Retry if pressure was not detected.
        calibrationStartedAt = millis();
        Serial.println("Calibration retry: no valid pressure.");
      }
    }

    return;
  }

  // Pressure level classification
  if (rawValue < lowThreshold) {
    pressureLevel = "LOW";
  } else if (rawValue > highThreshold) {
    pressureLevel = "HIGH";
  } else {
    pressureLevel = "MEDIUM";
  }

  positionStatus = "Pressure Detected";

  // Prototype alert based on stable pressure.
  // This does not detect actual body posture.
  float difference =
      fabs((float)rawValue - (float)baseline);

  float stableLimit = baseline * STABLE_PERCENT;

  if (difference <= stableLimit) {
    if (millis() - stableStartedAt >= ALERT_DURATION) {
      alertActive = true;
    }
  } else {
    stableStartedAt = millis();
    alertActive = false;
  }

  alertStatus = alertActive ? "REPOSITION ALERT" : "NO ALERT";
  riskStatus = pressureLevel;
}

// ==================================================
// 9. READ A401 SENSOR
// ==================================================
void updateSensorState() {
  rawValue = analogRead(A401_PIN);

  // Detect pressure before starting calibration.
  if (!patientPresent) {
    if (rawValue >= MIN_PATIENT_READING) {
      presentCount++;
    } else {
      presentCount = 0;
    }

    if (presentCount >= PRESENT_CONFIRM_COUNT) {
      patientPresent = true;
      calibrated = false;

      lastPatientReading = rawValue;
      calibrationStartedAt = millis();

      presentCount = 0;
      emptyCount = 0;

      pressureLevel = "CALIBRATING";
      alertStatus = "CALIBRATING";
      positionStatus = "Calibrating";

      Serial.println("Pressure detected.");
      Serial.println("Calibration started.");
    } else {
      pressureLevel = "NO PATIENT";
      alertStatus = "NO PATIENT";
      positionStatus = "Bed Empty";
      riskStatus = "LOW";
    }

    return;
  }

  // Confirm bed-empty state before resetting.
  if (rawValue < MIN_PATIENT_READING) {
    emptyCount++;
  } else {
    emptyCount = 0;
  }

  if (emptyCount >= EMPTY_CONFIRM_COUNT) {
    resetPatientState();
    return;
  }

  calibrateSensor();
}

// ==================================================
// 10. SEND ALL FIELDS TO RTDB
// ==================================================
void sendFirebaseData() {
  object_t json;
  object_t v1, v2, v3, v4, v5, v6;
  object_t v7, v8, v9, v10, v11, v12;

  JsonWriter writer;

  writer.create(v1, "pressure", rawValue);
  writer.create(v2, "rawValue", rawValue);
  writer.create(v3, "baseline", baseline);
  writer.create(v4, "lowThreshold", lowThreshold);
  writer.create(v5, "highThreshold", highThreshold);
  writer.create(v6, "level", pressureLevel);
  writer.create(v7, "alert", alertStatus);
  writer.create(v8, "alertActive", alertActive);
  writer.create(v9, "patientPresent", patientPresent);
  writer.create(v10, "calibrated", calibrated);
  writer.create(v11, "position", positionStatus);
  writer.create(v12, "risk", riskStatus);

  writer.join(json, 12,
              v1, v2, v3, v4, v5, v6,
              v7, v8, v9, v10, v11, v12);

  Serial.println("Sending data to Firebase...");

  Database.set<object_t>(
      aClient,
      "/sensorData/A401",
      json,
      processData,
      "bedSafeUpdate"
  );

  Serial.println("Firebase write request queued.");
}

// ==================================================
// 11. SETUP
// ==================================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  analogReadResolution(12);
  pinMode(A401_PIN, INPUT);

  Serial.println();
  Serial.println("===== BedSafe Starting =====");

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting to Wi-Fi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("Wi-Fi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  // Prototype testing only.
  // Use certificate verification for production.
  ssl_client.setInsecure();

  initializeApp(
      aClient,
      app,
      getAuth(user_auth),
      processData,
      "authTask"
  );

  app.getApp<RealtimeDatabase>(Database);
  Database.url(DATABASE_URL);

  Serial.println("Firebase authentication starting...");
}

// ==================================================
// 12. MAIN LOOP
// ==================================================
void loop() {
  // Keep Firebase async tasks running.
  app.loop();

  if (app.ready()) {
    if (!firebaseWasReady) {
      firebaseWasReady = true;
      Serial.println("Firebase authentication READY!");
    }
  } else {
    if (firebaseWasReady) {
      Serial.println("Firebase is not ready.");
      firebaseWasReady = false;
    }
  }

  // Read sensor once per second.
  if (millis() - lastReadAt >= READ_INTERVAL) {
    lastReadAt = millis();

    updateSensorState();

    Serial.print("Raw A401: ");
    Serial.print(rawValue);
    Serial.print(" | Baseline: ");
    Serial.print(baseline);
    Serial.print(" | Low: ");
    Serial.print(lowThreshold);
    Serial.print(" | High: ");
    Serial.print(highThreshold);
    Serial.print(" | Level: ");
    Serial.print(pressureLevel);
    Serial.print(" | Alert: ");
    Serial.println(alertStatus);
  }

  // First write when authenticated, then every 5 seconds.
  if (app.ready() &&
      (lastSendAt == 0 ||
       millis() - lastSendAt >= SEND_INTERVAL)) {
    lastSendAt = millis();
    sendFirebaseData();
  }

  delay(5);
}
