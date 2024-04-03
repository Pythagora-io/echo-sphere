document.addEventListener('DOMContentLoaded', function() {
    const updateSettingsForm = document.getElementById('automodConfigForm');

    const fetchAndUpdateSettings = () => {
        const subSphereId = document.getElementById('subSphereSelect').value;
        const minKarmaToPost = document.getElementById('minKarmaToPost').value;
        const allowImages = document.getElementById('allowImages').checked;
        const allowVideos = document.getElementById('allowVideos').checked;
        const allowTextPosts = document.getElementById('allowTextPosts').checked;

        const data = {
            subSphereId,
            minKarmaToPost,
            allowImages,
            allowVideos,
            allowTextPosts
        };

        fetch(`/moderation/updateSubSphereSettings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            alert('SubSphere settings updated successfully');
        })
        .catch((error) => {
            console.error('Error updating SubSphere settings:', error);
            alert('Failed to update SubSphere settings');
        });
    };

    if (updateSettingsForm) {
        updateSettingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            fetchAndUpdateSettings();
        });
    }
});