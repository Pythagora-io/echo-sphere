const socket = io(); // Assuming you've already included the Socket.io client-side library in your HTML

// Function to send message
function sendMessage(chatId, message) {
  const senderId = document.getElementById('userId').value; // Assuming there's an input or hidden field with the user's ID
  socket.emit('sendMessage', { chatId, senderId, message });
  console.log(`Message sent from ${senderId} in chat ${chatId}: ${message}`);
}

socket.on('receiveMessage', ({ chatId, senderId, message }) => {
  console.log(`Message received in chat ${chatId} from ${senderId}: ${message}`);
  // Display the message on the UI for both sender and receiver with correct styling
  const userId = document.getElementById('userId').value;
  const currentChatId = document.getElementById('chatId').value; // Retrieve the current chatId from the hidden input field
  if (chatId === currentChatId) { // Check if the received message belongs to the selected chat
    const messageContainer = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('flex', 'flex-col', 'mb-4');
    if (senderId === userId) {
      messageElement.classList.add('items-end');
      messageElement.innerHTML = `<div class="bg-blue-100 float-right clear-right text-right mr-2 p-2 rounded-lg">${message}</div>`;
    } else {
      messageElement.classList.add('items-start');
      messageElement.innerHTML = `<div class="bg-gray-200 float-left clear-left text-left ml-2 p-2 rounded-lg">${message}</div>`;
    }
    messageContainer.appendChild(messageElement);
    // Automatically scroll to the bottom of the message container to show the latest message
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }
});

// Log connection status
socket.on('connect', () => {
  console.log('Connected to WebSocket server.');
  fetch('/messages/chats/all')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        data.chats.forEach(chat => {
          socket.emit('joinChat', chat.chatId);
        });
      }
    })
    .catch(error => {
      console.error('WebSocket connection error:', error.message);
      console.error(error.stack);
    });
});

socket.on('disconnect', () => {
  console.log('Disconnected from WebSocket server.');
});

// Handle connection errors
socket.on('connect_error', (error) => {
  console.error('WebSocket connection error:', error.message);
  console.error(error.stack);
});

document.getElementById('sendMessageForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const messageInput = document.getElementById('messageInput');
  const message = messageInput.value;
  const chatId = document.getElementById('chatId').value; // Assuming there's an input or hidden field with the chatId
  if (message.trim()) {
    sendMessage(chatId, message);
    messageInput.value = ''; // Clear input after sending
  } else {
    console.log('Message is empty. Not sending.');
  }
});