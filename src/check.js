const questionUI = document.getElementById('questionUI');
        const feedbackUI = document.getElementById('feedbackUI');
        const correctFeedback = document.getElementById('correctFeedback');
        const incorrectFeedback = document.getElementById('incorrectFeedback');
        const submitButton = document.getElementById('submitButton');
        const nextButton = document.getElementById('nextButton');
        const answerInput = document.getElementById('answerInput');
        const questionText = document.getElementById('questionText');
        const correctQuestion = document.getElementById('correctQuestion');
        const correctAnswer = document.getElementById('correctAnswer');
        const incorrectAnswer = document.getElementById('incorrectAnswer');

        const correctAnswerText = "Two years";

        submitButton.addEventListener('click', checkAnswer);
        nextButton.addEventListener('click', function() {
            window.location.href = "level.html";
        });
        

        function checkAnswer() {
            const userAnswer = answerInput.value.trim().toLowerCase();
            const isCorrect = userAnswer === correctAnswerText.toLowerCase();

            questionUI.classList.add('hidden');
            feedbackUI.classList.remove('hidden');

            if (isCorrect) {
                correctFeedback.classList.remove('hidden');
                incorrectFeedback.classList.add('hidden');
                correctQuestion.textContent = questionText.textContent;
                correctAnswer.textContent = correctAnswerText;
            } else {
                correctFeedback.classList.add('hidden');
                incorrectFeedback.classList.remove('hidden');
                incorrectAnswer.textContent = userAnswer;
            }
        }

        // function showNextQuestion() {
        //     // feedbackUI.classList.add('hidden');
        //     // questionUI.classList.remove('hidden');
        //     // answerInput.value = '';
        //     // // Here you would typically load the next question
        //     // // For this example, we'll just reset to the original question
        //     // questionText.textContent = "How long has the applicant been working in marketing?";
        // }