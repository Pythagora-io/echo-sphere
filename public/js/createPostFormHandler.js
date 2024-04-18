const subSphereSelect = document.getElementById('subSphereSelect');
const postTypeSelect = document.getElementById('postType');
const contentField = document.getElementById('contentField');
const theme = document.body.classList.contains('dark') ? 'dark' : 'light';

function updatePostTypeOptions(subSphereSettings) {
    postTypeSelect.innerHTML = '';
    if (subSphereSettings.allowTextPosts) {
        postTypeSelect.innerHTML += '<option value="text">Text</option>';
    }
    postTypeSelect.innerHTML += '<option value="link">Link</option>';
    if (subSphereSettings.allowImages) {
        postTypeSelect.innerHTML += '<option value="image">Image</option>';
    }
    if (subSphereSettings.allowVideos) {
        postTypeSelect.innerHTML += '<option value="video">Video</option>';
    }
    updateContentField(postTypeSelect.value);
}

function updateContentField(selectedType) {
    contentField.innerHTML = '';
    if (selectedType === 'text' || selectedType === 'link') {
        contentField.innerHTML = '<label for="content" class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Content</label><textarea name="content" required class="' + (theme === 'dark' ? 'shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 bg-gray-700 border-gray-600 leading-tight focus:outline-none focus:shadow-outline' : 'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline') + '"></textarea>';
    } else if (selectedType === 'image' || selectedType === 'video') {
        contentField.innerHTML = '<label for="content" class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">' + (selectedType === 'image' ? 'Image' : 'Video') + '</label><input type="file" name="content" accept="' + (selectedType === 'image' ? 'image/*' : 'video/*') + '" required class="' + (theme === 'dark' ? 'shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 bg-gray-700 border-gray-600 leading-tight focus:outline-none focus:shadow-outline' : 'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline') + '">';
    }
}

subSphereSelect.addEventListener('change', function() {
    const subSphereId = this.value;
    fetch(`/subSphere/${subSphereId}/details`)
        .then(response => response.json())
        .then(data => {
            console.log('SubSphere settings fetched successfully:', data);
            updatePostTypeOptions(data);
        })
        .catch(error => {
            console.error('Error fetching SubSphere settings:', error);
            console.error(error.stack);
        });
});

document.getElementById('postType').addEventListener('change', function() {
    updateContentField(this.value);
});

// Trigger the change event on page load to initialize the form with the correct options
window.onload = function() {
    subSphereSelect.dispatchEvent(new Event('change'));
};