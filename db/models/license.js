import mongoose from 'mongoose';

const licenseSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true,
    },
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    fileType: {
        type: [String],
        required: true,
    },
    usageLimit: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const License = mongoose.models.License || mongoose.model('License', licenseSchema);

export default License;
