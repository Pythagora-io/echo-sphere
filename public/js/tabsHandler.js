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
        innerTab.className = innerTab.className.replace(' active', '');
      });

      // Show the current tab content and add 'active' class to the current tab
      tabContents[index].style.display = 'block';
      this.className += ' active';
      console.log(`Tab activated: ${this.textContent.trim()}`);
    });
  });

  // Automatically click the first tab to show its content by default
  if (tabs.length > 0) {
    tabs[0].click();
  }
});