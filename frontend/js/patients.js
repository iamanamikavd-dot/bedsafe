/* ==========================================
   BEDSAFE - ADD PATIENT
   User-specific Firebase Patient Storage
========================================== */

import { auth, database } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    ref,
    push,
    set
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";


/* ==========================================
   GET FORM
========================================== */

const patientForm = document.getElementById("patientForm");


/* ==========================================
   CHECK LOGIN STATUS
========================================== */

let currentUser = null;

onAuthStateChanged(auth, (user) => {

    if (user) {

        currentUser = user;

        console.log("Logged-in user:", currentUser.email);
        console.log("User UID:", currentUser.uid);

    } else {

        currentUser = null;

        console.log("No user is logged in.");

        // Redirect to login page
        window.location.href = "login.html";
    }

});


/* ==========================================
   ADD PATIENT
========================================== */

if (patientForm) {

    patientForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        /* --------------------------------------
           CHECK LOGIN
        -------------------------------------- */

        if (!currentUser) {

            alert("Please login before adding a patient.");

            return;
        }


        /* --------------------------------------
           GET FORM VALUES
        -------------------------------------- */

        const patientName =
            document.getElementById("patientName")?.value.trim();

        const patientAge =
            document.getElementById("patientAge")?.value.trim();

        const patientGender =
            document.getElementById("patientGender")?.value;

        const caregiverName =
            document.getElementById("caregiverName")?.value.trim();

        const patientStatus =
            document.getElementById("patientStatus")?.value || "Monitoring";


        /* --------------------------------------
           VALIDATION
        -------------------------------------- */

        if (!patientName) {

            alert("Please enter patient name.");

            return;
        }


        if (!patientAge) {

            alert("Please enter patient age.");

            return;
        }


        if (!patientGender) {

            alert("Please select patient gender.");

            return;
        }


        if (!caregiverName) {

            alert("Please enter caregiver name.");

            return;
        }


        /* --------------------------------------
           USER UID
        -------------------------------------- */

        const uid = currentUser.uid;


        /* --------------------------------------
           CREATE PATIENT ID
        -------------------------------------- */

        const patientsRef = ref(
            database,
            `users/${uid}/patients`
        );

        const newPatientRef = push(patientsRef);

        const patientId = newPatientRef.key;


        /* --------------------------------------
           PATIENT DATA
        -------------------------------------- */

        const patientData = {

            patientId: patientId,

            patientName: patientName,

            patientAge: Number(patientAge),

            patientGender: patientGender,

            caregiverName: caregiverName,

            status: patientStatus,

            createdAt: new Date().toISOString(),

            createdBy: uid

        };


        /* --------------------------------------
           SAVE TO FIREBASE
           
           IMPORTANT:
           
           users
             └── UID
                  └── patients
                       └── patientID
        -------------------------------------- */

        try {

            await set(
                newPatientRef,
                patientData
            );


            /* ----------------------------------
               SUCCESS
            ---------------------------------- */

            alert("Patient added successfully!");


            /* ----------------------------------
               RESET FORM
            ---------------------------------- */

            patientForm.reset();


            /* ----------------------------------
               OPTIONAL REDIRECT
            ---------------------------------- */

            window.location.href = "view-patients.html";


        } catch (error) {

            console.error(
                "Error adding patient:",
                error
            );

            alert(
                "Failed to add patient.\n\n" +
                error.message
            );

        }

    });

}