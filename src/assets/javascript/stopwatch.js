let seconds = 0;
        let minutes = 0;
        let hours = 0;
        let intervalId;

        function startStopwatch() {
            intervalId = setInterval(updateStopwatch, 1000);
        }

        function updateStopwatch() {
            seconds++;
            if (seconds === 60) {
                seconds = 0;
                minutes++;
                if (minutes === 60) {
                    minutes = 0;
                    hours++;
                }
            }
            displayTime();
        }

        function displayTime() {
            const display = document.getElementById('stopwatch');
            display.textContent = 
                (hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" + 
                (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + 
                (seconds > 9 ? seconds : "0" + seconds);
        }

        // Start the stopwatch when the page loads
        window.onload = startStopwatch;