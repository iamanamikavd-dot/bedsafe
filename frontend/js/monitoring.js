import {
    database,
    auth
} from "./firebase-config.js";

import {
    ref,
    onValue,
    push,
    set
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // DOM ELEMENTS
    // =====================================================

    const pressureElement =
        document.getElementById("pressure");

    const pressureValueElement =
        document.getElementById("pressureValue");

    const positionElement =
        document.getElementById("position");

    const riskLevelElement =
        document.getElementById("riskLevel");

    const durationElement =
        document.getElementById("duration");

    const lastUpdatedElement =
        document.getElementById("lastUpdated");

    const firebaseStatusElement =
        document.getElementById("firebaseStatus");

    const repositionAlertElement =
        document.getElementById("repositionAlert");

    const patientNameElement =
        document.getElementById("patientName");

    const historyTable =
        document.getElementById("historyTable");

    const alertBanner =
        document.getElementById("alertBanner");

    const alertBannerTitle =
        document.getElementById("alertBannerTitle");

    const alertBannerMessage =
        document.getElementById("alertBannerMessage");


    // =====================================================
    // PRESSURE THRESHOLDS
    // =====================================================

    const LOW_LIMIT = 50;

    const MEDIUM_LIMIT = 150;

    const ALERT_PRESSURE_THRESHOLD = 150;

    const ALERT_DURATION = 30;


    // =====================================================
    // NORMAL PRESSURE TIMER
    // =====================================================

    let timerSeconds = 0;

    let timerRunning = false;

    let timerInterval = null;


    // =====================================================
    // HIGH PRESSURE TIMER
    // =====================================================

    let highPressureStartTime = null;


    // =====================================================
    // ALERT CONTROL
    // =====================================================

    let alertAlreadySaved = false;


    // =====================================================
    // AUDIO / BEEP VARIABLES
    // =====================================================

    let audioContext = null;

    let alarmInterval = null;

    let alarmEnabled = false;


    // =====================================================
    // POSITION HISTORY
    // =====================================================

    let previousPosition = null;


    // =====================================================
    // ENABLE BROWSER AUDIO
    // =====================================================

    document.addEventListener(
        "click",
        async () => {

            try {

                if (!audioContext) {

                    audioContext =
                        new (
                            window.AudioContext ||
                            window.webkitAudioContext
                        )();

                }

                if (
                    audioContext.state ===
                    "suspended"
                ) {

                    await audioContext.resume();

                }

                alarmEnabled = true;

                console.log(
                    "🔊 Alarm audio enabled"
                );

            } catch (error) {

                console.error(
                    "Audio initialization error:",
                    error
                );

            }

        },
        { once: true }
    );


    // =====================================================
    // PLAY ONE BEEP
    // =====================================================

    function playAlarmBeep() {

        if (!alarmEnabled) {

            console.log(
                "⚠️ Alarm audio not enabled yet"
            );

            return;

        }


        try {

            if (!audioContext) {

                audioContext =
                    new (
                        window.AudioContext ||
                        window.webkitAudioContext
                    )();

            }


            if (
                audioContext.state ===
                "suspended"
            ) {

                audioContext.resume();

            }


            const oscillator =
                audioContext.createOscillator();

            const gainNode =
                audioContext.createGain();


            oscillator.type = "square";

            oscillator.frequency.value = 800;


            gainNode.gain.setValueAtTime(
                0.3,
                audioContext.currentTime
            );


            oscillator.connect(
                gainNode
            );

            gainNode.connect(
                audioContext.destination
            );


            oscillator.start();


            oscillator.stop(
                audioContext.currentTime + 0.25
            );


            console.log(
                "🔊 BEEP PLAYED"
            );

        } catch (error) {

            console.error(
                "❌ Beep error:",
                error
            );

        }

    }


    // =====================================================
    // START ALARM
    // =====================================================

    function startAlarm() {

        if (!alarmEnabled) {

            console.log(
                "⚠️ Alarm cannot start - audio not enabled"
            );

            return;

        }


        if (alarmInterval !== null) {

            return;

        }


        console.log(
            "🚨 ALARM STARTED"
        );


        // First beep immediately

        playAlarmBeep();


        // Repeat every 1 second

        alarmInterval =
            setInterval(() => {

                playAlarmBeep();

            }, 1000);

    }


    // =====================================================
    // STOP ALARM
    // =====================================================

    function stopAlarm() {

        if (alarmInterval !== null) {

            clearInterval(
                alarmInterval
            );

            alarmInterval = null;

            console.log(
                "🔇 ALARM STOPPED"
            );

        }

    }


    // =====================================================
    // SHOW BIG ALERT BANNER
    // =====================================================

    function showAlertBanner(
        pressureValue,
        duration
    ) {

        if (!alertBanner) {

            return;

        }


        if (duration < ALERT_DURATION) {

            alertBanner.style.display =
                "none";

            return;

        }


        alertBanner.style.display =
            "flex";


        if (alertBannerTitle) {

            alertBannerTitle.innerHTML =
                "🚨 REPOSITION REQUIRED";

        }


        if (alertBannerMessage) {

            alertBannerMessage.innerHTML =
                `
                High pressure detected for
                <strong>${duration} seconds</strong>.
                Please reposition the patient.
                <br>
                Current pressure:
                <strong>${pressureValue}</strong>
                `;

        }

    }


    // =====================================================
    // HIDE BIG ALERT BANNER
    // =====================================================

    function hideAlertBanner() {

        if (alertBanner) {

            alertBanner.style.display =
                "none";

        }

    }


    // =====================================================
    // SAVE ALERT TO FIREBASE
    // =====================================================

    async function saveRepositionAlert(
        pressureValue
    ) {

        try {

            const alertRef =
                push(
                    ref(
                        database,
                        "alertHistory"
                    )
                );


            const alertData = {

                patientName:
                    patientNameElement
                        ? patientNameElement.innerText
                        : "No Patient",

                pressure:
                    pressureValue,

                alert:
                    "REPOSITION REQUIRED",

                status:
                    "Pending",

                time:
                    new Date().toISOString()

            };


            await set(
                alertRef,
                alertData
            );


            console.log(
                "Reposition alert saved successfully"
            );


            console.log(
                "Alert Data:",
                alertData
            );


        } catch (error) {

            console.error(
                "Error saving alert:",
                error
            );

        }

    }


    // =====================================================
    // RESET REPOSITION ALERT
    // =====================================================

    function resetRepositionAlert() {

        highPressureStartTime =
            null;

        alertAlreadySaved =
            false;

        stopAlarm();

        hideAlertBanner();


        if (repositionAlertElement) {

            repositionAlertElement.innerHTML =
                `
                <span class="safe">
                    NORMAL
                </span>
                `;

        }


        console.log(
            "Repositioning Alert: NORMAL"
        );

    }


    // =====================================================
    // UPDATE REPOSITIONING ALERT
    // =====================================================

    function updateRepositioningAlert(
        pressureValue
    ) {

        if (!repositionAlertElement) {

            return;

        }


        // ---------------------------------------------
        // NORMAL PRESSURE
        // ---------------------------------------------

        if (
            pressureValue <=
            ALERT_PRESSURE_THRESHOLD
        ) {

            resetRepositionAlert();

            return;

        }


        // ---------------------------------------------
        // START HIGH PRESSURE TIMER
        // ---------------------------------------------

        if (
            highPressureStartTime === null
        ) {

            highPressureStartTime =
                Date.now();


            console.log(
                "⚠️ High pressure detected"
            );


            console.log(
                "Reposition monitoring started"
            );

        }


        // ---------------------------------------------
        // CALCULATE HIGH PRESSURE DURATION
        // ---------------------------------------------

        const highPressureDuration =
            Math.floor(
                (
                    Date.now() -
                    highPressureStartTime
                ) / 1000
            );


        console.log(
            "High pressure duration:",
            highPressureDuration,
            "seconds"
        );


        // ---------------------------------------------
        // LESS THAN 30 SECONDS
        // ---------------------------------------------

        if (
            highPressureDuration <
            ALERT_DURATION
        ) {

            hideAlertBanner();


            repositionAlertElement.innerHTML =
                `
                <span class="warning">

                    ⚠️ HIGH PRESSURE

                    <br>

                    Monitoring...

                    <br>

                    ${highPressureDuration}s /
                    ${ALERT_DURATION}s

                </span>
                `;


            stopAlarm();


            console.log(
                "⚠️ WARNING - Monitoring high pressure"
            );


            return;

        }


        // ---------------------------------------------
        // 30 SECONDS REACHED
        // ---------------------------------------------

        repositionAlertElement.innerHTML =
            `
            <span class="danger">

                🚨 REPOSITION REQUIRED

                <br>

                High pressure detected for
                ${ALERT_DURATION} seconds

            </span>
            `;


        // Show large banner

        showAlertBanner(
            pressureValue,
            highPressureDuration
        );


        // Start beep

        startAlarm();


        // ---------------------------------------------
        // SAVE ONLY ONCE
        // ---------------------------------------------

        if (!alertAlreadySaved) {

            alertAlreadySaved =
                true;


            console.log(
                "🚨 Saving reposition alert..."
            );


            saveRepositionAlert(
                pressureValue
            );

        }


        console.log(
            "🚨 REPOSITION REQUIRED"
        );

    }


    // =====================================================
    // UPDATE RISK LEVEL
    // =====================================================

    function updateRiskLevel(
        pressureValue
    ) {

        if (!riskLevelElement) {

            return;

        }


        if (
            pressureValue <=
            LOW_LIMIT
        ) {

            riskLevelElement.innerHTML =
                `
                <span class="safe">
                    LOW
                </span>
                `;

        }

        else if (
            pressureValue <=
            MEDIUM_LIMIT
        ) {

            riskLevelElement.innerHTML =
                `
                <span class="warning">
                    MEDIUM
                </span>
                `;

        }

        else {

            riskLevelElement.innerHTML =
                `
                <span class="danger">
                    HIGH
                </span>
                `;

        }

    }


    // =====================================================
    // UPDATE POSITION HISTORY
    // =====================================================

    function addPositionHistory(
        position
    ) {

        if (!historyTable) {

            return;

        }


        if (
            previousPosition ===
            position
        ) {

            return;

        }


        previousPosition =
            position;


        const row =
            document.createElement("tr");


        const timeCell =
            document.createElement("td");


        const positionCell =
            document.createElement("td");


        timeCell.innerText =
            new Date().toLocaleTimeString();


        positionCell.innerText =
            position;


        row.appendChild(
            timeCell
        );

        row.appendChild(
            positionCell
        );


        historyTable.insertBefore(
            row,
            historyTable.firstChild
        );


        // Keep only latest 5 records

        while (
            historyTable.children.length >
            5
        ) {

            historyTable.removeChild(
                historyTable.lastChild
            );

        }

    }


    // =====================================================
    // START PATIENT DETECTION TIMER
    // =====================================================

    function startTimer() {

        if (timerRunning) {

            return;

        }


        timerRunning = true;


        timerInterval =
            setInterval(() => {

                timerSeconds++;


                updateDurationDisplay();

            }, 1000);

    }


    // =====================================================
    // STOP PATIENT DETECTION TIMER
    // =====================================================

    function stopTimer() {

        if (timerInterval !== null) {

            clearInterval(
                timerInterval
            );

            timerInterval =
                null;

        }


        timerRunning =
            false;

    }


    // =====================================================
    // RESET PATIENT TIMER
    // =====================================================

    function resetTimer() {

        stopTimer();

        timerSeconds =
            0;

        updateDurationDisplay();

    }


    // =====================================================
    // UPDATE DURATION DISPLAY
    // =====================================================

    function updateDurationDisplay() {

        if (!durationElement) {

            return;

        }


        const minutes =
            Math.floor(
                timerSeconds / 60
            );


        const seconds =
            timerSeconds % 60;


        durationElement.innerText =
            `${minutes}m ${seconds}s`;

    }


    // =====================================================
    // UPDATE PRESSURE DISPLAY
    // =====================================================

    function updatePressureDisplay(
        pressureValue
    ) {

        if (pressureElement) {

            pressureElement.innerText =
                pressureValue;

        }


        if (pressureValueElement) {

            pressureValueElement.innerText =
                pressureValue;

        }

    }


    // =====================================================
    // UPDATE POSITION
    // =====================================================

    function updatePosition(
        pressureValue
    ) {

        let position;


        if (
            pressureValue > 0
        ) {

            position =
                "Patient Detected";

        }

        else {

            position =
                "Bed Empty";

        }


        if (positionElement) {

            positionElement.innerText =
                position;

        }


        addPositionHistory(
            position
        );


        return position;

    }


    // =====================================================
    // START FIREBASE MONITORING
    // =====================================================

    function startMonitoring() {

        console.log(
            "========== BEDSAFE MONITORING STARTED =========="
        );


        const sensorRef =
            ref(
                database,
                "sensorData/A401"
            );


        onValue(
            sensorRef,
            (snapshot) => {

                const data =
                    snapshot.val();


                console.log(
                    "========== A401 UPDATE =========="
                );


                console.log(
                    "Firebase A401 data:",
                    data
                );


                // -----------------------------------------
                // CONVERT DATA TO NUMBER
                // -----------------------------------------

                let pressureValue =
                    0;


                if (
                    typeof data ===
                    "number"
                ) {

                    pressureValue =
                        data;

                }

                else if (
                    typeof data ===
                    "string"
                ) {

                    pressureValue =
                        Number(data);

                }

                else if (
                    data &&
                    typeof data ===
                    "object"
                ) {

                    if (
                        data.value !==
                        undefined
                    ) {

                        pressureValue =
                            Number(
                                data.value
                            );

                    }

                    else if (
                        data.pressure !==
                        undefined
                    ) {

                        pressureValue =
                            Number(
                                data.pressure
                            );

                    }

                }


                if (
                    isNaN(pressureValue)
                ) {

                    pressureValue =
                        0;

                }


                console.log(
                    "Pressure:",
                    pressureValue
                );


                // -----------------------------------------
                // PRESSURE DISPLAY
                // -----------------------------------------

                updatePressureDisplay(
                    pressureValue
                );


                // -----------------------------------------
                // POSITION
                // -----------------------------------------

                const position =
                    updatePosition(
                        pressureValue
                    );


                // -----------------------------------------
                // PATIENT TIMER
                // -----------------------------------------

                if (
                    pressureValue > 0
                ) {

                    startTimer();

                }

                else {

                    resetTimer();

                }


                // -----------------------------------------
                // RISK LEVEL
                // -----------------------------------------

                updateRiskLevel(
                    pressureValue
                );


                // -----------------------------------------
                // REPOSITION ALERT
                // -----------------------------------------

                updateRepositioningAlert(
                    pressureValue
                );


                // -----------------------------------------
                // LAST UPDATED
                // -----------------------------------------

                if (
                    lastUpdatedElement
                ) {

                    lastUpdatedElement.innerText =
                        new Date()
                            .toLocaleTimeString();

                }


                // -----------------------------------------
                // FIREBASE STATUS
                // -----------------------------------------

                if (
                    firebaseStatusElement
                ) {

                    firebaseStatusElement.innerHTML =
                        `
                        <span class="safe">
                            Connected
                        </span>
                        `;

                }


                console.log(
                    "Position:",
                    position
                );

                console.log(
                    "Risk:",
                    pressureValue <= LOW_LIMIT
                        ? "LOW"
                        : pressureValue <= MEDIUM_LIMIT
                            ? "MEDIUM"
                            : "HIGH"
                );

            },

            (error) => {

                console.error(
                    "Firebase sensor error:",
                    error
                );


                if (
                    firebaseStatusElement
                ) {

                    firebaseStatusElement.innerHTML =
                        `
                        <span class="danger">
                            Disconnected
                        </span>
                        `;

                }


                resetTimer();

                resetRepositionAlert();

            }

        );

    }


    // =====================================================
    // LOAD PATIENT
    // =====================================================

    function loadPatient() {

        const patientsRef =
            ref(
                database,
                "patients"
            );


        onValue(
            patientsRef,
            (snapshot) => {

                const patients =
                    snapshot.val();


                if (!patients) {

                    if (
                        patientNameElement
                    ) {

                        patientNameElement.innerText =
                            "No Patient";

                    }

                    return;

                }


                const patientIds =
                    Object.keys(
                        patients
                    );


                if (
                    patientIds.length === 0
                ) {

                    return;

                }


                const firstPatient =
                    patients[
                        patientIds[0]
                    ];


                if (
                    patientNameElement
                ) {

                    patientNameElement.innerText =
                        firstPatient.patientName ||
                        "No Patient";

                }

            },

            (error) => {

                console.error(
                    "Patient loading error:",
                    error
                );

            }

        );

    }


    // =====================================================
    // AUTHENTICATION
    // =====================================================

    onAuthStateChanged(
        auth,
        (user) => {

            if (user) {

                console.log(
                    "Logged in user:",
                    user.email
                );


                startMonitoring();

                loadPatient();

            }

            else {

                console.log(
                    "No user logged in"
                );


                if (
                    firebaseStatusElement
                ) {

                    firebaseStatusElement.innerHTML =
                        `
                        <span class="danger">
                            Not Logged In
                        </span>
                        `;

                }

            }

        }
    );


});