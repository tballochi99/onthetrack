import mongoose from 'mongoose';
import validator from 'validator';

const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validator.isEmail, 'Invalid email']
  },
  password: {
    type: String,
    required: true,
    validate: [
        {
            validator: function(password) {
                return password.length >= 8 && 
                       /[A-Z]/.test(password) && 
                       /[!@#$%^&*(),.?":{}|<>]/.test(password);
            },
            message: 'The password must contain at least 8 characters, one capital letter and one special character.'
        }
    ]
},
  
  profilePicture: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  instagramUrl: {
    type: String,
    default: '',
    validate: [
      {
        validator: function(v) {
          return v === '' || validator.isURL(v);
        },
        message: 'Invalid Instagram URL'
      }
    ]
  },
  twitterUrl: {
    type: String,
    default: '',
    validate: [
      {
        validator: function(v) {
          return v === '' || validator.isURL(v);
        },
        message: 'Invalid Twitter URL'
      }
    ]
  },
  youtubeUrl: {
    type: String,
    default: '',
    validate: [
      {
        validator: function(v) {
          return v === '' || validator.isURL(v);
        },
        message: 'Invalid YouTube URL'
      }
    ]
  },
  collabEmail: {
    type: String,
    default: '',
    validate: {
      validator: function(v) {
        return v === '' || validator.isEmail(v);
      },
      message: 'Invalid email for collaboration'
    },
    required: false
  },
  licenses: {
    basic: {
      type: Number,
      default: 0,
      validate: [
        {
          validator: function(v) {
            return v >= 0;
          },
          message: 'Le prix de la licence basique ne peut pas être négatif'
        }
      ]
    },
    premium: {
      type: Number,
      default: 0,
      validate: [
        {
          validator: function(v) {
            return v >= 0;
          },
          message: 'Le prix de la licence premium ne peut pas être négatif'
        }
      ]
    },
    trackout: {
      type: Number,
      default: 0,
      validate: [
        {
          validator: function(v) {
            return v >= 0;
          },
          message: 'Le prix de la licence trackout ne peut pas être négatif'
        }
      ]
    },
    unlimited: {
      type: Number,
      default: 0,
      validate: [
        {
          validator: function(v) {
            return v >= 0;
          },
          message: 'Le prix de la licence illimitée ne peut pas être négatif'
        }
      ]
    },
    exclusive: {
      type: Number,
      default: 0,
      validate: [
        {
          validator: function(v) {
            return v >= 0;
          },
          message: 'Le prix de la licence exclusive ne peut pas être négatif'
        }
      ]
    }
  },
  role: {
    type: String,
    enum: ['free', 'pro'],
    default: 'free'
  },
  stripeCustomerId: String,
  subscriptionId: String,
  subscriptionStatus: {
    type: String,
    enum: ['none', 'active', 'cancelled'],
    default: 'none'
  }
});

export default mongoose.models.User || mongoose.model('User', userSchema);