const express = require('express');
const router = express.Router();
const store = require('store');
const soapRequest = require('easy-soap-request');
const cheerio = require('cheerio');

const url = 'https://mail.zimbracloud.com:9071/service/admin/soap'

const adminLogin = async (email, password) => {
    const xmls = `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
    <soap:Body>
        <AuthRequest xmlns="urn:zimbraAdmin" password="${password}">
        <account by="name">${email}</account>
        </AuthRequest>
    </soap:Body>
</soap:Envelope>`

    const { response } = await soapRequest({ url: url, headers: { 'Content-Type': 'text/xml;charset=UTF-8' }, xml: xmls })
    const { body } = response;
    return body
}

router.use('/login', (req, res) => {
    res.render('adminLogin');
})

router.use('/doAdminLogin', async (req, res) => {
    const result = await adminLogin(req.body.mail, req.body.password);
    // console.log(result)
    const $ = cheerio.load(result);
    const zmToken = $('authToken').text();
    // console.log(zmToken)
    store.set('adminToken', zmToken);
    store.set('adminEmail', req.body.mail);
    res.redirect('/admin/dashboard')
})

router.use('/dashboard', (req, res) => {
    console.log(store.get('adminToken'))
    res.render('adminDB')
})

router.use('/createAccount', (req, res) => {
    res.render('createAccount');
})

router.use('/listDomain', (req, res) => {
    res.render('listDomain');
})
module.exports = router