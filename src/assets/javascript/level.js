// Import necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

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
const auth = getAuth(app);

// Function to redirect to quiz only if the user is authenticated
function redirectToQuiz(page) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is logged in, redirect to the selected page
            window.location.href = page;
        } else {
            // User is not logged in, redirect to login page
            alert("Please log in to start the quiz.");
            window.location.href = 'login.html';
        }
    });
}

// Event listeners for level buttons
document.getElementById('comprehensionButton').addEventListener('click', () => redirectToQuiz('quiz.html'));
document.getElementById('grammarButton').addEventListener('click', () => redirectToQuiz('grammar.html'));
document.getElementById('speakingButton').addEventListener('click', () => redirectToQuiz('speaking.html'));