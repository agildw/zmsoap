const express = require('express');
const store = require('store');
const soapRequest = require('easy-soap-request');
const cheerio = require('cheerio');

const router = express.Router();


const getUserInfo = async (zmtoken, email) => {
    const xml = `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
    <soap:Header>
        <authToken>${zmtoken}</authToken>
        <context xmlns="urn:zimbra" />
      </soap:Header>
        <soap:Body>
            <GetAccountInfoRequest xmlns="urn:zimbraAccount">
                <account by="name">${email}</account>
            </GetAccountInfoRequest>
        </soap:Body>
    </soap:Envelope>`

    const headers = {
        'Cookie': `ZM_AUTH_TOKEN=${zmtoken}`,
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': '"#GetAccountInfoRequest"'
    }

    const url = 'https://mail.zimbracloud.com/service/soap';
    // console.log(xml)
    const { response } = await soapRequest({ url: url, headers: headers, xml: xml })
    const { body } = response;
    // console.log(body);
    return body
}

router.use('/dashboard', async (req, res) => {
    // res.send('Worked')
    const zmToken = store.get('tokenUser');
    const mailUser = store.get('emailUser');

    try {
        const result = await getUserInfo(zmToken, mailUser);
        // console.log(result)
        const $ = cheerio.load(result);
        const displayName = $('attr').last().text()
        res.render('userDB', { name: displayName })
    } catch (e) {
        console.log(e)
        res.redirect('/')
        res.end()
    }

})

router.use('/info', async (req, res) => {
    const zmToken = store.get('tokenUser');
    const mailUser = store.get('emailUser');
    try {
        const result = await getUserInfo(zmToken, mailUser);
        const $ = cheerio.load(result);
        const displayName = $('attr').last().text();
        const mail = $('name').text();
        const zimbraId = $('attr').first().text()
        const soapUrl = $('soapURL').text();
        const publicUrl = $('publicURL').text();
        const adminUrl = $('adminURL').text();

        res.render('userInfo', { name: displayName, mail: mail, zimbraId: zimbraId, soapUrl: soapUrl, publicUrl: publicUrl, adminUrl: adminUrl })
    } catch (e) {
        console.log(e)
        res.redirect('/user/dashboard')
        res.end()
    }
})
module.exports = router