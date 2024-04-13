document.addEventListener('DOMContentLoaded', () => {
  // Attach event listener to the search form submission
  const searchForm = document.querySelector('form[action="/search"]');
  if (searchForm) {
    searchForm.addEventListener('submit', function(event) {
      console.log('Search form submitted with term:', document.getElementById('searchTerm').value);
    });
  } else {
    console.error('Search form not found on the page.');
  }

  // Event listener for the Trending button
  document.getElementById('trendingButton').addEventListener('click', function(event) {
    event.preventDefault();
    fetch('/search/trending')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log('Trending posts fetched successfully');
          const mainPanel = document.getElementById('mainPanel');
          mainPanel.innerHTML = '<h1 class="text-4xl font-bold mb-6 dark:text-white">Trending Posts</h1>';
          if (data.posts.length > 0) {
            data.posts.forEach(post => {
              const postElement = document.createElement('a');
              postElement.href = `/posts/${post._id}`;
              postElement.className = 'block';
              postElement.innerHTML = `
                <div class="bg-white dark:bg-gray-700 shadow-md rounded px-8 pt-6 pb-8 mb-4">
                  <p class="text-blue-500 hover:text-blue-700 font-bold dark:hover:text-blue-400">${post.content}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">By ${post.author.username} on ${new Date(post.createdAt).toLocaleString()}</p>
                  <p>Total Votes: ${post.upvotes - post.downvotes}</p>
                </div>
              `;
              mainPanel.appendChild(postElement);
            });
          } else {
            mainPanel.innerHTML += '<p class="text-lg dark:text-white">Explore new topics and engage with the community to discover trending content!</p>';
          }
        } else {
          console.error('Failed to fetch trending posts');
        }
      })
      .catch(error => {
        console.error('Error fetching trending posts:', error.message);
        console.error(error.stack);
      });
  });

  // Event listener for the Recommendations button
  document.getElementById('recommendationsButton').addEventListener('click', function(event) {
    event.preventDefault();
    fetch('/search/recommendations')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log('Recommendations fetched successfully');
          const mainPanel = document.getElementById('mainPanel');
          mainPanel.innerHTML = '<h1 class="text-4xl font-bold mb-6 dark:text-white">Recommended SubSpheres</h1>';
          if (data.subSpheres.length > 0) {
            data.subSpheres.forEach(subSphere => {
              const subSphereElement = document.createElement('a');
              subSphereElement.href = `/subSphere/${subSphere._id}/posts`;
              subSphereElement.className = 'block';
              subSphereElement.innerHTML = `
                <div class="bg-white dark:bg-gray-700 shadow-md rounded px-8 pt-6 pb-8 mb-4">
                  <p class="text-blue-500 hover:text-blue-700 font-bold dark:hover:text-blue-400">${subSphere.name}: ${subSphere.description}</p>
                  <p>Subscribers: ${subSphere.subscribers ? subSphere.subscribers.length : 'N/A'}</p>
                </div>
              `;
              mainPanel.appendChild(subSphereElement);
            });
          } else {
            mainPanel.innerHTML += '<p class="text-lg dark:text-white">Keep exploring and engaging with different SubSpheres to receive personalized recommendations!</p>';
          }
        } else {
          console.error('Failed to fetch recommendations');
        }
      })
      .catch(error => {
        console.error('Error fetching recommendations:', error.message);
        console.error(error.stack);
      });
  });
});