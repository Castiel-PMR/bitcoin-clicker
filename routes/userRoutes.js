const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Маршрут для сохранения данных пользователя
router.post('/save/:telegramId', async (req, res) => {
    const { telegramId } = req.params;
    const { btcCount } = req.body;
    try {
        let user = await User.findOne({ telegramId });
        if (user) {
            user.btcCount = btcCount;
        } else {
            user = new User({ telegramId, btcCount });
        }
        await user.save();
        res.send('Data saved');
    } catch (error) {
        console.error('Error saving user data:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Маршрут для получения данных пользователя
router.get('/load/:telegramId', async (req, res) => {
    const { telegramId } = req.params;
    try {
        const user = await User.findOne({ telegramId });
        if (user) {
            res.json({ btcCount: user.btcCount });
        } else {
            res.json({ btcCount: 0 });
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
