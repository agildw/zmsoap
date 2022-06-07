const express = require('express');
const store = require('store');
const router = express.Router();

router.use('/', (req, res) => {
    // console.log(store.get('tokenUser'), 'Ini dari home')
    if (store.get('tokenUser') != undefined) {
        res.redirect('/user/dashboard')
    } else if (store.get('adminToken') != undefined) {
        res.redirect('/admin/dashboard')
    }
    else {
        res.redirect('/login')
    }
})

module.exports = router