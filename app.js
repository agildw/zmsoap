const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

const loginRoutes = require('./routes/login');
const homeRoutes = require('./routes/home');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');


app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(loginRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use(homeRoutes);



app.listen(80)
console.log('run on port 80')