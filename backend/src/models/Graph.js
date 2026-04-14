import mongoose from 'mongoose';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz', 8);

const graphSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: false, // Allows anonymous graphs if we wanted to
        ref: 'User'
    },
    title: {
        type: String,
        default: 'Untitled Graph'
    },
    shortId: {
        type: String,
        required: true,
        unique: true,
        default: () => nanoid()
    },
    functionsState: {
        type: Array,
        required: true
    },
    pointsState: {
        type: Array,
        required: true
    },
    settings: {
        type: Object,
        required: true
    },
    isPublic: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Graph = mongoose.model('Graph', graphSchema);
export default Graph;
