/* ==========================================
   BEDSAFE - FORGOT PASSWORD
   Firebase Password Reset
========================================== */

import { auth } from "./firebase-config.js";

import {
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


/* ==========================================
   DOM ELEMENTS
========================================== */

const forgotPasswordForm =
    document.getElementById("forgotPasswordForm");

const emailInput =
    document.getElementById("email");

const emailError =
    document.getElementById("emailError");

const message =
    document.getElementById("message");


/* ==========================================
   SHOW MESSAGE
========================================== */

function showMessage(text, type) {

    message.textContent = text;

    message.className =
        "message " + type;

}


/* ==========================================
   CLEAR ERRORS
========================================== */

function clearErrors() {

    emailError.textContent = "";

    emailInput.classList.remove(
        "input-error"
    );

    message.textContent = "";

    message.className = "message";

}


/* ==========================================
   FORM SUBMIT
========================================== */

forgotPasswordForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        clearErrors();


        const email =
            emailInput.value.trim();


        /* ======================================
           VALIDATION
        ====================================== */

        if (!email) {

            emailError.textContent =
                "Please enter your email address.";

            emailInput.classList.add(
                "input-error"
            );

            return;
        }


        if (
            !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
                .test(email)
        ) {

            emailError.textContent =
                "Please enter a valid email address.";

            emailInput.classList.add(
                "input-error"
            );

            return;
        }


        /* ======================================
           SEND RESET EMAIL
        ====================================== */

        try {

            console.log(
                "Sending password reset email..."
            );


            await sendPasswordResetEmail(
                auth,
                email
            );


            console.log(
                "Password reset email sent."
            );


            showMessage(
                "Password reset link has been sent to your email. Please check your inbox.",
                "success"
            );


            emailInput.value = "";


        } catch (error) {

            console.error(
                "Password reset error:",
                error
            );


            console.error(
                "Error code:",
                error.code
            );


            switch (error.code) {

                case "auth/invalid-email":

                    showMessage(
                        "Please enter a valid email address.",
                        "error"
                    );

                    break;


                case "auth/user-not-found":

                    showMessage(
                        "No account was found with this email address.",
                        "error"
                    );

                    break;


                case "auth/too-many-requests":

                    showMessage(
                        "Too many requests. Please try again later.",
                        "error"
                    );

                    break;


                case "auth/network-request-failed":

                    showMessage(
                        "Network error. Please check your internet connection.",
                        "error"
                    );

                    break;


                default:

                    showMessage(
                        error.message ||
                        "Unable to send password reset email.",
                        "error"
                    );

            }

        }

    }
);


/* ==========================================
   CLEAR ERROR WHILE TYPING
========================================== */

emailInput.addEventListener(
    "input",
    () => {

        emailError.textContent = "";

        emailInput.classList.remove(
            "input-error"
        );

        message.textContent = "";

        message.className = "message";

    }
);