const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const userSchema = new Schema({
    username: { type: String, required: true },
});

module.exports.user = mongoose.model('User', userSchema);

const userExcerciseSchema = new Schema({
    userId: { type: String },
    username: {
        type: String,
        required: true,
    },
    decsription: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
    },
});

module.exports.exercise = mongoose.model('Excercise', userExcerciseSchema);
