import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    // Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyBwOy1Sw24NLOKfVrFkqsJtCruMHm3W2Io",
        authDomain: "speak-pawm.firebaseapp.com",
        projectId: "speak-pawm",
        storageBucket: "speak-pawm.firebasestorage.app",
        messagingSenderId: "747309036243",
        appId: "1:747309036243:web:80cdb8dcd749fb364a9a26"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth();
    const db = getFirestore();

    // Display message function
    function showMessage(message, divId) {
        const messageDiv = document.getElementById(divId);
        messageDiv.textContent = message;
        messageDiv.style.display = "block";
        setTimeout(() => {
            messageDiv.style.display = "none";
        }, 5000);
    }

    // Sign Up event listener
    const signUpForm = document.getElementById('signUpForm');
    if (signUpForm) {
        signUpForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const email = document.getElementById('rEmail').value;
            const password = document.getElementById('rPassword').value;
            const nickName = document.getElementById('rName').value;

            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    return setDoc(doc(db, "users", user.uid), { email, nickName });
                })
                .then(() => {
                    showMessage('Account Created Successfully', 'signUpMessage');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 2000);
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const message = errorCode === 'auth/email-already-in-use' 
                        ? 'Email Address Already Exists!' 
                        : 'Unable to create User: ' + error.message;
                    showMessage(message, 'signUpMessage');
                });
        });
    }

    // Sign In event listener (if needed on this page)
    const signInForm = document.getElementById('loginForm');
    if (signInForm) {
        signInForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    showMessage('Login Successful', 'signInMessage');
                    localStorage.setItem('loggedInUserId', userCredential.user.uid);
                    setTimeout(() => {
                        window.location.href = './src/level.html';
                    }, 2000);
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const message = errorCode === 'auth/invalid-credential'
                        ? 'Incorrect Email or Password'
                        : 'Login Failed: ' + error.message;
                    showMessage(message, 'signInMessage');
                });
        });
    }
});