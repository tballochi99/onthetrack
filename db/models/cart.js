import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      compositionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Composition', required: true },
      title: String,
      artist: String,
      genre: String,
      bpm: Number,
      key: String,
      description: String,
      tags: [String],
      price: Number,
      file: String,
      coverImage: String,
      quantity: { type: Number, default: 1 },
      licenseId: { type: mongoose.Schema.Types.ObjectId, ref: 'License' },
      licenseName: String,
      licensePrice: Number
    }
  ]
});

const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);
export default Cart;