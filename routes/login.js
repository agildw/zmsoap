const express = require('express');
const soapRequest = require('easy-soap-request');
const router = express.Router();
const store = require('store');

const url = 'https://mail.zimbracloud.com/service/soap';

let zmtoken = '';


const goLogin = async (username, password) => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
    <soap:Header>
        <context xmlns="urn:zimbra" >
              
        </context>
      </soap:Header>
        <soap:Body>
            <AuthRequest xmlns="urn:zimbraAccount">
            <account by="name">${username}</account>
            <password>${password}</password>
            </AuthRequest>
        </soap:Body>
    </soap:Envelope>`

    const { response } = await soapRequest({ url: url, headers: { 'Content-Type': 'text/xml;charset=UTF-8' }, xml: xml })
    const { body } = response;
    const re = new RegExp("<authToken(?:[^>]+class=\"(.*?)\"[^>]*)?>(.*?)<\/authToken>")
    let r = body.match(re);
    // console.log(body)
    // console.log('Ini run dari function')
    return r[2]
}

let errorInfo = ''

router.use('/login', (req, res) => {
    // console.log(token)
    // console.log(store.get('zmtoken'))
    res.render('login', { error: errorInfo })
})

router.use('/dologin', async (req, res) => {
    // console.log(req.body);
    try {
        zmtoken = await goLogin(req.body.username, req.body.password)
        store.set('tokenUser', zmtoken);
        store.set('emailUser', req.body.username)

        // console.log(zmtoken)
        res.redirect('/user/dashboard');
        // res.redirect('/login');

    } catch (e) {
        console.log(e)
        errorInfo = e
        res.redirect('/login');
    }



})

router.use('/logout', (req, res) => {
    store.remove('tokenUser');
    res.redirect('/')
})
module.exports = router