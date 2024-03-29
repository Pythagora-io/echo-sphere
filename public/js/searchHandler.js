// This file is intended to handle search-related functionalities in the New_EchoSphere app.

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
});