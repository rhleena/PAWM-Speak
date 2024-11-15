import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, addDoc, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

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
const db = getFirestore(app);

// DOM Elements
const scoreDisplay = document.getElementById('scoreDisplay');
const historyList = document.getElementById('historyList');
const viewHistoryButton = document.getElementById('viewHistory');

// Event listener for viewing history
viewHistoryButton.addEventListener('click', displayQuizHistory);

document.addEventListener('DOMContentLoaded', () => {
    const scoreDisplay = document.getElementById('scoreDisplay');
    const historyList = document.getElementById('historyList');
    const viewHistoryButton = document.getElementById('viewHistory');

    // Check if the button exists before adding the event listener
    if (viewHistoryButton) {
        viewHistoryButton.addEventListener('click', displayQuizHistory);
    } else {
        console.error("viewHistoryButton not found in the DOM.");
    }

    onAuthStateChanged(auth, (user) => {
        if (user) {
            displayCurrentScore(user.uid);
        } else {
            window.location.href = 'login.html';
        }
    });
});

// Listen for user authentication status
onAuthStateChanged(auth, (user) => {
    if (user) {
        displayCurrentScore(user.uid);
    } else {
        window.location.href = 'login.html';
    }
});

// Function to display the current score
async function displayCurrentScore(userId) {
    try {
        const scoreRef = doc(db, 'scores', userId);
        const scoreDoc = await getDoc(scoreRef);

        if (scoreDoc.exists()) {
            const { score, totalQuestions } = scoreDoc.data();
            scoreDisplay.textContent = `You scored ${score} out of ${totalQuestions}`;
        } else {
            scoreDisplay.textContent = "No score available.";
        }
    } catch (error) {
        console.error("Error retrieving current score:", error);
        scoreDisplay.textContent = "Failed to load current score.";
    }
}

// Function to save the quiz result
export async function saveQuizResult(userId, score, totalQuestions) {
    try {
        const scoreRef = doc(db, 'scores', userId);
        await setDoc(scoreRef, { score, totalQuestions, timestamp: new Date() });

        const historyRef = collection(db, 'quizHistory');
        await addDoc(historyRef, { userId, score, totalQuestions, timestamp: new Date() });
    } catch (error) {
        console.error("Error saving quiz result:", error);
    }
}

// Function to display quiz history
async function displayQuizHistory() {
    historyList.innerHTML = ''; // Clear the history list

    try {
        const user = auth.currentUser;
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        const historyRef = collection(db, 'quizHistory');
        const q = query(historyRef, where("userId", "==", user.uid), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                const { score, totalQuestions, timestamp } = doc.data();
                const date = new Date(timestamp.seconds * 1000).toLocaleDateString();
                const historyItem = document.createElement('li');
                historyItem.textContent = `Score: ${score}/${totalQuestions} - Date: ${date}`;
                historyList.appendChild(historyItem);
            });
        } else {
            const noHistoryItem = document.createElement('li');
            noHistoryItem.textContent = "No quiz history available.";
            historyList.appendChild(noHistoryItem);
        }
    } catch (error) {
        console.error("Error retrieving quiz history:", error);
        const errorItem = document.createElement('li');
        errorItem.textContent = "Failed to load quiz history.";
        historyList.appendChild(errorItem);
    }
}