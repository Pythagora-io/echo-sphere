document.addEventListener('DOMContentLoaded', function() {
  const ctx = document.getElementById('moderationChart').getContext('2d');
  const moderationChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Posts', 'Comments', 'Bans'],
      datasets: [{
        label: '# of Actions',
        data: [], // Data will be dynamically updated based on the selected SubSphere
        backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  console.log('Moderation dashboard chart initialized.');

  // Fetch and display moderation logs
  const initialSubSphereId = document.getElementById('subSphereSelect').value;
  fetchModerationLogs(initialSubSphereId);

  // Event listener for the SubSphere selection dropdown
  document.getElementById('subSphereSelect').addEventListener('change', function() {
    const subSphereId = this.value;
    fetchModerationLogs(subSphereId);
    updateChartData(subSphereId);
  });

  // Immediately update chart data based on the initial selection
  if (initialSubSphereId) {
    updateChartData(initialSubSphereId);
  }

  // Function to update chart data based on the selected SubSphere
  function updateChartData(subSphereId) {
    fetch(`/moderation/stats?subSphereId=${subSphereId}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          moderationChart.data.datasets[0].data = [data.stats.postsCount, data.stats.commentsCount, data.stats.bannedUsersCount];
          moderationChart.update();
          console.log('Chart data updated successfully.');
        } else {
          console.error('Failed to update chart data:', data.message);
        }
      })
      .catch(error => {
        console.error('Error updating chart data:', error.message);
        console.error(error.stack);
      });
  }

  // Function to fetch moderation logs
  function fetchModerationLogs(subSphereId = '') {
    fetch(`/moderation/logs?subSphereId=${subSphereId}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log('Moderation logs fetched successfully.');
          const logsList = document.getElementById('moderationLogsList');
          logsList.innerHTML = ''; // Clear existing logs
          if (data.logs.length === 0) {
            logsList.innerHTML = '<div class="text-center py-5"><p class="text-sm text-gray-500 dark:text-gray-400">No moderation logs found. Your SubSphere is running smoothly!</p></div>';
          } else {
            data.logs.forEach(log => {
              const logItem = document.createElement('div');
              logItem.classList.add('mb-2', 'p-2', 'bg-gray-100', 'dark:bg-gray-800', 'rounded', 'shadow', 'dark:text-gray-300');
              logItem.innerHTML = `<div class="font-bold text-lg text-gray-900 dark:text-gray-300">${new Date(log.timestamp).toLocaleString()}</div><div>Target: <span class="font-semibold text-gray-900 dark:text-gray-300">${log.target}</span></div><div>Action: <span class="font-semibold text-gray-900 dark:text-gray-300">${log.action}</span></div><div>Target ID: <span class="font-semibold text-gray-900 dark:text-gray-300">${log.targetId}</span></div>`;
              logsList.appendChild(logItem);
            });
          }
        } else {
          console.error('Failed to fetch moderation logs:', data.message);
        }
      })
      .catch(error => {
        console.error('Error fetching moderation logs:', error.message);
        console.error(error.stack);
      });
  }

  // Function to ban a user
  function banUser() {
    const banUserId = document.getElementById('banUserId').value;
    const subSphereId = document.getElementById('subSphereSelect').value;
    const errorMessageElement = document.getElementById('banUserError');
    const successMessageElement = document.getElementById('banUserSuccess');

    // Clear previous messages
    errorMessageElement.textContent = '';
    successMessageElement.textContent = '';

    if (!banUserId) {
      errorMessageElement.textContent = 'Error: User ID for banning is empty.';
      errorMessageElement.classList.remove('hidden');
      return;
    }

    fetch(`/moderation/banUser/${banUserId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subSphereId }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log('User banned successfully.');
        successMessageElement.textContent = 'User banned successfully.';
        successMessageElement.classList.remove('hidden');
        // Optionally clear the input field
        document.getElementById('banUserId').value = '';
      } else {
        errorMessageElement.textContent = 'Failed to ban user: ' + data.message;
        errorMessageElement.classList.remove('hidden');
      }
    })
    .catch(error => {
      console.error('Error banning user:', error.message);
      errorMessageElement.textContent = 'Error banning user: ' + error.message;
      errorMessageElement.classList.remove('hidden');
    });
  }

  // Attach the banUser function to the Ban User button
  document.getElementById('banUserButton').addEventListener('click', banUser);
});