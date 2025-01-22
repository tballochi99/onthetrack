import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  sessionId: { 
    type: String, 
    required: true 
  },
  items: [{
    compositionId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Composition', 
      required: true 
    },
    title: String,
    artist: String,
    genre: String,
    licenseId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'License' 
    },
    licenseName: String,
    licensePrice: Number,
    coverImage: String
  }],
  totalAmount: { 
    type: Number, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true 
});

const Purchase = mongoose.models.Purchase || mongoose.model('Purchase', purchaseSchema);
export default Purchase;