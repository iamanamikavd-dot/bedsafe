import { registerUser } from "./auth.js";

console.log("REGISTER.JS LOADED");


// ==========================================
// GET FORM ELEMENTS
// ==========================================

const registerForm = document.getElementById("registerForm");

const message = document.getElementById("message");


// Input fields
const fullName = document.getElementById("fullName");

const email = document.getElementById("email");

const phone = document.getElementById("phone");

const password = document.getElementById("password");

const confirmPassword =
    document.getElementById("confirmPassword");

const agree = document.getElementById("agree");


// Error elements
const fullNameError =
    document.getElementById("fullNameError");

const emailError =
    document.getElementById("emailError");

const phoneError =
    document.getElementById("phoneError");

const passwordError =
    document.getElementById("passwordError");

const confirmPasswordError =
    document.getElementById("confirmPasswordError");

const agreeError =
    document.getElementById("agreeError");


console.log("FORM:", registerForm);


// ==========================================
// SHOW MESSAGE
// ==========================================

function showMessage(text, type) {

    message.style.display = "block";

    message.className = "message " + type;

    message.textContent = text;

}


// ==========================================
// CLEAR MESSAGE
// ==========================================

function clearMessage() {

    message.textContent = "";

    message.style.display = "none";

    message.className = "message";

}


// ==========================================
// CLEAR ALL ERRORS
// ==========================================

function clearErrors() {

    fullNameError.textContent = "";

    emailError.textContent = "";

    phoneError.textContent = "";

    passwordError.textContent = "";

    confirmPasswordError.textContent = "";

    agreeError.textContent = "";


    fullName.classList.remove(
        "input-error",
        "input-success"
    );

    email.classList.remove(
        "input-error",
        "input-success"
    );

    phone.classList.remove(
        "input-error",
        "input-success"
    );

    password.classList.remove(
        "input-error",
        "input-success"
    );

    confirmPassword.classList.remove(
        "input-error",
        "input-success"
    );


    clearMessage();

}


// ==========================================
// VALIDATE FULL NAME
// ==========================================

function validateFullName() {

    const value = fullName.value.trim();


    if (value === "") {

        fullNameError.textContent =
            "Full Name is required.";

        fullName.classList.add("input-error");

        return false;

    }


    // Only letters and spaces
    if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(value)) {

        fullNameError.textContent =
            "Full Name must contain letters and spaces only.";

        fullName.classList.add("input-error");

        return false;

    }


    fullName.classList.add("input-success");

    return true;

}


// ==========================================
// VALIDATE EMAIL
// ==========================================

function validateEmail() {

    const value = email.value.trim();


    if (value === "") {

        emailError.textContent =
            "Email Address is required.";

        email.classList.add("input-error");

        return false;

    }


    const emailPattern =
        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;


    if (!emailPattern.test(value)) {

        emailError.textContent =
            "Please enter a valid email address.";

        email.classList.add("input-error");

        return false;

    }


    email.classList.add("input-success");

    return true;

}


// ==========================================
// VALIDATE PHONE
// ==========================================

function validatePhone() {

    const value = phone.value.trim();


    if (value === "") {

        phoneError.textContent =
            "Phone Number is required.";

        phone.classList.add("input-error");

        return false;

    }


    // Exactly 10 digits
    if (!/^[0-9]{10}$/.test(value)) {

        phoneError.textContent =
            "Phone Number must contain exactly 10 digits.";

        phone.classList.add("input-error");

        return false;

    }


    // Indian mobile number starts from 6-9
    if (!/^[6-9]/.test(value)) {

        phoneError.textContent =
            "Phone Number must start with 6, 7, 8 or 9.";

        phone.classList.add("input-error");

        return false;

    }


    phone.classList.add("input-success");

    return true;

}


// ==========================================
// VALIDATE PASSWORD
// ==========================================

function validatePassword() {

    const value = password.value;


    if (value === "") {

        passwordError.textContent =
            "Password is required.";

        password.classList.add("input-error");

        return false;

    }


    if (value.length < 8) {

        passwordError.textContent =
            "Password must be at least 8 characters long.";

        password.classList.add("input-error");

        return false;

    }


    if (!/[A-Z]/.test(value)) {

        passwordError.textContent =
            "Password must contain at least one uppercase letter.";

        password.classList.add("input-error");

        return false;

    }


    if (!/[a-z]/.test(value)) {

        passwordError.textContent =
            "Password must contain at least one lowercase letter.";

        password.classList.add("input-error");

        return false;

    }


    if (!/[0-9]/.test(value)) {

        passwordError.textContent =
            "Password must contain at least one number.";

        password.classList.add("input-error");

        return false;

    }


    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {

        passwordError.textContent =
            "Password must contain at least one special character.";

        password.classList.add("input-error");

        return false;

    }


    password.classList.add("input-success");

    return true;

}


// ==========================================
// VALIDATE CONFIRM PASSWORD
// ==========================================

function validateConfirmPassword() {

    const value = confirmPassword.value;


    if (value === "") {

        confirmPasswordError.textContent =
            "Please confirm your password.";

        confirmPassword.classList.add("input-error");

        return false;

    }


    if (value !== password.value) {

        confirmPasswordError.textContent =
            "Passwords do not match.";

        confirmPassword.classList.add("input-error");

        return false;

    }


    confirmPassword.classList.add("input-success");

    return true;

}


// ==========================================
// VALIDATE TERMS
// ==========================================

function validateTerms() {

    if (!agree.checked) {

        agreeError.textContent =
            "You must agree to the Terms & Conditions.";

        return false;

    }


    agreeError.textContent = "";

    return true;

}


// ==========================================
// FORM SUBMIT
// ==========================================

registerForm.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        console.log("REGISTER FORM SUBMITTED");


        // Clear previous errors
        clearErrors();


        // ======================================
        // RUN ALL VALIDATIONS
        // ======================================

        const nameValid =
            validateFullName();

        const emailValid =
            validateEmail();

        const phoneValid =
            validatePhone();

        const passwordValid =
            validatePassword();

        const confirmPasswordValid =
            validateConfirmPassword();

        const termsValid =
            validateTerms();


        // ======================================
        // STOP IF VALIDATION FAILS
        // ======================================

        if (
            !nameValid ||
            !emailValid ||
            !phoneValid ||
            !passwordValid ||
            !confirmPasswordValid ||
            !termsValid
        ) {

            console.log("VALIDATION FAILED");

            return;

        }


        console.log("ALL VALIDATION PASSED");

        console.log("Now calling Firebase...");


        // ======================================
        // FIREBASE REGISTRATION
        // ======================================

        try {

            await registerUser(

                fullName.value.trim(),

                email.value.trim(),

                phone.value.trim(),

                password.value

            );


            console.log(
                "FIREBASE REGISTRATION SUCCESSFUL"
            );


            // ==================================
            // SHOW SUCCESS MESSAGE
            // ==================================

            showMessage(
                "Account created successfully! Redirecting to login...",
                "success"
            );


            // ==================================
            // REDIRECT TO LOGIN
            // ==================================

            setTimeout(() => {

                window.location.href =
                    "login.html";

            }, 2000);


        }

        catch (error) {

            console.error(
                "REGISTRATION ERROR:",
                error
            );

            console.error(
                "ERROR CODE:",
                error.code
            );


            // ==================================
            // FIREBASE ERROR HANDLING
            // ==================================

            switch (error.code) {


                case "auth/email-already-in-use":

                    emailError.textContent =
                        "This email is already registered.";

                    email.classList.add(
                        "input-error"
                    );

                    break;


                case "auth/invalid-email":

                    emailError.textContent =
                        "Please enter a valid email address.";

                    email.classList.add(
                        "input-error"
                    );

                    break;


                case "auth/weak-password":

                    passwordError.textContent =
                        "Password is too weak.";

                    password.classList.add(
                        "input-error"
                    );

                    break;


                case "auth/operation-not-allowed":

                    showMessage(
                        "Email/Password authentication is not enabled in Firebase.",
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
                        "Registration failed.",
                        "error"
                    );

                    break;

            }

        }

    }
);


// ==========================================
// REAL-TIME ERROR CLEARING
// ==========================================


// Full Name
fullName.addEventListener(
    "input",
    () => {

        fullNameError.textContent = "";

        fullName.classList.remove(
            "input-error"
        );

    }
);


// Email
email.addEventListener(
    "input",
    () => {

        emailError.textContent = "";

        email.classList.remove(
            "input-error"
        );

    }
);


// Phone
phone.addEventListener(
    "input",
    () => {

        // Allow only numbers
        phone.value =
            phone.value.replace(/\D/g, "");

        phoneError.textContent = "";

        phone.classList.remove(
            "input-error"
        );

    }
);


// Password
password.addEventListener(
    "input",
    () => {

        passwordError.textContent = "";

        password.classList.remove(
            "input-error"
        );

    }
);


// Confirm Password
confirmPassword.addEventListener(
    "input",
    () => {

        confirmPasswordError.textContent = "";

        confirmPassword.classList.remove(
            "input-error"
        );

    }
);


// Terms
agree.addEventListener(
    "change",
    () => {

        agreeError.textContent = "";

    }
);


// ==========================================
// PASSWORD SHOW / HIDE
// ==========================================

const togglePasswords =
    document.querySelectorAll(".toggle-password");


togglePasswords.forEach(
    (icon) => {

        icon.addEventListener(
            "click",
            () => {

                const input =
                    icon.parentElement.querySelector(
                        "input"
                    );


                if (input.type === "password") {

                    input.type = "text";

                    icon.classList.remove(
                        "fa-eye"
                    );

                    icon.classList.add(
                        "fa-eye-slash"
                    );

                }

                else {

                    input.type = "password";

                    icon.classList.remove(
                        "fa-eye-slash"
                    );

                    icon.classList.add(
                        "fa-eye"
                    );

                }

            }
        );

    }
);