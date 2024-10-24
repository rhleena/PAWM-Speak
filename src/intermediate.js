document.addEventListener('DOMContentLoaded', function() {
    const arrowRight = document.querySelector('.arrow-right');
    const arrowLeft = document.querySelector('.arrow-left');

    // Function to add fade-in animation
    function fadeIn(element, delay) {
        setTimeout(() => {
            element.style.opacity = '0';
            element.style.display = 'block';
            let opacity = 0;
            const timer = setInterval(() => {
                if (opacity >= 1) {
                    clearInterval(timer);
                }
                element.style.opacity = opacity;
                opacity += 0.1;
            }, 50);
        }, delay);
    }

    // Fade in timer
    fadeIn(timerElement, 250);

    // Handle navigation arrows
    [arrowLeft, arrowRight].forEach(arrow => {
        arrow.addEventListener('click', function(e) {
            e.preventDefault();
            // Don't clear the timer when navigating
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                window.location.href = this.href;
            }, 500);
        });
    });

    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            arrowLeft.click();
        } else if (e.key === 'ArrowRight') {
            arrowRight.click();
        }
    });

    // Clear localStorage when the quiz is completed or abandoned
    window.addEventListener('beforeunload', function() {
        if (!window.location.href.includes('comprehension') && !window.location.href.includes('question')) {
            localStorage.removeItem('timeLeft');
        }
    });
});