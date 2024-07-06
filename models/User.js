const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    telegramId: { type: String, unique: true },
    btcCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('User', userSchema);
