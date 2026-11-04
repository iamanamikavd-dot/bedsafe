/* ==========================================
   BEDSAFE - LOGIN
========================================== */

import { loginUser } from "./auth.js";


/* ==========================================
   GET ELEMENTS
========================================== */

const loginForm = document.getElementById("loginForm");

const emailInput = document.getElementById("email");

const passwordInput = document.getElementById("password");

const rememberMe = document.getElementById("rememberMe");

const togglePassword = document.getElementById("togglePassword");

const loginMessage = document.getElementById("loginMessage");



/* ==========================================
   SHOW MESSAGE
========================================== */

function showMessage(message, type) {

    if (!loginMessage) {
        alert(message);
        return;
    }

    loginMessage.textContent = message;

    loginMessage.className = "message " + type;

    loginMessage.style.display = "block";
}



/* ==========================================
   PASSWORD SHOW / HIDE
========================================== */

if (togglePassword) {

    togglePassword.addEventListener("click", () => {

        if (passwordInput.type === "password") {

            passwordInput.type = "text";

            togglePassword.classList.remove(
                "fa-eye"
            );

            togglePassword.classList.add(
                "fa-eye-slash"
            );

            togglePassword.title =
                "Hide password";

        } else {

            passwordInput.type = "password";

            togglePassword.classList.remove(
                "fa-eye-slash"
            );

            togglePassword.classList.add(
                "fa-eye"
            );

            togglePassword.title =
                "Show password";

        }

    });

}



/* ==========================================
   LOGIN FORM
========================================== */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            /* ------------------------------
               CLEAR OLD MESSAGE
            ------------------------------ */

            if (loginMessage) {

                loginMessage.style.display =
                    "none";

                loginMessage.textContent = "";

            }


            /* ------------------------------
               GET INPUT VALUES
            ------------------------------ */

            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value;


            /* ------------------------------
               VALIDATION
            ------------------------------ */

            if (!email) {

                showMessage(
                    "Please enter your email address.",
                    "error"
                );

                emailInput.focus();

                return;
            }


            if (!password) {

                showMessage(
                    "Please enter your password.",
                    "error"
                );

                passwordInput.focus();

                return;
            }


            /* ------------------------------
               EMAIL FORMAT
            ------------------------------ */

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (!emailPattern.test(email)) {

                showMessage(
                    "Please enter a valid email address.",
                    "error"
                );

                emailInput.focus();

                return;
            }


            /* ------------------------------
               DISABLE BUTTON
            ------------------------------ */

            const loginButton =
                loginForm.querySelector(
                    'button[type="submit"]'
                );


            const originalButtonText =
                loginButton.innerHTML;


            loginButton.disabled = true;

            loginButton.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Logging in...';



            /* ------------------------------
               FIREBASE LOGIN
            ------------------------------ */

            try {

                await loginUser(
                    email,
                    password
                );


                /* --------------------------
                   REMEMBER ME
                -------------------------- */

                if (
                    rememberMe &&
                    rememberMe.checked
                ) {

                    localStorage.setItem(
                        "bedSafeRememberMe",
                        "true"
                    );

                } else {

                    localStorage.removeItem(
                        "bedSafeRememberMe"
                    );

                }


                /* --------------------------
                   SUCCESS
                -------------------------- */

                showMessage(
                    "Login successful! Redirecting...",
                    "success"
                );


                setTimeout(() => {

                    window.location.href =
                        "dashboard.html";

                }, 800);


            } catch (error) {

                console.error(
                    "Login Error:",
                    error
                );


                /* --------------------------
                   FIREBASE ERRORS
                -------------------------- */

                switch (error.code) {

                    case "auth/invalid-credential":

                        showMessage(
                            "Invalid email or password.",
                            "error"
                        );

                        break;


                    case "auth/user-not-found":

                        showMessage(
                            "No account found with this email.",
                            "error"
                        );

                        break;


                    case "auth/wrong-password":

                        showMessage(
                            "Incorrect password.",
                            "error"
                        );

                        break;


                    case "auth/invalid-email":

                        showMessage(
                            "Please enter a valid email address.",
                            "error"
                        );

                        break;


                    case "auth/too-many-requests":

                        showMessage(
                            "Too many login attempts. Please try again later.",
                            "error"
                        );

                        break;


                    case "auth/network-request-failed":

                        showMessage(
                            "Network error. Please check your internet connection.",
                            "error"
                        );

                        break;


                    case "auth/user-disabled":

                        showMessage(
                            "This account has been disabled.",
                            "error"
                        );

                        break;


                    default:

                        showMessage(
                            error.message ||
                            "Login failed. Please try again.",
                            "error"
                        );

                }


                /* --------------------------
                   ENABLE BUTTON AGAIN
                -------------------------- */

                loginButton.disabled = false;

                loginButton.innerHTML =
                    originalButtonText;

            }

        }
    );

}



/* ==========================================
   GOOGLE LOGIN
========================================== */

const googleButton =
    document.getElementById("googleLogin");


if (googleButton) {

    googleButton.addEventListener(
        "click",
        () => {

            alert(
                "Google login is not configured yet."
            );

        }
    );

}



/* ==========================================
   MICROSOFT LOGIN
========================================== */

const microsoftButton =
    document.getElementById(
        "microsoftLogin"
    );


if (microsoftButton) {

    microsoftButton.addEventListener(
        "click",
        () => {

            alert(
                "Microsoft login is not configured yet."
            );

        }
    );

}