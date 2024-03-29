document.addEventListener('DOMContentLoaded', () => {
  function openTab(evt, tabName) {
    const tabContents = document.querySelectorAll('.tabcontent');
    const tabs = document.querySelectorAll('.tablinks');

    tabContents.forEach(tc => {
      if (tc) tc.style.display = 'none';
    });

    tabs.forEach(tab => {
      if (tab) tab.className = tab.className.replace(' active', '');
    });

    const activeTabContent = document.getElementById(tabName);
    if (activeTabContent) activeTabContent.style.display = 'block';
    evt.currentTarget.className += ' active';
    console.log(`Tab ${tabName} activated.`);
  }

  // Bind the openTab function to tab buttons using data attributes
  const tabButtons = document.querySelectorAll('.tablinks');
  tabButtons.forEach(button => {
    button.addEventListener('click', function(event) {
      const tabName = this.getAttribute('data-tab');
      openTab(event, tabName);
    });
  });

  // Automatically click the first tab to show its content by default
  if (tabButtons.length > 0) {
    tabButtons[0].click();
  }
});