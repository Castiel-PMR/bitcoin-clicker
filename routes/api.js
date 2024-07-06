const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Маршрут для сохранения данных пользователя
router.post('/save', async (req, res) => {
    const { telegramId, btcCount } = req.body;
    let user = await User.findOne({ telegramId });
    if (user) {
        user.btcCount = btcCount;
    } else {
        user = new User({ telegramId, btcCount });
    }
    await user.save();
    res.send('Data saved');
});

// Маршрут для получения данных пользователя
router.get('/load/:telegramId', async (req, res) => {
    const { telegramId } = req.params;
    const user = await User.findOne({ telegramId });
    if (user) {
        res.json({ btcCount: user.btcCount });
    } else {
        res.json({ btcCount: 0 });
    }
});

module.exports = router;
