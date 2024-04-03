const mongoose = require('mongoose');

const subSphereSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Added subscribers list
  flares: [{ type: String }],
  settings: {
    allowImages: { type: Boolean, default: true },
    allowVideos: { type: Boolean, default: true },
    allowTextPosts: { type: Boolean, default: true },
    minKarmaToPost: { type: Number, default: 0 } // Added for automod configuration based on user karma
  },
  lockedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  stickyPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  bannedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Added bannedUsers list
}, { timestamps: true });

subSphereSchema.index({ name: 'text', description: 'text' }); // Added text index for search functionality

subSphereSchema.pre('save', function(next) {
  console.log(`Saving SubSphere: ${this.name}`);
  next();
});

subSphereSchema.post('save', function(doc, next) {
  console.log(`SubSphere saved: ${doc.name}`);
  next();
});

subSphereSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('SubSphere name must be unique'));
  } else {
    console.error(`Error saving SubSphere: ${error.message}`);
    console.error(error.stack);
    next(error);
  }
});

const SubSphere = mongoose.model('SubSphere', subSphereSchema);

module.exports = SubSphere;