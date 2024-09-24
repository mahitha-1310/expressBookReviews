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

public_users.get('/', async (req, res) => {
    try {
        const booksData = await new Promise((resolve) => {
            resolve(books); 
        });

        const jsonResponse = JSON.stringify(booksData, null, 2);
        res.type('application/json');
        res.send(jsonResponse);
    } catch (error) {
        res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        const book = await new Promise((resolve, reject) => {
            const foundBook = books[isbn];
            if (foundBook) {
                resolve(foundBook);
            } else {
                reject(new Error("Book not found"));
            }
        });
        res.json(book);
    } catch (error) {
        res.status(404).json({ message: "Book not found" });
    }
 });
  
// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author.toLowerCase();
    let booksByAuthor = [];

    try {
        booksByAuthor = await new Promise((resolve) => {
            for (let isbn in books) {
                if (books[isbn].author.toLowerCase() === author) {
                    booksByAuthor.push(books[isbn]);
                }
            }
            resolve(booksByAuthor);
        });

        if (booksByAuthor.length > 0) {
            res.json(booksByAuthor);
        } else {
            res.status(404).json({ message: "No books found for the given author" });
        }
    } catch (error) {
        res.status(500).json({ message: "An error occurred" });
    }
});


// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title.toLowerCase();
    let bookByTitle = null;
    try {
        bookByTitle = await new Promise((resolve) => {
            for (let isbn in books) {
                if (books[isbn].title.toLowerCase() === title) {
                    resolve(books[isbn]);
                    return;
                }
            }
            resolve(null);
        });
        if (bookByTitle) {
            res.json(bookByTitle);
        } else {
            res.status(404).json({ message: "No book found with the given title" });
        }
    } catch (error) {
        res.status(500).json({ message: "An error occurred" });
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
