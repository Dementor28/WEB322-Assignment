
/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name:Abdullah Student ID: 152158200 Date: 03 FEB 2023
*
*  Online (Cyclic) Link: 
*
********************************************************************************/

// express module
var express = require("express");
var app = express();
var fs = require("fs");
app.use(express.static("public"));
const blogservice = require("./blog-service");
// ************************************************************************************************

//route on the root of url
app.get("/", (req, res) => {
  res.redirect("/about");
});
// ************************************************************************************************


//Returning about.html page when url has "/about" 
app.get("/about", (req, res) => {
  res.sendFile(__dirname + "/views/about.html");
});
// ************************************************************************************************


//returning response to confirm routes are wroking
app.get("/blog", (req, res) => {
  blogservice
    .getPublishedPosts()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.send(err);
    });

  // Some experimenting with the code below...
  // fs.readFile('./data/posts.json', (err, data) => {

  //   if(err) {
  //     console.error(err);
  //     return;
  //   }

  //   const posts = JSON.parse(data);
  //   const publishedPosts = posts.filter(post => post.published === true);

  //   // console.log(publishedPosts);
  //   return JSON.stringify(publishedPosts);

  //   res.send(JSON.stringify(publishedPosts));

  // });
  // res.send("TODO: get all posts who have published == true");
});
// ************************************************************************************************

app.get("/posts", (req, res) => {
  blogservice
    .getAllPosts()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json("Cannot get published posts");
    });
});
// ************************************************************************************************


app.get("/categories", (req, res) => {
  blogservice
    .getCategories()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json("Cannot get categories");
    });

  // Some Experimenting with the code below
  //Reads the file asynchoronously
  //   fs.readFile('./data/categories.json', (err, data) => {
  //           if(err) {
  //             res.writeHead(500, { 'Content-Type': 'application/json'});
  //             res.end(JSON.stringify({error: 'Error reading posts file'}));
  //             return;
  //           }

  //           //Parsing the data
  //           const categories = JSON.parse(data);

  //           res.writeHead(200, { 'Content-Type': 'application/json' });
  //           res.end(JSON.stringify(categories));
  // });

  // res.send("Returns all the categories here");
});
// ************************************************************************************************


app.get("*", (req, res) => {
  res.status(404).json("BIG ERROR 404!...Page Not Found");
});
//************************************************************************************************

// listening on port 8080
app.set("port", process.env.PORT || 8080);

const HTTP_PORT = process.env.PORT || 8080;

blogservice
  .initialize()
  .then(() => {
    app.listen(HTTP_PORT, onHttpStart);
  })
  .catch((error) => {
    console.error(error);
    console.log("Failed to initialize server");
  });

function onHttpStart() {
  console.log("Express http server listening on port " + HTTP_PORT);
}
// ************************************************************************************************