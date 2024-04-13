// userListHandler.js

// Function to fetch the list of chats for messaging purposes
function getChats() {
  fetch('/user/chats') // Fetching chats instead of recipients
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }
      return response.json();
    })
    .then(data => {
      const chatListElement = document.getElementById('chatList'); // Assuming there's an element with id 'chatList' for displaying chats
      chatListElement.innerHTML = ''; // Clear existing list
      data.chats.forEach(chat => {
        const chatElement = document.createElement('li');
        chatElement.textContent = chat.participants.map(participant => participant.username).join(', '); // Displaying participant usernames
        chatElement.className = 'p-2 bg-gray-300 dark:bg-gray-600 mb-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500 cursor-pointer';
        chatElement.onclick = () => {
          // Assuming selectChat is a function that handles chat selection from the list
          selectChat(chat.chatId); // Using chatId to select chat
        };
        chatListElement.appendChild(chatElement);
      });
      console.log('Chat list successfully populated');
    })
    .catch(error => {
      console.error('Error fetching chats:', error.message);
      console.error(error.stack);
    });
}

// Call getChats to populate the chat list on page load
document.addEventListener('DOMContentLoaded', getChats);

// Function to start a new chat with a recipient
function startNewChat(recipientId) {
  fetch('/messages/start', { // Adjusted to use a dedicated route for starting a new chat
    method: 'POST', // Using POST as we're potentially creating a new chat
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ recipientId: recipientId }) // Sending recipientId in the request body
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to start or fetch chat');
    }
    return response.json();
  })
  .then(data => {
    if (data.success && data.chatId) {
      window.location.href = `/messages?chatId=${data.chatId}`; // Redirecting to the chat page with the new or existing chatId
    } else {
      console.error('Failed to start or fetch chat:', data.message);
    }
  })
  .catch(error => {
    console.error('Error starting or fetching chat:', error.message);
    console.error(error.stack);
  });
}

// Assuming there's a button in the UI for starting a new chat with a recipientId passed as a query parameter
const startChatButton = document.getElementById('startNewChatButton'); // Corrected the ID of the 'Start new chat' button in the UI
if (startChatButton) {
  startChatButton.addEventListener('click', () => {
    const recipientId = startChatButton.getAttribute('data-recipient-id'); // Assuming the recipientId is stored as a data attribute on the button
    if (recipientId) {
      startNewChat(recipientId);
    } else {
      console.error('Recipient ID is missing.');
    }
  });
}