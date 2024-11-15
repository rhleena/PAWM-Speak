import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore, collection, getDocs, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
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
const db = getFirestore(app);
const auth = getAuth(app);

let questions = [];
let currentQuestionIndex = 0;
let userAnswers = {};
let timer;
let userId = null;

// DOM Elements
const questionText = document.getElementById('questionText');
const answerArea = document.getElementById('answerArea');
const submitBtn = document.getElementById('submitBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const timerContainer = document.getElementById('timerContainer');

// Precondition: Check if the user is logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        userId = user.uid;
        fetchQuestions();
    } else {
        alert("You must be logged in to take the quiz.");
        window.location.href = 'login.html';
    }
});

// Fetch questions from Firebase
async function fetchQuestions() {
    try {
        const questionsCollection = collection(db, 'questions');
        const snapshot = await getDocs(questionsCollection);
        questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).slice(0, 10);

        console.log("Fetched questions:", questions);

        if (questions.length === 0) {
            console.error("No questions found in Firestore");
            alert("No questions found. Please check your Firestore database.");
            return;
        }

        displayQuestion();
    } catch (error) {
        console.error("Error fetching questions:", error);
        alert("There was an error fetching questions. Please try again later.");
    }
}

function displayQuestion() {
    const question = questions[currentQuestionIndex];
    if (!question) {
        console.error("No question found at index", currentQuestionIndex);
        return;
    }

    console.log("Displaying question:", question);

    questionText.textContent = question.text;
    answerArea.innerHTML = '';
    timerContainer.textContent = '';

    switch (question.type) {
        case 'multiple-choice':
            displayMultipleChoice(question);
            break;
        case 'drag-drop':
            displayDragDrop(question);
            break;
        case 'fill-blank':
            displayFillBlank(question);
            break;
    }

    if (question.timeLimit) {
        startTimer(question.timeLimit);
    }

    updateNavigationButtons();
}

function displayMultipleChoice(question) {
    question.options.forEach((option) => {
        const button = document.createElement('button');
        button.textContent = option;
        button.classList.add('option');
        button.addEventListener('click', () => selectOption(button, option));
        answerArea.appendChild(button);
    });
}

function selectOption(button, option) {
    const question = questions[currentQuestionIndex];
    userAnswers[question.id] = option;
    answerArea.querySelectorAll('.option').forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
}

function startTimer(duration) {
    let timeLeft = duration;
    timer = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerContainer.textContent = `Time left: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        if (--timeLeft < 0) {
            clearInterval(timer);
            moveToNextQuestion();
        }
    }, 1000);
}

function moveToNextQuestion() {
    clearInterval(timer);
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        finishQuiz();
    }
}

function updateNavigationButtons() {
    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.disabled = currentQuestionIndex === questions.length - 1;
}

async function finishQuiz() {
    let score = 0;
    questions.forEach(question => {
        if (question.type !== 'recording' && userAnswers[question.id] === question.correctAnswer) {
            score += 20; // Each correct answer scores 20 points
        }
    });

    if (!userId) {
        alert("User is not logged in. Cannot save quiz results.");
        return;
    }

    const quizResultRef = doc(db, 'quizResults', userId);

    try {
        await setDoc(quizResultRef, {
            score: score,
            totalQuestions: questions.length,
            timestamp: new Date().toISOString(),
            userId: userId
        });
        console.log("Quiz result saved successfully.");
        alert(`Quiz finished! Your score is ${score}.`);
        window.location.href = 'score.html';
    } catch (error) {
        console.error("Error saving quiz result: ", error);
        alert("There was an error saving your results. Please try again.");
    }
}

// Event listeners
submitBtn.addEventListener('click', finishQuiz);
prevBtn.addEventListener('click', () => {
    clearInterval(timer);
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
});
nextBtn.addEventListener('click', moveToNextQuestion);

// Initialize the quiz
document.addEventListener('DOMContentLoaded', () => {
    if (!userId) {
        alert("Please log in to continue.");
        window.location.href = 'login.html';
    }
});