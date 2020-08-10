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

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

app.get('/', getSavedBooks);
app.get('/searches/new', (req, res) => {
  res.render('./pages/searches/new.ejs');
});
app.post('/searches', searchBook);
app.post('/books', searchBooks);
app.get('/book/:id', getBook);


app.listen(PORT, () => {
  console.log('Server is listening to port ', PORT);
});

let handleError = (err, res) => {
  res.render('pages/error', {error: `Something's wrong, ${err}`})
}
app.all('*', handleError)

function searchBooks(req,res){
  console.log(req.body)
  let {author,title,isbn,image_url,description,bookshelf} = req.body;
  let SQL = 'INSERT into books(author,title,isbn,image_url,description,bookshelf) VALUES ($1, $2, $3, $4, $5, $6);';
  let values = [author,title,isbn,image_url,description,bookshelf];

  return client.query(SQL, values).then( ()=>{
    SQL = 'SELECT * FROM books WHERE isbn = $1;';
    values = [req.body.isbn];
    return client.query(SQL,values).then( data => {
      res.redirect(`/book/${data.rows[0].id}`)
    }).catch(err => handleError(err,res));
  })
}

function getBook (req,res){
  let SQL = 'SELECT * FROM books WHERE id=$1;';
  let values = [req.params.id];
  client.query(SQL, values).then(data => {
    res.render('pages/books/show', {book:data.rows[0]});
  }).catch(err => handleError(err,res));
}

function getSavedBooks(req,res){
  let SQL = 'SELECT * FROM books;';
  return client.query(SQL).then(data => {
    if(data.rowCount === 0){
      res.render('pages/index');
    } else {
      res.render('pages/index', {bookList : data.rows});
    }
  }).catch(err => handleError(err,res));
}

function searchBook (req,res){
  let url = `https://www.googleapis.com/books/v1/volumes?q=${req.body.searchQuery}+${req.body.title ? 'intitle' : 'inauthor'}`;
  superagent.get(url).then(data => {
    let books = [];
    data.body.items.map(book => {
      let title = book.volumeInfo.title;
      let author = book.volumeInfo.authors;
      let description = book.volumeInfo.description;
      let image_url = book.volumeInfo.imageLinks.thumbnail;
      let isbn = book.volumeInfo.industryIdentifiers[0].identifier;
      books.push(new Book(title,author,image_url,description,isbn));
    });
    res.render('./pages/searches/show.ejs', {bookList:books});
  }).catch(err => handleError(err, res));
}

class Book {
  constructor(title, author, image_url, description, isbn) {
    this.title = title || 'Not available';
    this.author = author || 'No Author available';
    this.image_url = image_url.replace(/^(http:\/\/)/g,'https://') || 'https://i.imgur.com/J5LVHEL.jpg';
    this.description = description || 'No description';
    this.isbn = isbn || 'No ISBN';
    this.bookshelf = 'Not Available';
  }
}
