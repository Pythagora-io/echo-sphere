const socket = io(); // Assuming you've already included the Socket.io client-side library in your HTML

// Function to send message
function sendMessage(chatId, message) {
  const senderId = document.getElementById('userId').value; // Assuming there's an input or hidden field with the user's ID
  socket.emit('sendMessage', { chatId, senderId, message });
  console.log(`Message sent from ${senderId} in chat ${chatId}: ${message}`);
  // Immediately display the message on the sender's UI
  displayMessage(message, 'message-item-sent');
}

socket.on('receiveMessage', ({ chatId, senderId, message }) => {
  console.log(`Message received in chat ${chatId} from ${senderId}: ${message}`);
  // Display the message on the UI
  displayMessage(message, senderId === document.getElementById('userId').value ? 'message-item-sent' : 'message-item-received');
});

// Log connection status
socket.on('connect', () => {
  console.log('Connected to WebSocket server.');
  // Register the current user with their chat IDs
  const chatIds = document.querySelectorAll('.chatId');
  chatIds.forEach(chatIdElement => {
    const chatId = chatIdElement.value;
    socket.emit('joinChat', chatId);
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

// Function to display a message in the UI
function displayMessage(message, className) {
  const messageContainer = document.getElementById('messages');
  const messageElement = document.createElement('div');
  messageElement.classList.add('message-item', className);
  messageElement.innerHTML = `<p>${message}</p>`;
  messageContainer.appendChild(messageElement);
  messageContainer.scrollTop = messageContainer.scrollHeight;
}