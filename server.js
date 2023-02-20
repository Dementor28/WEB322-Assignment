/*********************************************************************************
 *  WEB322 – Assignment 03
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name:Abdullah Student ID: 152158200 Date: 03 FEB 2023
 *
 *  Online (Cyclic) Link: https://funny-ray-cuff-links.cyclic.app/about
 *
 ********************************************************************************/

// express module
const express = require("express");
//Assignment 3
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
//************************************************************************************************

const upload = multer(); // no { storage: storage } since we are not using disk storage
const path = require("path");
const app = express();
var fs = require("fs");
app.use(express.static("./public"));
app.use(express.static("./views"));
const blogService = require("./blog-service");

const ejs = require("ejs");
app.set("view engine", "ejs");

// ************************************************************************************************
//route on the root of url
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/views/about.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname + "/views/about.html"));
});

app.get("/blog", (req, res) => {
  blogService
    .getPublishedPosts()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

app.get("/posts", function (req, res) {
  let Promise = null;

  // by category query
  if (req.query.category) {
    Promise = blogService.getPostsByCategory(req.query.category);
    // by mindate Query
  } else if (req.query.minDate) {
    Promise = blogService.getPostsByMinDate(req.query.minDate);
    //all posts
  } else {
    Promise = blogService.getAllPosts();
  }

  Promise
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.error(err); // log the error
      res.status(500).send("An error occurred: " + err);
    });
});

// Add the "/post/value" route
app.get("/post/:id", (req, res) => {
  blogService
    .getPostById(req.params.id)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.error(err); // log the error
      res.send("ID does not exist: " + err);
    });
});


app.get("/categories", (req, res) => {
  blogService
    .getCategories()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});

//GET/posts/add
app.get("/posts/add", (req, res) => {
  res.sendFile(path.join(__dirname + "/views/addPost.html"));
});

// the post/add route
app.post("/posts/add", upload.single("featureImage"), function (req, res) {
  let streamUpload = (req) => {
    return new Promise((resolve, reject) => {
      let stream = cloudinary.uploader.upload_stream((error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      });

      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
  };

  async function upload(req) {
    let result = await streamUpload(req);
    console.log(result);
    return result;
  }
  upload(req).then((uploaded) => {
    req.body.featureImage = uploaded.url;

    // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
    // to correctly add the new blog post before redirecting the user to the /posts route
    blogService
      .addPost(req.body)
      .then(function (data) {
        res.redirect("/posts");
      })
      .catch(function (err) {
        res.json(err);
      });
  });
});

app.use("*", (req, res) => {
  res.status(404).sendFile(path.join(__dirname + "/views/sorry404.html"));
});

blogService
  .initialize()
  .then(() => {
    app.listen(HTTP_PORT, onHttpStart);
  })
  .catch((err) => {
    console.log("error", err);
  });
const HTTP_PORT = process.env.PORT || 8080;

function onHttpStart() {
  console.log("Express http server listening on port " + HTTP_PORT);
}
// ************************************************************************************************

//*******************************************Assignment 3*********************************************
cloudinary.config({
  cloud_name: "devvtx5mb",
  api_key: "245521392787718",
  api_secret: "9YrmTclJ5Lz13g9nnHL7yZQ3Pnc",
  secure: true,
});

//************************************************************************************************
