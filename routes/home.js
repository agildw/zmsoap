const express = require('express');
const store = require('store');
const router = express.Router();

router.use('/', (req, res) => {
    // console.log(store.get('tokenUser'), 'Ini dari home')
    res.send('<h1>G ada</h1>')
})

module.exports = router