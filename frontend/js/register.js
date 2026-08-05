import { registerUser } from "./auth.js";

const registerForm = document.getElementById("registerForm");
const message = document.getElementById("message");

registerForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    message.textContent = "";
    message.style.color = "red";

    // Validation
    if (fullName === "" || email === "" || phone === "") {
        message.textContent = "Please fill in all fields.";
        return;
    }

    if (password.length < 8) {
        message.textContent = "Password must be at least 8 characters long.";
        return;
    }

    if (password !== confirmPassword) {
        message.textContent = "Passwords do not match.";
        return;
    }

    try {

        await registerUser(fullName, email, phone, password);

        message.style.color = "green";
        message.textContent = "Account created successfully! Redirecting to login...";

        setTimeout(() => {
            window.location.href = "login.html";
        }, 2000);

    } catch (error) {

        switch (error.code) {

            case "auth/email-already-in-use":
                message.textContent = "This email is already registered.";
                break;

            case "auth/invalid-email":
                message.textContent = "Please enter a valid email address.";
                break;

            case "auth/weak-password":
                message.textContent = "Password is too weak.";
                break;

            default:
                message.textContent = error.message;
        }

    }

});