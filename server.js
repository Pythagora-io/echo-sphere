// Load environment variables
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require('./routes/profileRoutes'); // Added profile routes
const subSphereRoutes = require('./routes/subSphereRoutes'); // Added SubSphere routes
const postRoutes = require('./routes/postRoutes'); // Added post routes
const commentRoutes = require('./routes/commentRoutes'); // Added comment routes
const voteRoutes = require('./routes/voteRoutes'); // Added vote routes
const userRoutes = require('./routes/userRoutes'); // Added user routes
const messageRoutes = require('./routes/messageRoutes'); // Added message routes
const notificationRoutes = require('./routes/notificationRoutes'); // Added notification routes
const multer = require('multer'); // For handling multipart/form-data
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Server } = require("socket.io");
const Message = require('./models/Message'); // Import the Message model
const Chat = require('./models/Chat'); // Import the Chat model
const Notification = require('./models/Notification'); // Import the Notification model

if (!process.env.DATABASE_URL || !process.env.SESSION_SECRET) {
  console.error("Error: config environment variables not set. Please create/edit .env configuration file.");
  process.exit(-1);
}

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Setting the templating engine to EJS
app.set("view engine", "ejs");

// Serve static files
app.use(express.static("public"));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Database connection
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error(`Database connection error: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  });

// Session configuration with connect-mongo
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE_URL }),
  });

app.use(sessionMiddleware);

// Socket.io setup
const server = http.createServer(app);
const io = new Server(server);
app.set('socketio', io); // Make io available in routes

io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

io.on('connection', (socket) => {
  console.log('a user connected');
  if (socket.request.session && socket.request.session.userId) {
    const userId = socket.request.session.userId;
    socket.join(userId.toString());
    console.log(`User ${userId} joined room: ${userId}`);
  } else {
    console.error("Session or userId not found for socket connection.");
  }

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('joinChat', (chatId) => {
    console.log(`User joined chat: ${chatId}`);
    socket.join(chatId);
  });

  socket.on('sendMessage', ({chatId, senderId, message}) => {
    Chat.findOne({ chatId: chatId }).then(chat => {
      if (!chat) {
        console.error(`Chat not found for chatId: ${chatId}`);
        // Emitting an error message back to the client
        io.to(socket.id).emit('error', 'Chat not found');
        return;
      }
      const newMessage = new Message({
        sender: senderId,
        content: message,
        chat: chat._id
      });
      newMessage.save().then(() => {
        io.to(chatId).emit('receiveMessage', {senderId, message, chatId}); // Emitting to a room named after the chatId, including chatId in the emitted data
        console.log(`Message saved and sent from ${senderId} to chat ${chatId}: ${message}`);
        // Emit notification to recipient's room
        chat.participants.forEach(participant => {
          if (participant.toString() !== senderId) {
            io.to(participant.toString()).emit('notification', {type: 'newMessage', content: 'You have a new message', chatId: chatId});
          }
        });
      }).catch(error => {
        console.error(`Error saving message: ${error.message}`);
        console.error(error.stack);
      });
    }).catch(error => {
      console.error(`Error finding chat: ${error.message}`);
      console.error(error.stack);
    });
  });
});

app.on("error", (error) => {
  console.error(`Server error: ${error.message}`);
  console.error(error.stack);
});

// Logging session creation and destruction
app.use((req, res, next) => {
  const sess = req.session;
  // Make session available to all views
  res.locals.session = sess;
  if (!sess.views) {
    sess.views = 1;
    console.log("Session created at: ", new Date().toISOString());
  } else {
    sess.views++;
    console.log(
      `Session accessed again at: ${new Date().toISOString()}, Views: ${sess.views}, User ID: ${sess.userId || '(unauthenticated)'}`,
    );
  }
  next();
});

// Authentication Routes
app.use(authRoutes);

// Profile Routes
app.use(profileRoutes); // Use the profile routes

// SubSphere Routes
app.use(subSphereRoutes); // Use the SubSphere routes

// Post Routes
app.use(postRoutes); // Use the post routes

// Comment Routes
app.use(commentRoutes); // Use the comment routes

// Vote Routes
app.use(voteRoutes); // Use the vote routes

// User Routes
app.use(userRoutes); // Use the user routes

// Message Routes
app.use('/messages', messageRoutes); // Use the message routes with '/messages' prefix

// Notification Routes
app.use('/notifications', notificationRoutes); // Use the notification routes

// Root path response
app.get("/", (req, res) => {
  if (req.session && req.session.userId) {
    res.redirect('/users/' + req.session.userId);
  } else {
    res.render("index");
  }
});

// If no routes handled the request, it's a 404
app.use((req, res, next) => {
  res.status(404).send("Page not found.");
});

// Error handling
app.use((err, req, res, next) => {
  console.error(`Unhandled application error: ${err.message}`);
  console.error(err.stack);
  res.status(500).send("There was an error serving your request.");
});

// Replace app.listen with server.listen to integrate Socket.io
server.listen(port, () => {
  console.log(`Server running with Socket.io at http://localhost:${port}`);
});