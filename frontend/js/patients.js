import { database } from "./firebase-config.js";

import {
    ref,
    push,
    get,
    update
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

// ==========================================
// BedSafe - Add / Edit Patient
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const patientForm = document.getElementById("patientForm");

    const saveBtn = document.querySelector(".save-btn");

    // Check if editing
    const editPatientId = localStorage.getItem("editPatientId");

    // ==========================
    // LOAD PATIENT DETAILS
    // ==========================

    if (editPatientId) {

        saveBtn.innerHTML = `
            <i class="fa-solid fa-pen"></i>
            Update Patient
        `;

        get(ref(database, "patients/" + editPatientId))
            .then((snapshot) => {

                if (snapshot.exists()) {

                    const patient = snapshot.val();

                    document.getElementById("patientName").value = patient.patientName;
                    document.getElementById("age").value = patient.age;
                    document.getElementById("gender").value = patient.gender;
                    document.getElementById("weight").value = patient.weight;
                    document.getElementById("caregiver").value = patient.caregiver;
                    document.getElementById("phone").value = patient.phone;
                    document.getElementById("address").value = patient.address;
                    document.getElementById("emergency").value = patient.emergency;

                }

            });

    }

    // ==========================
    // SAVE / UPDATE
    // ==========================

    patientForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const patientName = document.getElementById("patientName").value.trim();
        const age = document.getElementById("age").value.trim();
        const gender = document.getElementById("gender").value;
        const weight = document.getElementById("weight").value.trim();
        const caregiver = document.getElementById("caregiver").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const address = document.getElementById("address").value.trim();
        const emergency = document.getElementById("emergency").value.trim();

        if (
            patientName === "" ||
            age === "" ||
            gender === "" ||
            weight === "" ||
            caregiver === "" ||
            phone === ""
        ) {
            alert("Please fill in all required fields.");
            return;
        }

        const patient = {
            patientName,
            age,
            gender,
            weight,
            caregiver,
            phone,
            address,
            emergency,
            status: "Monitoring",
            createdAt: new Date().toISOString()
        };

        try {

            // ==========================
            // UPDATE
            // ==========================

            if (editPatientId) {

                await update(
                    ref(database, "patients/" + editPatientId),
                    patient
                );

                alert("Patient updated successfully.");

                localStorage.removeItem("editPatientId");

            }

            // ==========================
            // ADD NEW
            // ==========================

            else {

                await push(
                    ref(database, "patients"),
                    patient
                );

                alert("Patient added successfully.");

            }

            patientForm.reset();

            window.location.href = "view-patients.html";

        } catch (error) {

            alert("Error: " + error.message);

        }

    });

});