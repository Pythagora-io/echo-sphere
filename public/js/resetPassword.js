document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('resetPasswordForm');
    const emailInput = document.getElementById('email');
    const messageArea = document.getElementById('messageArea');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = emailInput.value;

        fetch('/auth/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                messageArea.textContent = 'An email has been sent with further instructions to reset your password.';
                messageArea.classList.remove('hidden');
                messageArea.classList.add('text-green-500');
            } else {
                messageArea.textContent = 'Failed to send reset email. Please try again later.';
                messageArea.classList.remove('hidden');
                messageArea.classList.add('text-red-500');
            }
            console.log('Password reset email sent:', data.message);
        })
        .catch(error => {
            console.error('Error sending password reset email:', error.message, error.stack);
            messageArea.textContent = 'An error occurred while sending the reset email. Please try again.';
            messageArea.classList.remove('hidden');
            messageArea.classList.add('text-red-500');
        });
    });
});