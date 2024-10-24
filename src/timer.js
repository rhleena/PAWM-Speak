let seconds = 0;
let minutes = 5;
let hours = 0;
let intervalId;

function startTimer() {
    intervalId = setInterval(updateTimer, 1000);
}

function updateTimer() {
    if (seconds === 0) {
        if (minutes === 0) {
            if (hours === 0) {
                clearInterval(intervalId);  // Stop the timer when it reaches 00:00:00
                return;
            } else {
                hours--;
                minutes = 59;
            }
        } else {
            minutes--;
        }
        seconds = 59;
    } else {
        seconds--;
    }
    displayTime();
}

function displayTime() {
    const display = document.getElementById('timer');
    display.textContent = 
        (hours > 9 ? hours : "0" + hours) + ":" + 
        (minutes > 9 ? minutes : "0" + minutes) + ":" + 
        (seconds > 9 ? seconds : "0" + seconds);
}

// Start the timer when the page loads
window.onload = startTimer;
