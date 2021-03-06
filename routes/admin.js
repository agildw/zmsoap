const express = require('express');
const router = express.Router();
const store = require('store');
const soapRequest = require('easy-soap-request');
const cheerio = require('cheerio');
const { response } = require('express');

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

const getDomain = async (token) => {
    const xmls = `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
    <soap:Header>
        <authToken>${token}</authToken>
        <context xmlns="urn:zimbra" />
      </soap:Header>
        <soap:Body>
            <GetAllDomainsRequest xmlns="urn:zimbraAdmin" />
        </soap:Body>
    </soap:Envelope>`
    const headers = {
        'Cookie': `ZM_ADMIN_AUTH_TOKEN=${token}`,
        'Content-Type': 'text/xml;charset=UTF-8'
    }
    const { response } = await soapRequest({ url: url, headers: headers, xml: xmls })
    const { body } = response;
    // console.log(body);
    return body
}
const createAccount = async (token, email, password) => {
    const xmls = `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
    <soap:Header>
        <authToken>${token}</authToken>
        <context xmlns="urn:zimbra" />
      </soap:Header>
        <soap:Body>
        <CreateAccountRequest xmlns="urn:zimbraAdmin" name="${email}" password="${password}">
        </CreateAccountRequest>
        </soap:Body>
    </soap:Envelope>`

    const headers = {
        'Cookie': `ZM_ADMIN_AUTH_TOKEN=${token}`,
        'Content-Type': 'text/xml;charset=UTF-8'
    }
    const { response } = await soapRequest({ url: url, headers: headers, xml: xmls })
    const { body } = response;
    // console.log(body);
    return body
}
const deleteAccount = async (token, idAccount) => {
    const xmls = `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
    <soap:Header>
        <authToken>${token}</authToken>
        <context xmlns="urn:zimbra" />
      </soap:Header>
        <soap:Body>
        <DeleteAccountRequest  xmlns="urn:zimbraAdmin" id="${idAccount}">
        </DeleteAccountRequest>
        </soap:Body>
    </soap:Envelope>`

    const headers = {
        'Cookie': `ZM_ADMIN_AUTH_TOKEN=${token}`,
        'Content-Type': 'text/xml;charset=UTF-8'
    }
    const { response } = await soapRequest({ url: url, headers: headers, xml: xmls })
    const { body } = response;
    // console.log(body);
    return body
}

router.use('/login', (req, res) => {
    res.render('adminLogin', { error: errorInfo });
})

let errorInfo = '';
router.use('/doAdminLogin', async (req, res) => {
    try {
        const result = await adminLogin(req.body.mail, req.body.password);
        // console.log(result)
        const $ = cheerio.load(result);
        const zmToken = $('authToken').text();
        // console.log(zmToken)
        store.set('adminToken', zmToken);
        store.set('adminEmail', req.body.mail);
        errorInfo = ''
        res.redirect('/admin/dashboard')
    } catch (e) {
        console.log(e);
        errorInfo = e
        res.redirect('/admin/login')
    }
})

router.use('/dashboard', (req, res) => {
    // console.log(store.get('adminToken'))
    res.render('adminDB')
})

router.use('/createAccount', async (req, res) => {
    if (req.body.username != undefined) {
        try {
            const zmToken = store.get('adminToken')
            const result = await createAccount(zmToken, req.body.username, req.body.password)
            console.log(result)
            console.log(req.body.username, req.body.password)
            res.render('createAccount', { isSuccess: 'account was successfully created', response: result });

        } catch (error) {
            console.log(error);
            res.render('createAccount', { isSuccess: 'Failed created account', response: error });

        }
    } else {
        res.render('createAccount', { isSuccess: '', response: '' });
    }
})


router.use('/listDomain', async (req, res) => {
    try {
        const zmToken = store.get('adminToken')
        const response = await getDomain(zmToken)
        // console.log(response)
        const $ = cheerio.load(response);
        // console.log($('domain').length)
        const domainLength = $('domain').length
        const nameDomain = $('domain').attr('name')
        console.log(nameDomain)
        const idDomain = $('domain').attr('id')

        res.render('listDomain', { lengthDomain: domainLength, nameDomain: nameDomain, response: response, idDomain: idDomain })
    } catch (e) {
        console.log(e)
        res.render('listDomain', { lengthDomain: 2 })

    }
})

router.use('/deleteAccount', async (req, res) => {
    if (req.body.idAccount != undefined) {
        try {
            const zmToken = store.get('adminToken')
            const result = await deleteAccount(zmToken, req.body.idAccount);
            console.log(result)
            res.render('deleteAccount', { error: 'Success delete account', reason: '' })
        } catch (e) {
            console.log(e)
            res.render('deleteAccount', { error: 'Failed delete account', reason: e })

        }
    } else {
        res.render('deleteAccount', { error: '', reason: '' })
    }
})
module.exports = router