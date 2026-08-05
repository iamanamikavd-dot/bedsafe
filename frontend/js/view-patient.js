import { database } from "./firebase-config.js";

import {
    ref,
    get
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

// ==========================================
// BedSafe - View Patient Details
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    // Get patient ID from localStorage
    const patientId = localStorage.getItem("viewPatientId");

    if (!patientId) {

        alert("No patient selected.");

        window.location.href = "view-patients.html";

        return;
    }

    try {

        const snapshot = await get(ref(database, "patients/" + patientId));

        if (snapshot.exists()) {

            const patient = snapshot.val();

            document.getElementById("patientName").textContent =
                patient.patientName || "-";

            document.getElementById("patientAge").textContent =
                patient.age || "-";

            document.getElementById("patientGender").textContent =
                patient.gender || "-";

            document.getElementById("patientWeight").textContent =
                patient.weight + " kg";

            document.getElementById("patientCaregiver").textContent =
                patient.caregiver || "-";

            document.getElementById("patientPhone").textContent =
                patient.phone || "-";

            document.getElementById("patientAddress").textContent =
                patient.address || "-";

            document.getElementById("patientEmergency").textContent =
                patient.emergency || "-";

            document.getElementById("patientStatus").textContent =
                patient.status || "-";

            document.getElementById("patientCreated").textContent =
                new Date(patient.createdAt).toLocaleString();

        } else {

            alert("Patient not found.");

            window.location.href = "view-patients.html";

        }

    } catch (error) {

        alert("Error: " + error.message);

    }

});

// ==========================================
// Edit Button
// ==========================================

const editBtn = document.getElementById("editBtn");

if (editBtn) {

    editBtn.addEventListener("click", () => {

        const patientId = localStorage.getItem("viewPatientId");

        localStorage.setItem("editPatientId", patientId);

        window.location.href = "patients.html";

    });

}