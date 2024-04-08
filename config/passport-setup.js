const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const uniqueUsernameGenerator = require('unique-username-generator');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    done(null, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/redirect"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const currentUser = await User.findOne({ email: profile.emails[0].value });
      if(currentUser){
        console.log('User is: ', currentUser);
        done(null, currentUser);
      } else {
        const randomPassword = crypto.randomBytes(16).toString('hex');
        const hashedPassword = await bcrypt.hash(randomPassword, 10);
        const generatedUsername = uniqueUsernameGenerator.generateFromEmail(profile.emails[0].value, 2, '');
        const newUser = await new User({
          username: generatedUsername,
          googleId: profile.id,
          email: profile.emails[0].value, // Use the primary email
          password: hashedPassword, // Use the hashed random password
          avatar: profile.photos[0].value
        }).save();
        console.log('New user created: ' + newUser);
        done(null, newUser);
      }
    } catch (error) {
      console.error('Error in Google Strategy:', error.message);
      console.error(error.stack);
      done(error, null);
    }
  }
));