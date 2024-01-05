const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  const foundUsers = users.filter((user) => user.username === username);
  return foundUsers.length > 0;
};

const authenticatedUser = (username, password) => {
  //returns boolean
  const matchingUsers = users.filter(
    (user) => user.username === username && user.password === password
  );
  return matchingUsers.length > 0;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    // Fix the condition here
    return res
      .status(400)
      .json({ message: "Please provide your username and password" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({ data: password }, "access", {
      expiresIn: 3600,
    });
    req.session.authorization = { accessToken, username };
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid username or password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization.username;

  if (!username)
    return res.status(400).json({ message: "Please provide your username" });

  if (!review)
    return res.status(400).json({ message: "Please provide your review" });

  if (!isbn)
    return res.status(400).json({ message: "Please provide your isbn" });

  if (books[isbn]) {
    let book = books[isbn];
    book.reviews[username] = review;
    return res.status(200).send("Review posted!");
  } else {
    return res.status(404).json({ message: `ISBN ${isbn} not found` });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  if (!req.session || !req.session.authorization) {
    return res
      .status(400)
      .json({ message: "Session or authorization info not found" });
  }

  const username = req.session.authorization.username;

  if (!username)
    return res.status(400).json({ message: "Please provide your username" });

  if (!isbn)
    return res.status(400).json({ message: "Please provide your isbn" });

  if (books[isbn]) {
    let book = books[isbn];
    delete book.reviews[username];
    return res.status(200).send("Review deleted!");
  } else {
    return res.status(404).json({ message: `ISBN ${isbn} not found` });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
