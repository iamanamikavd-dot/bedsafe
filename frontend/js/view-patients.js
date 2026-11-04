/* ==========================================
   BedSafe - View Patients
   User-Specific Patient Data
========================================== */

import { auth, database } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    ref,
    onValue,
    remove
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";


/* ==========================================
   VARIABLES
========================================== */

let patients = [];

let currentUser = null;


/* ==========================================
   DOM ELEMENTS
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const tableBody = document.getElementById("patientTable");

    const searchInput = document.getElementById("searchPatient");


    /* ==========================================
       DISPLAY PATIENTS
    ========================================== */

    function displayPatients(patientList) {

        tableBody.innerHTML = "";


        /* --------------------------------------
           NO PATIENTS
        -------------------------------------- */

        if (patientList.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="no-patients">
                        No patients found.
                    </td>
                </tr>
            `;

            return;
        }


        /* --------------------------------------
           DISPLAY EACH PATIENT
        -------------------------------------- */

        patientList.forEach((patient) => {

            tableBody.innerHTML += `
                <tr>

                    <td>
                        ${patient.patientName || "-"}
                    </td>

                    <td>
                        ${patient.patientAge || "-"}
                    </td>

                    <td>
                        ${patient.patientGender || "-"}
                    </td>

                    <td>
                        ${patient.caregiverName || "-"}
                    </td>

                    <td>

                        <span class="status active">
                            ${patient.status || "Monitoring"}
                        </span>

                    </td>

                    <td>

                        <button
                            class="view"
                            onclick="viewPatient('${patient.id}')"
                            title="View Patient">

                            <i class="fa-solid fa-eye"></i>

                        </button>


                        <button
                            class="edit"
                            onclick="editPatient('${patient.id}')"
                            title="Edit Patient">

                            <i class="fa-solid fa-pen"></i>

                        </button>


                        <button
                            class="delete"
                            onclick="deletePatient('${patient.id}')"
                            title="Delete Patient">

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </td>

                </tr>
            `;

        });

    }


    /* ==========================================
       CHECK LOGGED-IN USER
    ========================================== */

    onAuthStateChanged(auth, (user) => {

        if (!user) {

            console.log("No user logged in.");

            window.location.href = "login.html";

            return;
        }


        /* --------------------------------------
           CURRENT USER
        -------------------------------------- */

        currentUser = user;

        console.log("Logged-in user:", user.email);

        console.log("User UID:", user.uid);


        /* ==========================================
           USER-SPECIFIC PATIENT PATH
        ========================================== */

        const patientsRef = ref(
            database,
            `users/${user.uid}/patients`
        );


        /* ==========================================
           READ PATIENTS
        ========================================== */

        onValue(patientsRef, (snapshot) => {

            patients = [];


            if (snapshot.exists()) {

                snapshot.forEach((childSnapshot) => {

                    patients.push({

                        id: childSnapshot.key,

                        ...childSnapshot.val()

                    });

                });

            }


            console.log(
                "Patients for current user:",
                patients
            );


            displayPatients(patients);

        });

    });


    /* ==========================================
       SEARCH
    ========================================== */

    searchInput.addEventListener("input", function () {

        const value = this.value
            .toLowerCase()
            .trim();


        const filtered = patients.filter((patient) => {

            const patientName =
                (patient.patientName || "").toLowerCase();

            const caregiverName =
                (patient.caregiverName || "").toLowerCase();


            return (
                patientName.includes(value) ||
                caregiverName.includes(value)
            );

        });


        displayPatients(filtered);

    });

});


/* ==========================================
   VIEW PATIENT
========================================== */

window.viewPatient = function(patientId) {

    localStorage.setItem(
        "viewPatientId",
        patientId
    );


    window.location.href =
        "view-patient.html";

};


/* ==========================================
   EDIT PATIENT
========================================== */

window.editPatient = function(patientId) {

    localStorage.setItem(
        "editPatientId",
        patientId
    );


    window.location.href =
        "patients.html";

};


/* ==========================================
   DELETE PATIENT
========================================== */

window.deletePatient = async function(patientId) {

    if (!currentUser) {

        alert("Please login again.");

        return;
    }


    const confirmDelete = confirm(
        "Are you sure you want to delete this patient?"
    );


    if (!confirmDelete) {

        return;
    }


    try {

        /* --------------------------------------
           USER-SPECIFIC DELETE PATH
        -------------------------------------- */

        const patientRef = ref(
            database,
            `users/${currentUser.uid}/patients/${patientId}`
        );


        await remove(patientRef);


        alert(
            "Patient deleted successfully."
        );


    } catch (error) {

        console.error(
            "Delete error:",
            error
        );


        alert(
            "Error deleting patient: " +
            error.message
        );

    }

};