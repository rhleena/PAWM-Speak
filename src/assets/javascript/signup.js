document.addEventListener('DOMContentLoaded', () => {
    const togglePassword = document.getElementById('togglePassword');
    const password = document.getElementById('password');

    togglePassword.addEventListener('click', function () {
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        password.setAttribute('type', type);
        
        // Toggle the eye icon
        const eyeIcon = this.querySelector('img');
        eyeIcon.src = type === 'password' ? 'eye-icon.svg' : 'eye-off-icon.svg';
    });

    // Prevent form submission (for demonstration purposes)
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Form submitted!');
    });
});