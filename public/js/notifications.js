document.addEventListener('DOMContentLoaded', () => {
  const socket = io();
  checkUnreadNotifications();

  function highlightUnreadMessages(username) {
    if (window.location.pathname === '/messages') {
      const chatListItems = document.querySelectorAll('#chatList li');
      chatListItems.forEach(item => {
        if (item.textContent.includes(username)) {
          item.classList.add('bg-blue-100', 'dark:bg-gray-600', 'text-white');
        }
      });
    }
  }

  function handleNewMessageNotification(notification) {
    const usernameRegex = /You have a new message from (.+)/;
    const matches = notification.content.match(usernameRegex);
    if (matches && matches[1]) {
      highlightUnreadMessages(matches[1]);
    }
    const messagesLink = document.querySelector('a[href="/messages"]');
    messagesLink.classList.add('bg-green-100', 'dark:bg-green-800', 'dark:text-blue-300', 'text-white');
    messagesLink.dataset.messages = 'new';
  }

  socket.on('notification', (notification) => {
    console.log('New notification received:', notification);
    if (notification.type === 'newComment') {
      const notificationsLink = document.querySelector('a[href="/notifications"]');
      notificationsLink.classList.add('bg-green-100', 'dark:bg-green-800', 'dark:text-blue-300', 'text-white');
      notificationsLink.dataset.notifications = 'new';
    } else if (notification.type === 'newMessage') {
      handleNewMessageNotification(notification);
    }
  });

  function checkUnreadNotifications() {
    fetch('/notifications/all')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          const notificationsLink = document.querySelector('a[href="/notifications"]');
          const messagesLink = document.querySelector('a[href="/messages"]');
          let hasUnreadMessages = false;
          let hasOtherUnreadNotifications = false;

          data.notifications.forEach(notification => {
            if (notification.type === 'newMessage') {
              hasUnreadMessages = true;
              handleNewMessageNotification(notification);
            } else {
              hasOtherUnreadNotifications = true;
            }
          });

          if (hasUnreadMessages) {
            messagesLink.classList.add('bg-green-100', 'dark:bg-green-800', 'dark:text-blue-300', 'text-white');
            messagesLink.dataset.messages = 'new';
          } else if (hasOtherUnreadNotifications) {
            notificationsLink.classList.add('bg-green-100', 'dark:bg-green-800', 'dark:text-blue-300', 'text-white');
            notificationsLink.dataset.notifications = 'new';
          }
        }
      })
      .catch(error => {
        console.error('Error fetching unread notifications:', error.message);
        console.error(error.stack);
      });
  }
});