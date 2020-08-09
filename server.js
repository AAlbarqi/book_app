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

app.post('/searches', searchBook);

app.listen(PORT, () => {
  console.log('Server is listening to port ', PORT);
});

let handleError = (err, res) => {
  res.render('pages/error', {error: `Something's wrong, ${err}`})
}
app.all('*', handleError)

function searchBook (req,res){
  let url = `https://www.googleapis.com/books/v1/volumes?q=${req.body.searchQuery}+${req.body.title ? 'intitle' : 'inauthor'}`;
  superagent.get(url).then(data => {
    let books = [];
    data.body.items.map(book => {
      let title = book.volumeInfo.title;
      let author = book.volumeInfo.authors;
      let description = book.volumeInfo.description;
      let img = book.volumeInfo.imageLinks.thumbnail;
      books.push(new Book(title,author,img,description));
    });
    res.render('./pages/searches/show.ejs', {bookList:books});
  }).catch(err => handleError(err, res));
}

class Book {
  constructor(title, author, img, description) {
    this.title = title || 'Not available';
    this.author = author || 'No Author available';
    this.img = img.replace(/^(http:\/\/)/g,'https://') || 'https://i.imgur.com/J5LVHEL.jpg';
    this.description = description || 'No description';
  }
}
