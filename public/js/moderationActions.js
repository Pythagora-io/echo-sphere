document.addEventListener('DOMContentLoaded', function() {
    const banUserButton = document.getElementById('banUserButton');
    const unbanUserButton = document.getElementById('unbanUserButton');
    const stickyPostButton = document.getElementById('stickyPostButton');
    const unstickyPostButton = document.getElementById('unstickyPostButton');
    const lockPostButton = document.getElementById('lockPostButton');
    const unlockPostButton = document.getElementById('unlockPostButton');
    const deletePostButton = document.getElementById('deletePostButton'); // Added delete post button
    const banUserIdInput = document.getElementById('banUserId');
    const unbanUserIdInput = document.getElementById('unbanUserId');
    const stickyPostIdInput = document.getElementById('stickyPostId');
    const unstickyPostIdInput = document.getElementById('unstickyPostId');
    const lockPostIdInput = document.getElementById('lockPostId');
    const unlockPostIdInput = document.getElementById('unlockPostId');
    const deletePostIdInput = document.getElementById('deletePostId'); // Added input for delete post ID
    const subSphereSelect = document.getElementById('subSphereSelect');
    const banUserError = document.getElementById('banUserError');
    const unbanUserError = document.getElementById('unbanUserError');
    const stickyPostError = document.getElementById('stickyPostError');
    const unstickyPostError = document.createElement('div');
    unstickyPostError.id = 'unstickyPostError';
    unstickyPostIdInput.parentNode.insertBefore(unstickyPostError, unstickyPostIdInput.nextSibling);
    const lockPostError = document.createElement('div');
    lockPostError.id = 'lockPostError';
    lockPostIdInput.parentNode.insertBefore(lockPostError, lockPostIdInput.nextSibling);
    const unlockPostError = document.createElement('div');
    unlockPostError.id = 'unlockPostError';
    unlockPostIdInput.parentNode.insertBefore(unlockPostError, unlockPostIdInput.nextSibling);
    const deletePostError = document.createElement('div'); // Added error display for delete post
    deletePostError.id = 'deletePostError';
    deletePostIdInput.parentNode.insertBefore(deletePostError, deletePostIdInput.nextSibling);

    // Added event listener for delete post button
    deletePostButton.addEventListener('click', function() {
        const postId = deletePostIdInput.value.trim();
        const subSphereId = subSphereSelect.value;
        if (!postId) {
            deletePostError.textContent = 'Post ID is required';
            deletePostError.classList.remove('hidden');
            deletePostError.classList.add('text-red-500', 'dark:text-red-400');
            return;
        } else {
            deletePostError.classList.add('hidden');
        }
        fetch(`/moderation/deletePost/${postId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ subSphereId }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Delete Post Success:', data);
            window.location.reload();
        })
        .catch((error) => {
            console.error('Error deleting post:', error);
            console.log(error.stack); // Logging the error stack for detailed debugging
            deletePostError.textContent = 'Failed to delete post';
            deletePostError.classList.remove('hidden');
            deletePostError.classList.add('text-red-500', 'dark:text-red-400');
        });
    });

    banUserButton.addEventListener('click', function() {
        const userId = banUserIdInput.value.trim();
        const subSphereId = subSphereSelect.value;
        if (!userId) {
            banUserError.textContent = 'User ID is required';
            banUserError.classList.remove('hidden');
            banUserError.classList.add('text-red-500', 'dark:text-red-400');
            return;
        } else {
            banUserError.classList.add('hidden');
        }
        fetch(`/moderation/banUser/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ subSphereId }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Ban User Success:', data);
            window.location.reload();
        })
        .catch((error) => {
            console.error('Error banning user:', error);
            console.log(error.stack); // Logging the error stack for detailed debugging
            banUserError.textContent = 'Failed to ban user';
            banUserError.classList.remove('hidden');
            banUserError.classList.add('text-red-500', 'dark:text-red-400');
        });
    });

    unbanUserButton.addEventListener('click', function() {
        const userId = unbanUserIdInput.value.trim();
        const subSphereId = subSphereSelect.value;
        if (!userId) {
            unbanUserError.textContent = 'User ID is required';
            unbanUserError.classList.remove('hidden');
            unbanUserError.classList.add('text-red-500', 'dark:text-red-400');
            return;
        } else {
            unbanUserError.classList.add('hidden');
        }
        fetch(`/moderation/unbanUser/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ subSphereId }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Unban User Success:', data);
            window.location.reload();
        })
        .catch((error) => {
            console.error('Error unbanning user:', error);
            console.log(error.stack); // Logging the error stack for detailed debugging
            unbanUserError.textContent = 'Failed to unban user';
            unbanUserError.classList.remove('hidden');
            unbanUserError.classList.add('text-red-500', 'dark:text-red-400');
        });
    });

    stickyPostButton.addEventListener('click', function() {
        const postId = stickyPostIdInput.value.trim();
        const subSphereId = subSphereSelect.value;
        if (!postId) {
            stickyPostError.textContent = 'Post ID is required';
            stickyPostError.classList.remove('hidden');
            stickyPostError.classList.add('text-red-500', 'dark:text-red-400');
            return;
        } else {
            stickyPostError.classList.add('hidden');
        }
        fetch(`/moderation/stickyPost/${postId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ subSphereId }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Sticky Post Success:', data);
            window.location.reload();
        })
        .catch((error) => {
            console.error('Error stickying post:', error);
            console.log(error.stack); // Logging the error stack for detailed debugging
            stickyPostError.textContent = 'Failed to sticky post';
            stickyPostError.classList.remove('hidden');
            stickyPostError.classList.add('text-red-500', 'dark:text-red-400');
        });
    });

    // Event listeners for unsticky, lock, and unlock post buttons
    unstickyPostButton.addEventListener('click', function() {
        const postId = unstickyPostIdInput.value.trim();
        const subSphereId = subSphereSelect.value;
        if (!postId) {
            unstickyPostError.textContent = 'Post ID is required';
            unstickyPostError.classList.remove('hidden');
            unstickyPostError.classList.add('text-red-500', 'dark:text-red-400');
            return;
        } else {
            unstickyPostError.classList.add('hidden');
        }
        fetch(`/moderation/unstickyPost/${postId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ subSphereId }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Unsticky Post Success:', data);
            window.location.reload();
        })
        .catch((error) => {
            console.error('Error unstickying post:', error);
            console.log(error.stack); // Logging the error stack for detailed debugging
            unstickyPostError.textContent = 'Failed to unsticky post';
            unstickyPostError.classList.remove('hidden');
            unstickyPostError.classList.add('text-red-500', 'dark:text-red-400');
        });
    });

    lockPostButton.addEventListener('click', function() {
        const postId = lockPostIdInput.value.trim();
        const subSphereId = subSphereSelect.value;
        if (!postId) {
            lockPostError.textContent = 'Post ID is required';
            lockPostError.classList.remove('hidden');
            lockPostError.classList.add('text-red-500', 'dark:text-red-400');
            return;
        } else {
            lockPostError.classList.add('hidden');
        }
        fetch(`/moderation/lockPost/${postId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ subSphereId }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Lock Post Success:', data);
            window.location.reload();
        })
        .catch((error) => {
            console.error('Error locking post:', error);
            console.log(error.stack); // Logging the error stack for detailed debugging
            lockPostError.textContent = 'Failed to lock post';
            lockPostError.classList.remove('hidden');
            lockPostError.classList.add('text-red-500', 'dark:text-red-400');
        });
    });

    unlockPostButton.addEventListener('click', function() {
        const postId = unlockPostIdInput.value.trim();
        const subSphereId = subSphereSelect.value;
        if (!postId) {
            unlockPostError.textContent = 'Post ID is required';
            unlockPostError.classList.remove('hidden');
            unlockPostError.classList.add('text-red-500', 'dark:text-red-400');
            return;
        } else {
            unlockPostError.classList.add('hidden');
        }
        fetch(`/moderation/unlockPost/${postId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ subSphereId }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Unlock Post Success:', data);
            window.location.reload();
        })
        .catch((error) => {
            console.error('Error unlocking post:', error);
            console.log(error.stack); // Logging the error stack for detailed debugging
            unlockPostError.textContent = 'Failed to unlock post';
            unlockPostError.classList.remove('hidden');
            unlockPostError.classList.add('text-red-500', 'dark:text-red-400');
        });
    });
});