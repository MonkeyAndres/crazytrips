const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const userSchema = new Schema({
  username: String,
  password: String,
  email: String,

  name: String,
  surname: String,
  age: Number,
  sex: Boolean,

  profilePic: String,
  bio: String,
  rp: [{type: Schema.Types.ObjectId, ref: 'User'}],

  socialLinks: {
    facebook: String,
    instagram: String,
    twitter: String
  },


}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
