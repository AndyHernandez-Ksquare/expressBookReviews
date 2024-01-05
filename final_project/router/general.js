const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
    if (!isValid(username)) {
      users.push({ username: username, password: password });
      return res
        .status(200)
        .json({ message: `User ${username} Registered Successfully` });
    } else {
      return res
        .status(400)
        .json({ message: `User ${username} Already registered` });
    }
  } else {
    return res
      .status(404)
      .json({ message: "Please provide username and password" });
  }
});

function getBooks() {
  return new Promise((resolve, reject) => {
    resolve(books);
  });
}

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  getBooks()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
});

function getBookByISBN(isbn) {
  return new Promise((resolve, reject) => {
    let isbnNum = parseInt(isbn);
    if (books[isbnNum]) {
      resolve(books[isbnNum]);
    } else {
      reject({ status: 404, message: `ISBN ${isbn} not found` });
    }
  });
}

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  try {
    const isbn = req.params.isbn;

    if (!isbn) {
      return res.status(400).json({ message: "Invalid isbn" });
    } else {
      getBookByISBN(isbn)
        .then((result) => {
          res.status(200).json(result);
        })
        .catch((error) => {
          res.status(500).json({ message: error.message });
        });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  try {
    const author = req.params.author;

    if (!author) {
      return res.status(400).json({ message: "Invalid author" });
    }

    getBooks()
      .then(function (bks) {
        const filteredBooks = Object.values(bks).filter(
          (book) => book.author === author
        );

        if (!filteredBooks || !bks) {
          return res.status(404).json({ message: "No books found" });
        }

        res.status(200).json(filteredBooks);
      })
      .catch(function (error) {
        res.status(500).json({ message: error.message });
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  try {
    const title = req.params.title;

    if (!title) {
      return res.status(400).json({ message: "Invalid title" });
    }

    getBooks()
      .then(function (bks) {
        const filteredBooks = Object.values(bks).filter(
          (book) => book.title === title
        );

        if (!filteredBooks || !bks) {
          return res.status(404).json({ message: "No books found" });
        }

        res.status(200).json(filteredBooks);
      })
      .catch(function (error) {
        res.status(500).json({ message: error.message });
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  try {
    const isbn = req.params.isbn;
    if (!isbn) return res.status(400).json({ message: "Invalid isbn" });
    getBookByISBN(isbn).then((result) => res.status(200).send(result.reviews));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports.general = public_users;
