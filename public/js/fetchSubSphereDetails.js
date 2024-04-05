document.addEventListener('DOMContentLoaded', function() {
    const subSphereSelect = document.getElementById('subSphereSelect');
    const fetchSubSphereDetails = function() {
        const subSphereId = subSphereSelect.value;
        fetch(`/subSphere/${subSphereId}/details`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                document.getElementById('minKarmaToPost').value = data.minKarmaToPost;
                document.getElementById('allowImages').checked = data.allowImages;
                document.getElementById('allowVideos').checked = data.allowVideos;
                document.getElementById('allowTextPosts').checked = data.allowTextPosts;
                console.log('Automod configuration pre-filled with current SubSphere settings.');
            })
            .catch(error => {
                console.error('Error fetching SubSphere details:', error.message);
                console.error(error.stack);
            });
    };

    subSphereSelect.addEventListener('change', fetchSubSphereDetails);
    fetchSubSphereDetails(); // Call the function on page load to fetch and display the settings immediately
});