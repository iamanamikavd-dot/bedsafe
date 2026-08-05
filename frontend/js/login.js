import { loginUser } from "./auth.js";

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please enter your email and password.");
        return;
    }

    try {

        await loginUser(email, password);

        alert("Login Successful!");

        window.location.href = "dashboard.html";

    } catch (error) {

        switch (error.code) {

            case "auth/invalid-credential":
                alert("Invalid email or password.");
                break;

            case "auth/user-not-found":
                alert("No account found with this email.");
                break;

            case "auth/wrong-password":
                alert("Incorrect password.");
                break;

            case "auth/invalid-email":
                alert("Please enter a valid email address.");
                break;

            default:
                alert(error.message);

        }

    }

});