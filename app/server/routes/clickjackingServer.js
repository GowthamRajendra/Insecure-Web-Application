// change name later
const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/', (req, res) => {
    // if there is no security cookie, set it to low
    if (!req.cookies.security) {
        res.cookie('security', 'Low', { httpOnly: false });
    }

    if (req.cookies.security === 'Low') {
        res.sendFile(path.join(__dirname, '../../client/pages/clickjacking_levels/clickjacking_low.html'));
    } else if (req.cookies.security === 'Medium') {
        res.sendFile(path.join(__dirname, '../../client/pages/clickjacking_levels/clickjacking_medium.html'));
    }

    res.sendFile(path.join(__dirname, '../../client/pages/clickjacking_levels/clickjacking_high.html'));
    // res.sendFile(path.join(__dirname, '../../client/pages/clickjacking.html'));
});

module.exports = router;