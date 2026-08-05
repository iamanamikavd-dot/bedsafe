import { database } from "./firebase-config.js";

import {
    ref,
    onValue,
    remove
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";
// ==========================================
// BedSafe - View Patients
// ==========================================

let patients = [];

document.addEventListener("DOMContentLoaded", () => {

    const tableBody = document.getElementById("patientTable");
    const searchInput = document.getElementById("searchPatient");
    // Display Patients
    function displayPatients(patientList) {

        tableBody.innerHTML = "";

        if (patientList.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;">
                        No patients found.
                    </td>
                </tr>
            `;

            return;
        }

        patientList.forEach((patient, index) => {

            tableBody.innerHTML += `
                <tr>

                    <td>${patient.patientName}</td>

                    <td>${patient.age}</td>

                    <td>${patient.gender}</td>

                    <td>${patient.caregiver}</td>

                    <td>
                        <span class="status active">
                            ${patient.status}
                        </span>
                    </td>

                    <td>

                        <button class="view" onclick="viewPatient(${index})">
                            <i class="fa-solid fa-eye"></i>
                        </button>

                        <button class="edit"
    onclick="editPatient('${patient.id}')">
    <i class="fa-solid fa-pen"></i>
</button>
                        <button class="delete" onclick="deletePatient(${index})">
                            <i class="fa-solid fa-trash"></i>
                        </button>

                    </td>

                </tr>
            `;
        });
    }

    // Read Patients from Firebase
    const patientsRef = ref(database, "patients");

    onValue(patientsRef, (snapshot) => {

        patients = [];

        snapshot.forEach((childSnapshot) => {

            patients.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });

        });

        displayPatients(patients);

    });

    // Search
    searchInput.addEventListener("keyup", function () {

        const value = this.value.toLowerCase();

        const filtered = patients.filter(patient =>

            patient.patientName.toLowerCase().includes(value) ||

            patient.caregiver.toLowerCase().includes(value)

        );

        displayPatients(filtered);

    });

});

// View
window.viewPatient = function(index){

    localStorage.setItem("viewPatientId", patients[index].id);

    window.location.href = "view-patient.html";

};

// Edit
window.editPatient = function(patientId) {

    localStorage.setItem("editPatientId", patientId);

    window.location.href = "patients.html";

};



// Delete
window.deletePatient = async function(index) {

    const confirmDelete = confirm("Are you sure you want to delete this patient?");

    if (!confirmDelete) return;

    try {

        const patientId = patients[index].id;

        await remove(ref(database, "patients/" + patientId));

        alert("Patient deleted successfully.");

    } catch (error) {

        alert("Error deleting patient: " + error.message);

    }

};