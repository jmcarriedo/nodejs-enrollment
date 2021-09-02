const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const cookie = require('cookie-parser');
const path = require('path');
const app = express();
const hostname = 'localhost';
const port = process.env.port || 3000;

dotenv.config({path: './.env'});

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

db.connect(function(err) {
    if (err) {
        console.error('error connecting', + err.stack);
    } else {
        console.log('MySQL connected');
    }
});

app.set('view engine', 'hbs');
app.use(cookie());
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use('/', require('./routes/registerroutes'));
app.use('/auth', require('./routes/auth'));

const publicdir = path.join(__dirname, './public/');
app.use(express.static(publicdir));

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}`)
});
