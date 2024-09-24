const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const userExists = users.find(user => user.username === username);

    if (userExists) {
        return res.status(409).json({ message: "Username already exists" });
    }

    users.push({ username, password });
    console.log(users)
    res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    const jsonResponse = JSON.stringify(books, null, 2); 
    res.type('application/json'); 
    res.send(jsonResponse);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;

    const book = books[isbn];

    if (book) {
    
        res.json(book);
    } else {
       
        res.status(404).json({ message: "Book not found" });
    }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {

  const author = req.params.author.toLowerCase();
  let booksByAuthor = [];
  for (let isbn in books) {
       
        if (books[isbn].author.toLowerCase() === author) {
            booksByAuthor.push(books[isbn]);
        }
    }
    if (booksByAuthor.length > 0) {
        res.json(booksByAuthor);
    } else {
        res.status(404).json({ message: "No books found for the given author" });
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title.toLowerCase();
    let bookByTitle = null;

    for (let isbn in books) {
        if (books[isbn].title.toLowerCase() === title) {
            bookByTitle = books[isbn];
            break;
        }
    }

    if (bookByTitle) {
        res.json(bookByTitle);
    } else {
        res.status(404).json({ message: "No book found with the given title" });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        res.json(book.reviews);
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
