document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');

    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        fetch('/api/theme', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ theme: newTheme })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.message === 'Theme updated successfully.') {
                console.log(`Theme changed to: ${newTheme}`);
                document.documentElement.className = '';
                document.documentElement.classList.add(newTheme);
                // Update the theme toggle label based on the new theme
                const themeLabel = document.querySelector('.theme-label');
                if (themeLabel) {
                    themeLabel.textContent = newTheme === 'dark' ? 'Dark Mode' : 'Light Mode';
                }
                // Display a message to the user about the theme update
                const themeMessage = document.getElementById('themeMessage');
                if (themeMessage) {
                    themeMessage.textContent = 'Theme updated successfully.';
                    themeMessage.style.display = 'block';
                    setTimeout(() => {
                        themeMessage.style.display = 'none';
                    }, 5000);
                }
            } else {
                throw new Error('Failed to change theme');
            }
        })
        .catch(error => {
            console.error('Error changing theme:', error.message, error.stack);
            const themeMessage = document.getElementById('themeMessage');
            if (themeMessage) {
                themeMessage.textContent = 'Failed to change theme. Please try again.';
                themeMessage.style.display = 'block';
                setTimeout(() => {
                    themeMessage.style.display = 'none';
                }, 5000);
            }
        });
    });
});