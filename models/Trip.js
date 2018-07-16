const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const tripSchema = new Schema({
  creator: {type: Schema.Types.ObjectId, ref: 'User'},
  title: String,
  destination: String,
  price: Number,

  description: String,
  maxTravelers: Number,
  status: Boolean,

  startDate: Date,
  endDate: Date,
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

const Trip = mongoose.model('Trip', tripSchema);
module.exports = Trip;
