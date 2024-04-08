const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true, match: [/.+\@.+\..+/, 'Please fill a valid email address'] },
  password: { type: String, required: true },
  avatar: String,
  bio: String,
  settings: {
    darkMode: { type: Boolean, default: false },
    notifications: { type: Boolean, default: true },
  },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  karma: { type: Number, default: 1 }, // Added karma field with default value of 1
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

userSchema.pre('save', function(next) {
  const user = this;
  if (!user.isModified('password')) return next();
  bcrypt.hash(user.password, 10, (err, hash) => {
    if (err) {
      console.error('Error hashing password:', err);
      console.error(err.stack);
      return next(err);
    }
    user.password = hash;
    next();
  });
});

userSchema.methods.generatePasswordReset = function() {
  this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordExpires = Date.now() + 3600000; //expires in an hour
};

const User = mongoose.model('User', userSchema);

module.exports = User;