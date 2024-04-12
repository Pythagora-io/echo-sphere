document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    const themeLabel = document.querySelector('.theme-label');

    themeToggle.addEventListener('change', function() {
        const theme = themeToggle.checked ? 'dark' : 'light';

        fetch('/api/theme', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ theme: theme })
        })
        .then(response => {
            if (response.ok) {
                console.log(`Theme changed to: ${theme}`);
                if (theme === 'dark') {
                    document.body.className = '';
                    document.body.classList.add('dark-theme');
                    themeLabel.textContent = 'Dark Mode';
                } else {
                    document.body.className = '';
                    document.body.classList.add('light-theme');
                    themeLabel.textContent = 'Light Mode';
                }
            } else {
                throw new Error('Failed to change theme');
            }
        })
        .catch(error => {
            console.error('Error changing theme:', error.message, error.stack);
            displayErrorMessage('Failed to change theme. Please try again.');
        });
    });

    function displayErrorMessage(message) {
        const errorMessageContainer = document.createElement('div');
        errorMessageContainer.setAttribute('class', 'error-message');
        errorMessageContainer.textContent = message;
        document.body.insertBefore(errorMessageContainer, document.body.firstChild);
        setTimeout(() => {
            errorMessageContainer.remove();
        }, 5000);
    }
});