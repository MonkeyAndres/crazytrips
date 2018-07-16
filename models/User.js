const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const userSchema = new Schema({
  username: {type:String,unique:true},
  password: String,
  email: {type:String,unique:true},

  name: String,
  surname: String,
  age: Number,
  sex: { type: String, enum: ['male','female'] },  
  telephone:Number,
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
