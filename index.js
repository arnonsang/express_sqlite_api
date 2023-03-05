const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = 443;

require('dotenv').config()
const myKey = process.env.ickapiskey;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const endpointList = [
    {
        message: "Welcome to the iamickdev public api that provide data for your application testing / development",
        usage: "http://apis.iamickdev.com/:endpointName/:apiKey",
        endpoint: "/",
        method: "GET",
        description: "Get all endpoints List",

    },
    {
        endpoint: "/users/:apikey",
        method: "GET",
        description: "Get all users / Provide username email and password (data.name , data.email , data.password)",
    },
    {
        endpoint: "/users/:apikey",
        method: "POST",
        description: "Add a user",
    },
    {
        endpoint: "/animals/:apikey",
        method: "GET",
        description: "Get all animals / Provide category name and habitat (data.category , data.name , data.habitat)",
    },
    {
        endpoint: "/animals/:apikey",
        method: "POST",
        description: "Add an animal",
    },
];

        
//api key in params
const checkApiKeyParams = (req, res, next) => {
  const apiKey = myKey == undefined ? req.params.apikey : myKey;
  const db = new sqlite3.Database("./db/db.sqlite");
  //get the api key from the database
  db.all("SELECT * FROM apikeys WHERE key = ?", [apiKey], (err, rows) => {
    if (err) {
      return res.status(401).json({ message: "API Key Database Error" });
    } else {
      console.log(rows);

      if (rows.length === 0) {
        return res.status(401).json({ message: "API key is missing" });
      } else {
        next();
      }
    }
  });
  db.close();
};

// home page response how to use the api
app.all("/", (req, res) => {
    //send available endpoints list to with loop and array of endpoints to send to the user
    res.send(endpointList);
});

//if no endpoint is provided return this message


app.all("/users/:apikey", checkApiKeyParams, (req, res) => {
  const db = new sqlite3.Database("./db/db.sqlite");
  switch (req.method) {
    case "GET":
      db.all("SELECT * FROM users", (err, rows) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.send(rows);
          console.log(rows);
        }
      });
      break;
    case "POST":
      const { name, email, password } = req.body;
      db.run(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, password],
        function (err) {
          if (err) {
            res.status(500).send(err);
          } else {
            res.send(`User added with ID: ${this.lastID}`);
          }
          db.close();
        }
      );
      break;
    default:
      res.status(405).send("Method not allowed");
  }
  db.close();
});

app.all("/animals/:apikey", checkApiKeyParams, (req, res) => {
  const animal = new sqlite3.Database("./db/animal.sqlite");
  switch (req.method) {
    case "GET":
      animal.all("SELECT * FROM animals", (err, rows) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.send(rows);
          console.log(rows);
        }
      });
      break;
    case "POST":
      const { category, name, habitat } = req.body;
      animal.run(
        "INSERT INTO animals (category, name, habitat) VALUES (?, ?, ?)",
        [category, name, habitat],
        function (err) {
          if (err) {
            res.status(500).send(err);
          } else {
            res.send(`Animal added with ID: ${this.lastID}`);
          }
          animal.close();
        }
      );
      break;
    default:
      res.status(405).send("Method not allowed");
  }
  animal.close();
});

app.all("*", (req, res) => {
  res.redirect("/");

});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
