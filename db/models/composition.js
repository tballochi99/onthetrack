import mongoose from 'mongoose';

const predefinedGenres = [
  'Rap', 'RnB', 'Pop', 'Hip Hop', 'Cloud', 'PluggnB', 'UK Drill', 'NY Drill',
  'Phonk', 'Hyperpop', 'Sad', 'Emo', 'Jazz Rap', 'Lofi', 'Memphis', 'Sexy Drill',
  'Avant-Garde', 'Rage', 'Trap Metal', 'Experimental', 'Horrorcore', 
  'Vaportrap', 'Mumble', 'Boom Bap Revival', 'Alternative Trap', 'Glitch Hop', 
  'SuperTrap', 'West Coast Revival', 'Dirty South Revival', 'SoundCloud Rap', 
  'New Jazz', 'Mainstream'
];


const predefinedKeys = [
  'C Major', 'C# Major', 'D Major', 'D# Major', 'E Major', 'F Major',
  'F# Major', 'G Major', 'G# Major', 'A Major', 'A# Major', 'B Major',
  'C Minor', 'C# Minor', 'D Minor', 'D# Minor', 'E Minor', 'F Minor',
  'F# Minor', 'G Minor', 'G# Minor', 'A Minor', 'A# Minor', 'B Minor'
];

const licenseSchema = new mongoose.Schema({
  licenseId: { type: String, required: true },
  price: {
    type: Number,
    required: true,
    min: 0
  }
});

const compositionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
    enum: predefinedGenres,
    required: false,
  },
  bpm: {
    type: Number,
    required: true,
    min: 1,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value for BPM'
    }
  },
  key: {
    type: String,
    enum: predefinedKeys,
    required: false,
  },
  tags: {
    type: [String],
    required: false,
    validate: [arrayLimit, '{PATH} exceeds the limit of 3']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  file: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /\.(mp3|wav|ogg|flac)$/i.test(v);
      },
      message: props => `${props.value} is not a valid audio file format`
    }
  },
  coverImage: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /\.(jpg|jpeg|png|gif)$/i.test(v);
      },
      message: props => `${props.value} is not a valid image file format`
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  licenses: [licenseSchema],
  listens: [{
    type: Date,
    default: Date.now
  }],
}, { timestamps: true });

function arrayLimit(val) {
  return val.length <= 3;
}

const Composition = mongoose.models.Composition || mongoose.model('Composition', compositionSchema);

export default Composition;