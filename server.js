'use strict';

const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const cors = require('cors');

require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');
app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.static('./public'));

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.render('./pages/index.ejs');
});

app.listen(PORT, () => {
    console.log('Server is listening to port ', PORT);
});

app.all('*', (req, res) => {
    res.status(500).send('Status 500: Sorry, something went wrong');
});