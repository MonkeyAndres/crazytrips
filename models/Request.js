const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const requestSchema = new Schema({
  trip: {type: Schema.Types.ObjectId, ref: 'Trip'},
  user: {type: Schema.Types.ObjectId, ref: 'User'},
  status: {type: String, enum: ['Accepted', 'Declined', 'Pending'], default: "Pending"},

  message: String,
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

const Request = mongoose.model("Request", requestSchema);
module.exports = Request;
