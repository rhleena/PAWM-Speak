let timeLeft = 300; // Set to 3 seconds for testing purposes
const timerDisplay = document.getElementById('timer');
const questionSection = document.getElementById('questionSection');
const timeUpSection = document.getElementById('timeUpSection'); // Match ID with HTML
const continueButton = document.getElementById('continueButton');

// Start the timer when the page loads
window.onload = startTimer;

function startTimer() {
    const intervalId = setInterval(function () {
        if (timeLeft <= 0) {
            clearInterval(intervalId);
            // When the timer reaches 0, show the Time's Up message
            showTimeUpMessage();
        } else {
            // Decrease the time left and update the timer display
            timeLeft--;
            updateTimerDisplay(timeLeft);
        }
    }, 1000);
}

function updateTimerDisplay(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    timerDisplay.textContent = 
        (minutes < 10 ? '0' : '') + minutes + ':' + 
        (remainingSeconds < 10 ? '0' : '') + remainingSeconds;
}

function showTimeUpMessage() {
    // Hide the question section and show the "Time's Up" feedback
    questionSection.style.display = 'none'; // Hides the question section
    timeUpSection.style.display = 'block'; // Shows the Time's Up section
}

// Event listener for the "Continue" button
continueButton.addEventListener('click', function() {
    window.location.href = "level.html";
});
