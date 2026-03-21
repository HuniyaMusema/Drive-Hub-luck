const mongoose = require('mongoose');

const carSchema = new mongoose.Schema(
  {
    make: {
      type: String,
      required: [true, 'Please add a car make'],
    },
    model: {
      type: String,
      required: [true, 'Please add a car model'],
    },
    year: {
      type: Number,
      required: [true, 'Please add a production year'],
    },
    price: {
      type: Number,
      required: [true, 'Please add price or rental rate'],
    },
    type: {
      type: String,
      enum: ['SALE', 'RENT'],
      required: [true, 'Please specify if the car is for SALE or RENT'],
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'SOLD', 'RENTED', 'MAINTENANCE'],
      default: 'AVAILABLE',
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    contactPhone: {
      type: String,
      required: [true, 'Please provide a contact phone number for the meeting'],
    },
    location: {
      type: String,
      required: [true, 'Please provide the physical location for the transaction'],
    },
    // Optional additional details
    description: {
      type: String,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Car', carSchema);
