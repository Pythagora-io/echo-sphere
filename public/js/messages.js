const socket = io(); // Assuming you've already included the Socket.io client-side library in your HTML

// Function to send message
function sendMessage(chatId, message) {
  const senderId = document.getElementById('userId').value; // Assuming there's an input or hidden field with the user's ID
  socket.emit('sendMessage', { chatId, senderId, message });
  console.log(`Message sent from ${senderId} in chat ${chatId}: ${message}`);
  // Do not immediately display the message on the sender's UI
}

socket.on('receiveMessage', ({ chatId, senderId, message }) => {
  console.log(`Message received in chat ${chatId} from ${senderId}: ${message}`);
  // Display the message on the UI for both sender and receiver with correct styling
  const className = senderId === document.getElementById('userId').value ? 'message-item-sent bg-blue-100 float-right clear-right text-right mr-2 p-2 rounded-lg' : 'message-item-received bg-gray-200 float-left clear-left text-left ml-2 p-2 rounded-lg';
  displayMessage(message, className.split(' '));
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

// Function to display a message in the UI
function displayMessage(message, className) {
  const messageContainer = document.getElementById('messages');
  const messageElement = document.createElement('div');
  messageElement.classList.add('message-item', ...className);
  messageElement.innerHTML = `<p>${message}</p>`;
  // Ensure new messages are appended at the bottom of the message container
  messageContainer.appendChild(messageElement);
  // Automatically scroll to the bottom of the message container to show the latest message
  messageContainer.scrollTop = messageContainer.scrollHeight;
}