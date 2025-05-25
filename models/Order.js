import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fullName: { type: String, required: true },
  products: [
    {
      id: String,
      name: String,
      price: Number,
      quantity: Number,
      img: String,
    },
  ],
  total: {
    type: Number,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Order', OrderSchema);
