DROP TABLE IF EXISTS books;

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  author VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  isbn VARCHAR(255) NOT NULL,
  image_url VARCHAR(255),
  description TEXT,
  bookshelf VARCHAR(255)
);
