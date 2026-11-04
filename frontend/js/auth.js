import { auth, database } from "./firebase-config.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    ref,
    set
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";


// ============================
// REGISTER USER
// ============================

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


// ============================
// LOGIN USER
// ============================

export async function loginUser(email, password) {

    const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
    );

    return userCredential.user;
}


// ============================
// LOGOUT USER
// ============================

export async function logoutUser() {

    await signOut(auth);

}