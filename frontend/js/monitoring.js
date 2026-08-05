import { database } from "./firebase-config.js";

import {
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

// ==========================================
// BedSafe - Live Monitoring
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    // Firebase patient reference
    const patientsRef = ref(database, "patients");

    onValue(patientsRef, (snapshot) => {

        if (!snapshot.exists()) {

            document.getElementById("patientName").textContent = "No Patient";

            return;

        }

        // Get first patient
        let patient = null;

        snapshot.forEach((childSnapshot) => {

            if (!patient) {

                patient = childSnapshot.val();

            }

        });

        if (patient) {

            document.getElementById("patientName").textContent =
                patient.patientName;

        }

    });

    // Sample Monitoring Data
    document.getElementById("position").textContent = "Left Side";

    document.getElementById("pressure").textContent = "65%";

    document.getElementById("pressureValue").textContent = "65%";

    document.getElementById("duration").textContent = "01:25:30";

    document.getElementById("riskLevel").innerHTML =
        '<span class="safe">LOW</span>';

    document.getElementById("espStatus").textContent = "Connected";

    // Sample Position History
    const historyTable = document.getElementById("historyTable");

    historyTable.innerHTML = `

        <tr>
            <td>09:00 AM</td>
            <td>Left Side</td>
            <td>Safe</td>
        </tr>

        <tr>
            <td>10:30 AM</td>
            <td>Back</td>
            <td>Safe</td>
        </tr>

        <tr>
            <td>12:00 PM</td>
            <td>Right Side</td>
            <td>Safe</td>
        </tr>

    `;

});