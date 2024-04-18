document.addEventListener('DOMContentLoaded', () => {
  const tabContents = document.querySelectorAll('.tabcontent');
  const tabs = document.querySelectorAll('.tablinks');

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', function() {
      // Hide all tab contents
      tabContents.forEach(tc => {
        tc.style.display = 'none';
      });

      // Remove 'active' class from all tabs
      tabs.forEach(innerTab => {
        innerTab.classList.remove('active');
        // Ensure dark mode compatibility
        innerTab.classList.remove('dark:bg-blue-700', 'dark:text-white');
        innerTab.classList.add('bg-gray-200', 'text-gray-600', 'dark:bg-gray-600', 'dark:text-gray-400', 'hover:bg-gray-300', 'dark:hover:bg-gray-500');
      });

      // Show the current tab content and add 'active' class to the current tab
      tabContents[index].style.display = 'block';
      this.classList.add('active');
      // Apply dark mode compatible classes
      this.classList.remove('bg-gray-200', 'text-gray-600', 'dark:bg-gray-600', 'dark:text-gray-400', 'hover:bg-gray-300', 'dark:hover:bg-gray-500');
      this.classList.add('dark:bg-blue-700', 'dark:text-white');
      console.log(`Tab activated: ${this.textContent.trim()}`);
    });
  });

  // Automatically click the first tab to show its content by default
  if (tabs.length > 0) {
    tabs[0].click();
  }
});