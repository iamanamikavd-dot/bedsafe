import { auth, database } from "./firebase-config.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    ref,
    set
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

// Register User
export async function registerUser(fullName, email, phone, password) {

    const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
    );

    const user = userCredential.user;

    await set(ref(database, "users/" + user.uid), {
        uid: user.uid,
        fullName: fullName,
        email: email,
        phone: phone,
        createdAt: new Date().toISOString()
    });

    return user;
}

// Login User
export async function loginUser(email, password) {

    const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
    );

    return userCredential.user;
}
import {
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// Logout User
export async function logoutUser() {
    await signOut(auth);
}