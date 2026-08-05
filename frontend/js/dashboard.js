import { auth, database } from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    ref,
    onValue,
    get
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

// ==========================================
// BedSafe Dashboard
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    // ==========================
    // HTML Elements
    // ==========================

    const userName = document.getElementById("userName");
    const welcomeName = document.getElementById("welcomeName");

    const totalPatients = document.getElementById("totalPatients");
    const monitoringPatients = document.getElementById("monitoringPatients");
    const repositionPatients = document.getElementById("repositionPatients");
    const todayAlerts = document.getElementById("todayAlerts");

    const logoutBtn = document.getElementById("logoutBtn");

    // ==========================
    // CHECK LOGIN & LOAD USER NAME
    // ==========================

    onAuthStateChanged(auth, async (user) => {

        if (!user) {

            window.location.href = "login.html";
            return;

        }

        try {

            const snapshot = await get(ref(database, "users/" + user.uid));

            if (snapshot.exists()) {

                const userData = snapshot.val();

                userName.textContent = userData.fullName;
                welcomeName.textContent = userData.fullName + " 👋";

            } else {

                userName.textContent = user.email;
                welcomeName.textContent = user.email + " 👋";

            }

        } catch (error) {

            console.error("Error loading user:", error);

        }

    });

    // ==========================
    // PATIENT COUNT
    // ==========================

    onValue(ref(database, "patients"), (snapshot) => {

        let total = 0;
        let monitoring = 0;
        let reposition = 0;

        snapshot.forEach((child) => {

            total++;

            const patient = child.val();

            if (patient.status === "Monitoring") {
                monitoring++;
            }

            if (patient.risk === "High") {
                reposition++;
            }

        });

        totalPatients.textContent = total;
        monitoringPatients.textContent = monitoring;
        repositionPatients.textContent = reposition;

    });

    // ==========================
    // ALERT COUNT
    // ==========================

    onValue(ref(database, "alerts"), (snapshot) => {

        let count = 0;

        snapshot.forEach(() => {

            count++;

        });

        todayAlerts.textContent = count;

    });

    // ==========================
    // LOGOUT
    // ==========================

    logoutBtn.addEventListener("click", async () => {

        const confirmLogout = confirm("Are you sure you want to logout?");

        if (!confirmLogout) return;

        try {

            await signOut(auth);

            alert("Logged out successfully.");

            window.location.href = "login.html";

        } catch (error) {

            alert("Logout failed: " + error.message);

        }

    });

});