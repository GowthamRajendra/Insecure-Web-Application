// change name later
const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/', (req, res) => {
    // if there is no security cookie, set it to low
    if (!req.cookies.security) {
        res.cookie('security', 'Low', { httpOnly: false });
    }

    res.sendFile(path.join(__dirname, '../../client/pages/bug3.html'));
});

module.exports = router;