/* ==========================================
   BedSafe Register Page
========================================== */

// ================================
// Password Show / Hide
// ================================

const toggleIcons = document.querySelectorAll(".toggle-password");

toggleIcons.forEach(icon => {

    icon.addEventListener("click", () => {

        const input = icon.previousElementSibling;

        if (input.type === "password") {

            input.type = "text";

            icon.classList.remove("fa-eye");

            icon.classList.add("fa-eye-slash");

        } else {

            input.type = "password";

            icon.classList.remove("fa-eye-slash");

            icon.classList.add("fa-eye");

        }

    });

});

// ================================
// Form Validation
// ================================

const form = document.querySelector("form");

form.addEventListener("submit", function(e){

    e.preventDefault();

    const fullName = document.querySelector('input[type="text"]').value.trim();

    const email = document.querySelector('input[type="email"]').value.trim();

    const phone = document.querySelector('input[type="tel"]').value.trim();

    const password = document.getElementById("password").value;

    const confirmPassword = document.getElementById("confirmPassword").value;

    const agree = document.getElementById("agree").checked;

    // Name validation
    if(fullName.length < 3){

        alert("Please enter your full name.");

        return;

    }

    // Email validation
    const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,}$/i;

    if(!emailPattern.test(email)){

        alert("Please enter a valid email address.");

        return;

    }

    // Phone validation
    const phonePattern = /^[0-9]{10}$/;

    if(!phonePattern.test(phone)){

        alert("Phone number must contain exactly 10 digits.");

        return;

    }

    // Password validation
    if(password.length < 8){

        alert("Password must be at least 8 characters long.");

        return;

    }

    // Confirm password
    if(password !== confirmPassword){

        alert("Passwords do not match.");

        return;

    }

    // Terms agreement
    if(!agree){

        alert("Please accept the Terms & Conditions.");

        return;

    }

    // Success
    alert("🎉 Registration Successful!");

    // Redirect to Login Page
    window.location.href = "login.html";

});

// ================================
// Input Focus Animation
// ================================

const inputs = document.querySelectorAll("input");

inputs.forEach(input => {

    input.addEventListener("focus", () => {

        input.parentElement.style.transform = "scale(1.02)";

    });

    input.addEventListener("blur", () => {

        input.parentElement.style.transform = "scale(1)";

    });

});

// ================================
// Navbar Shadow
// ================================

window.addEventListener("scroll", () => {

    const header = document.querySelector("header");

    if(window.scrollY > 20){

        header.style.boxShadow =
        "0 10px 25px rgba(0,0,0,.12)";

    }else{

        header.style.boxShadow =
        "0 3px 15px rgba(0,0,0,.06)";

    }

});

// ================================
// Console Message
// ================================

console.log("BedSafe Register Page Loaded Successfully");