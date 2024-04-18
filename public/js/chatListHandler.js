// chatListHandler.js

document.addEventListener('DOMContentLoaded', () => {
  fetchChats();
});

function fetchChats() {
  fetch('/messages/chats/all') // Updated endpoint to fetch chats
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const chatListElement = document.getElementById('chatList');
        chatListElement.innerHTML = ''; // Clear existing list
        data.chats.forEach(chat => {
          const listItem = document.createElement('li');
          listItem.textContent = chat.participants.filter(participant => participant._id !== document.getElementById('userId').value).map(participant => participant.username).join(', '); // Displaying only the recipient's username, excluding the current user
          listItem.className = 'p-2 bg-gray-200 dark:bg-gray-800 mb-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer text-gray-900 dark:text-white'; // Adjusted contrast for dark theme and text color for better readability
          listItem.setAttribute('data-chat-id', chat.chatId); // Use data attribute to store chatId
          listItem.onclick = () => selectChat(chat.chatId); // Adjusted to use chatId for chat selection
          chatListElement.appendChild(listItem);
        });
        console.log('Chat list successfully populated');
      } else {
        console.error('Failed to fetch chats');
      }
    })
    .catch(error => {
      console.error('Error fetching chats:', error.message);
      console.error(error.stack);
    });
}

function selectChat(chatId) {
  console.log(`Chat ${chatId} selected`);
  const messagesUrl = '/messages/' + chatId; // Corrected URL to fetch messages for the selected chat
  fetch(messagesUrl)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        displayMessages(data.messages, chatId);
        document.getElementById('chatId').value = chatId; // Update the hidden input element 'chatId' with the selected chat's ID
        // Highlight the selected chat list item
        document.querySelectorAll('#chatList li').forEach(item => {
          item.classList.remove('bg-gray-200', 'dark:bg-gray-800');
          item.classList.add('bg-gray-200', 'dark:bg-gray-600');
        });
        const selectedListItem = document.querySelector(`[data-chat-id="${chatId}"]`);
        if (selectedListItem) {
          selectedListItem.classList.remove('bg-gray-200', 'dark:bg-gray-600');
          selectedListItem.classList.add('bg-blue-500', 'dark:bg-blue-800'); // Adjusted contrast for dark theme
          // Make an AJAX call to mark notifications as read before removing the 'unread-message' class
          const username = selectedListItem.textContent.trim().split(', ')[0]; // Assuming the first name in the list item is the username
          fetch('/notifications/markAllMessagesAsRead', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: username })
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              console.log(`All messages from ${username} marked as read.`);
            } else {
              console.error('Failed to mark messages as read');
            }
          })
          .catch(error => {
            console.error('Error marking messages as read:', error.message);
            console.error(error.stack);
          });
        }
      } else {
        console.error('Failed to fetch messages for selected chat');
      }
    })
    .catch(error => {
      console.error('Error fetching messages for selected chat:', error.message);
      console.error(error.stack);
    });
}

function displayMessages(messages, chatId) {
  const messagesContainer = document.getElementById('messages');
  messagesContainer.innerHTML = ''; // Clear existing messages
  messages.forEach(message => {
    const messageElement = document.createElement('div');
    messageElement.className = 'flex flex-col mb-4 ' + (message.sender._id === document.getElementById('userId').value ? 'items-end' : 'items-start'); // Apply flex and margin classes for consistent styling
    const messageContent = document.createElement('div');
    messageContent.className = (message.sender._id === document.getElementById('userId').value ? 'bg-blue-500 text-white dark:bg-blue-800 dark:text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-200') + ' rounded-lg p-2'; // Adjusted contrast for light theme and maintained contrast for dark theme
    messageContent.innerText = message.content;
    messageElement.appendChild(messageContent);
    messagesContainer.appendChild(messageElement);
  });
  console.log('Messages displayed for selected chat');
  messagesContainer.scrollTop = messagesContainer.scrollHeight; // Automatically scroll to the bottom of the messages container
}