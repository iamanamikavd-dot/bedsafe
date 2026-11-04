/* ==========================================
   BEDSAFE - SETTINGS
   Firebase Connected Settings
========================================== */

import { auth, database } from "./firebase-config.js";

import {
    onAuthStateChanged,
    updatePassword
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    ref,
    get,
    update
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

import {
    logoutUser
} from "./auth.js";


/* ==========================================
   VARIABLES
========================================== */

let currentUser = null;


/* ==========================================
   DOM ELEMENTS
========================================== */

const profileForm =
    document.getElementById("profileForm");

const fullNameInput =
    document.getElementById("fullName");

const emailInput =
    document.getElementById("email");

const phoneInput =
    document.getElementById("phone");

const profileMessage =
    document.getElementById("profileMessage");

const repositioningAlert =
    document.getElementById("repositioningAlert");

const generalAlert =
    document.getElementById("generalAlert");

const monitoringInterval =
    document.getElementById("monitoringInterval");

const saveMonitoring =
    document.getElementById("saveMonitoring");

const monitoringMessage =
    document.getElementById("monitoringMessage");

const changePasswordBtn =
    document.getElementById("changePasswordBtn");

const logoutBtn =
    document.getElementById("logoutBtn");


/* ==========================================
   SHOW MESSAGE
========================================== */

function showMessage(element, text, type) {

    element.textContent = text;

    element.className =
        "message " + type;

}


/* ==========================================
   CHECK LOGIN
========================================== */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        console.log("No user logged in.");

        window.location.href = "login.html";

        return;
    }


    currentUser = user;


    console.log(
        "Logged-in user:",
        currentUser.email
    );

    console.log(
        "User UID:",
        currentUser.uid
    );


    /* ==========================================
       LOAD PROFILE
    ========================================== */

    await loadProfile();


    /* ==========================================
       LOAD SETTINGS
    ========================================== */

    await loadSettings();

});


/* ==========================================
   LOAD PROFILE
========================================== */

async function loadProfile() {

    try {

        emailInput.value =
            currentUser.email || "";


        const userRef = ref(
            database,
            `users/${currentUser.uid}`
        );


        const snapshot = await get(userRef);


        if (snapshot.exists()) {

            const userData =
                snapshot.val();


            fullNameInput.value =
                userData.fullName || "";


            phoneInput.value =
                userData.phone || "";

        }


    } catch (error) {

        console.error(
            "Error loading profile:",
            error
        );

    }

}


/* ==========================================
   SAVE PROFILE
========================================== */

if (profileForm) {

    profileForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            if (!currentUser) {

                alert(
                    "Please login again."
                );

                return;
            }


            const fullName =
                fullNameInput.value.trim();


            const phone =
                phoneInput.value.trim();


            /* --------------------------------------
               VALIDATION
            -------------------------------------- */

            if (!fullName) {

                showMessage(
                    profileMessage,
                    "Please enter your full name.",
                    "error"
                );

                return;
            }


            if (
                phone &&
                !/^[0-9]{10}$/.test(phone)
            ) {

                showMessage(
                    profileMessage,
                    "Please enter a valid 10-digit phone number.",
                    "error"
                );

                return;
            }


            try {

                const userRef = ref(
                    database,
                    `users/${currentUser.uid}`
                );


                await update(
                    userRef,
                    {
                        fullName: fullName,
                        phone: phone
                    }
                );


                showMessage(
                    profileMessage,
                    "Profile updated successfully.",
                    "success"
                );


            } catch (error) {

                console.error(
                    "Profile update error:",
                    error
                );


                showMessage(
                    profileMessage,
                    "Failed to update profile: " +
                    error.message,
                    "error"
                );

            }

        }
    );

}


/* ==========================================
   LOAD SETTINGS
========================================== */

async function loadSettings() {

    try {

        const settingsRef = ref(
            database,
            `users/${currentUser.uid}/settings`
        );


        const snapshot =
            await get(settingsRef);


        if (snapshot.exists()) {

            const settings =
                snapshot.val();


            repositioningAlert.checked =
                settings.repositioningAlert !== false;


            generalAlert.checked =
                settings.generalAlert !== false;


            if (settings.monitoringInterval) {

                monitoringInterval.value =
                    settings.monitoringInterval;

            }

        }


    } catch (error) {

        console.error(
            "Error loading settings:",
            error
        );

    }

}


/* ==========================================
   SAVE NOTIFICATION SETTINGS
========================================== */

async function saveNotificationSettings() {

    if (!currentUser) {

        return;
    }


    try {

        const settingsRef = ref(
            database,
            `users/${currentUser.uid}/settings`
        );


        await update(
            settingsRef,
            {
                repositioningAlert:
                    repositioningAlert.checked,

                generalAlert:
                    generalAlert.checked
            }
        );


        console.log(
            "Notification settings saved."
        );


    } catch (error) {

        console.error(
            "Notification settings error:",
            error
        );

    }

}


/* ==========================================
   NOTIFICATION TOGGLES
========================================== */

repositioningAlert.addEventListener(
    "change",
    saveNotificationSettings
);


generalAlert.addEventListener(
    "change",
    saveNotificationSettings
);


/* ==========================================
   SAVE MONITORING SETTINGS
========================================== */

if (saveMonitoring) {

    saveMonitoring.addEventListener(
        "click",
        async () => {

            if (!currentUser) {

                alert(
                    "Please login again."
                );

                return;
            }


            try {

                const settingsRef = ref(
                    database,
                    `users/${currentUser.uid}/settings`
                );


                await update(
                    settingsRef,
                    {
                        monitoringInterval:
                            Number(
                                monitoringInterval.value
                            )
                    }
                );


                showMessage(
                    monitoringMessage,
                    "Monitoring settings saved successfully.",
                    "success"
                );


            } catch (error) {

                console.error(
                    "Monitoring settings error:",
                    error
                );


                showMessage(
                    monitoringMessage,
                    "Failed to save settings: " +
                    error.message,
                    "error"
                );

            }

        }
    );

}


/* ==========================================
   CHANGE PASSWORD
========================================== */

if (changePasswordBtn) {

    changePasswordBtn.addEventListener(
        "click",
        async () => {

            if (!currentUser) {

                alert(
                    "Please login again."
                );

                return;
            }


            const newPassword =
                prompt(
                    "Enter your new password (minimum 8 characters):"
                );


            if (newPassword === null) {

                return;
            }


            if (newPassword.length < 8) {

                alert(
                    "Password must be at least 8 characters long."
                );

                return;
            }


            try {

                await updatePassword(
                    currentUser,
                    newPassword
                );


                alert(
                    "Password changed successfully."
                );


            } catch (error) {

                console.error(
                    "Password change error:",
                    error
                );


                if (
                    error.code ===
                    "auth/requires-recent-login"
                ) {

                    alert(
                        "For security, please logout and login again before changing your password."
                    );

                } else {

                    alert(
                        "Failed to change password: " +
                        error.message
                    );

                }

            }

        }
    );

}


/* ==========================================
   LOGOUT
========================================== */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            const confirmLogout =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmLogout) {

                return;
            }


            try {

                await logoutUser();


                window.location.href =
                    "login.html";


            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );


                alert(
                    "Failed to logout: " +
                    error.message
                );

            }

        }
    );

}