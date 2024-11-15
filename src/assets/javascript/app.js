const firebaseConfig = {
    apiKey: "AIzaSyBwOy1Sw24NLOKfVrFkqsJtCruMHm3W2Io",
    authDomain: "speak-pawm.firebaseapp.com",
    projectId: "speak-pawm",
    storageBucket: "speak-pawm.appspot.com",
    messagingSenderId: "747309036243",
    appId: "1:747309036243:web:80cdb8dcd749fb364a9a26"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

let userId = null;
let questions = [];
let currentQuestionIndex = 0;
let userAnswers = {};
let timer;

// DOM Elements
let questionText, answerArea, prevBtn, nextBtn, submitBtn, timerContainer;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM elements
    questionText = document.getElementById('questionText');
    answerArea = document.getElementById('answerArea');
    prevBtn = document.getElementById('prevBtn');
    nextBtn = document.getElementById('nextBtn');
    submitBtn = document.getElementById('submitBtn');
    timerContainer = document.getElementById('timerContainer');

    // Check authentication state
    auth.onAuthStateChanged((user) => {
        if (user) {
            userId = user.uid;
            loadQuizHistory(userId);
            initializeQuiz();
        } else {
            window.location.href = 'login.html';
        }
    });
});

function loadQuizHistory() {
    const historyTableBody = document.getElementById('historyTableBody');
    if (!historyTableBody) {
        console.error("Element with ID 'historyTableBody' not found in the DOM.");
        return;
    }

    historyTableBody.innerHTML = '<tr><td colspan="3">Loading...</td></tr>';

    auth.onAuthStateChanged((user) => {
        if (user) {
            userId = user.uid;

            db.collection('quizResults')
                .where('userId', '==', userId)
                .orderBy('timestamp', 'desc')
                .limit(5)
                .get()
                .then((querySnapshot) => {
                    if (querySnapshot.empty) {
                        historyTableBody.innerHTML = '<tr><td colspan="3">No quiz history found</td></tr>';
                        return;
                    }

                    historyTableBody.innerHTML = '';

                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        const date = data.timestamp instanceof firebase.firestore.Timestamp
                            ? data.timestamp.toDate().toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : new Date(data.timestamp).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              });

                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${data.level || 'N/A'}</td>
                            <td>${data.score || 0}</td>
                            <td>${date}</td>
                        `;
                        historyTableBody.appendChild(row);
                    });
                })
                .catch((error) => {
                    console.error("Error fetching quiz history:", error);
                    historyTableBody.innerHTML = '<tr><td colspan="3">Error loading quiz history. Please try again later.</td></tr>';
                });
        } else {
            historyTableBody.innerHTML = '<tr><td colspan="3">Please sign in to view quiz history</td></tr>';
        }
    });
}



function initializeQuiz() {
    // Fetch questions without category
    fetchQuestions();

    // Add event listeners
    prevBtn.addEventListener('click', goToPreviousQuestion);
    nextBtn.addEventListener('click', goToNextQuestion);
    submitBtn.addEventListener('click', submitQuiz);
    startTime = new Date();
}

function fetchQuestions() {
    let query = db.collection('questions');
    query.get()
        .then((snapshot) => {
            console.log("Fetched questions:", snapshot.docs);
            questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).slice(0, 10);
            if (questions.length > 0) {
                displayQuestion();
            } else {
                alert("No questions found. Redirecting.");
                window.location.href = 'level.html';
            }
        })
        .catch((error) => {
            console.error("Error fetching questions:", error.message);
            alert("Error fetching questions. Please try again.");
        });
}

function displayQuestion() {
    if (questions.length === 0) {
        console.error("No questions to display.");
        return;
    }

    const question = questions[currentQuestionIndex];
    console.log("Displaying question:", question);

    questionText.textContent = question.text || "Question text not found";
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

    updateNavigationButtons();

    if (question.timeLimit) {
        startTimer(question.timeLimit);
    }
}

function displayMultipleChoice(question) {
    question.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.classList.add('option');
        button.addEventListener('click', () => selectOption(question.id, option));
        answerArea.appendChild(button);
    });
}

function displayFillBlank(question) {
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'fillBlankInput';
    input.value = userAnswers[question.id] || ''; // Preserve user's answer if they navigate back
    input.addEventListener('input', (e) => userAnswers[question.id] = e.target.value);
    answerArea.appendChild(input);
  
    // Add a submit button for fill-in-the-blank questions
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit Answer';
    submitButton.addEventListener('click', () => checkFillBlankAnswer(question));
    answerArea.appendChild(submitButton);
}

function checkFillBlankAnswer(question) {
    const userAnswer = userAnswers[question.id];
    const isCorrect = userAnswer.toLowerCase() === question.correctAnswer.toLowerCase();
    alert(isCorrect ? 'Correct!' : 'Incorrect. Try again.');
}

function displayDragDrop(question) {
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'items-container';
    const slotsContainer = document.createElement('div');
    slotsContainer.className = 'slots-container';
  
    // Shuffle the pairs to randomize the order of items
    const shuffledPairs = [...question.pairs].sort(() => Math.random() - 0.5);
  
    shuffledPairs.forEach((pair, index) => {
      const item = document.createElement('div');
      item.textContent = pair.item;
      item.className = 'draggable';
      item.draggable = true;
      item.id = `item-${index}`;
      item.addEventListener('dragstart', drag);
      itemsContainer.appendChild(item);
  
      const slot = document.createElement('div');
      slot.className = 'slot';
      slot.dataset.match = pair.match;
      slot.textContent = pair.match; // Display the match text in the slot
      slot.addEventListener('dragover', allowDrop);
      slot.addEventListener('drop', drop);
      slotsContainer.appendChild(slot);
    });
  
    answerArea.appendChild(itemsContainer);
    answerArea.appendChild(slotsContainer);
}

function startTimer(timeLimit) {
    timerContainer.textContent = `Time Limit: ${timeLimit} seconds`;
    // Add your timer logic here if needed
}

function goToPreviousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

function goToNextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    }
}

function submitQuiz() {
    endTime = new Date(); // Stop the timer
    totalTime = (endTime - startTime) / 1000; // Calculate total time in seconds

    let score = 0;
    questions.forEach(q => {
        if (userAnswers[q.id] === q.correctAnswer) score += 10;
    });

    db.collection('quizResults').add({
        score,
        totalTime,
        timestamp: new Date(),
        userId
    })
    .then(() => {
        displayScorePage(score, totalTime);
    })
    .catch((error) => {
        console.error("Error saving results:", error.message);
        alert("Error saving quiz results. Please try again.");
    });
}

function updateNavigationButtons() {
    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.disabled = currentQuestionIndex === questions.length - 1;
}

function selectOption(questionId, selectedOption) {
    userAnswers[questionId] = selectedOption;
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
  }
  
  function allowDrop(ev) {
    ev.preventDefault();
  }
  
  function drop(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    const draggedElement = document.getElementById(data);
  
    if (ev.target.classList.contains('slot') && !ev.target.hasChildNodes()) {
      ev.target.appendChild(draggedElement);
      checkDragDropAnswer();
    }
  }
  
  function checkDragDropAnswer() {
    const question = questions[currentQuestionIndex];
    const slots = document.querySelectorAll('.slot');
    let isCorrect = true;
  
    slots.forEach(slot => {
      if (slot.firstChild && slot.firstChild.textContent !== slot.dataset.match) {
        isCorrect = false;
      }
    });
  
    userAnswers[question.id] = isCorrect;
    alert(isCorrect ? 'Correct!' : 'Incorrect. Try again.');
  }
  

function checkAnswer() {
    const question = questions[currentQuestionIndex];
    const slots = document.querySelectorAll('.slot');
    let isCorrect = true;

    slots.forEach(slot => {
        if (slot.firstChild && slot.firstChild.textContent !== slot.dataset.match) {
            isCorrect = false;
        }
    });

    userAnswers[question.id] = isCorrect;
}

function displayScorePage(score, time) {
    // Clear the current content
    questionText.textContent = '';
    answerArea.innerHTML = '';
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    submitBtn.style.display = 'none';
    timerContainer.style.display = 'none';

    // Create and display the score information
    const scoreContainer = document.createElement('div');
    scoreContainer.innerHTML = `
        <h2>Quiz Completed!</h2>
        <p>Your Score: ${score} out of ${questions.length * 10}</p>
        <p>Total Time: ${time.toFixed(2)} seconds</p>
    `;

    // Create a button to go back to the level selection
    const backButton = document.createElement('button');
    backButton.textContent = 'Back to Menu';
    backButton.addEventListener('click', () => {
        window.location.href = 'level.html';
    });

    // Append the score information and back button
    answerArea.appendChild(scoreContainer);
    answerArea.appendChild(backButton);
}