document.addEventListener('DOMContentLoaded', () => {
  const socket = io();
  checkUnreadNotifications();

  socket.on('notification', (notification) => {
    console.log('New notification received:', notification);
    if (notification.type === 'newComment') {
      const notificationsLink = document.querySelector('a[href="/notifications"]');
      notificationsLink.classList.add('highlight');
      notificationsLink.dataset.notifications = 'new';
    } else if (notification.type === 'newMessage') {
      const messagesLink = document.querySelector('a[href="/messages"]');
      messagesLink.classList.add('highlight');
      messagesLink.dataset.messages = 'new';
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
            } else {
              hasOtherUnreadNotifications = true;
            }
          });

          if (hasUnreadMessages) {
            messagesLink.classList.add('highlight');
            messagesLink.dataset.messages = 'new';
          } else if (hasOtherUnreadNotifications) {
            notificationsLink.classList.add('highlight');
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