/*********************************************************************************
 *  WEB322 – Assignment 03
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name:Abdullah Student ID: 152158200 Date: 10 March 2023
 *
 *  Online (Cyclic) Link: https://funny-ray-cuff-links.cyclic.app/posts/add
 *
 ********************************************************************************/

// express module
const express = require("express");
const exphbs = require("express-handlebars");
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

// const ejs = require("ejs");
// app.set("view engine", "ejs");
const stripJs = require("strip-js");

app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    helpers: {
      navLink: function (url, options) {
        return (
          "<li" +
          (url == app.locals.activeRoute ? ' class="active" ' : "") +
          '><a href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        );
      },
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },

      safeHTML: function (context) {
        return stripJs(context);
      },
    },
  })
);

app.set("view engine", ".hbs");

// Adding use function to view active pages in website
app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute =
    "/" +
    (isNaN(route.split("/")[1])
      ? route.replace(/\/(?!.*)/, "")
      : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});
//************************************************************************************************

// ************************************************************************************************
//route on the root of url
app.get("/", (req, res) => {
  res.redirect("/blog");
});

app.get("/about", (req, res) => {
  res.render("about");
});

// app.get("/blog", (req, res) => {
//   blogService
//     .getPublishedPosts()
//     .then((data) => {
//       res.json(data);
//     })
//     .catch((err) => {
//       res.json(err);
//     });
// });

// app.get("/posts", function (req, res) {
//   let Promise = null;

//   // by category query
//   if (req.query.category) {
//     //Promise = blogService.getPostsByCategory(req.query.category);
//     res.render("posts", {posts: data});
//     // by mindate Query
//   } else if (req.query.minDate) {
//     //Promise = blogService.getPostsByMinDate(req.query.minDate);
//     res.render("posts", {posts: data});
//     //all posts
//   } else {
//     //Promise = blogService.getAllPosts();
//     res.render("posts", {posts: data});
//   }

//   // Promise
//   //   .then((data) => {
//   //     res.send(data);
//   //   })
//   //   .catch((err) => {
//   //     console.error(err); // log the error
//   //     //res.status(500).send("An error occurred: " + err);
//   //     res.render("posts", {message: "An error occurred: " + err});
//   //   });
// });

app.get("/blog", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // declare empty array to hold "post" objects
    let posts = [];

    // if there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      posts = await blogService.getPublishedPostsByCategory(req.query.category);
    } else {
      // Obtain the published "posts"
      posts = await blogService.getPublishedPosts();
    }

    // sort the published posts by postDate
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // get the latest post from the front of the list (element 0)
    let post = posts[0];

    // store the "posts" and "post" data in the viewData object (to be passed to the view)
    viewData.posts = posts;
    viewData.post = post;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await blogService.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", { data: viewData });
});

app.get("/posts", (req, res) => {
  if ((req, query.category)) {
    blogService
      .getPostsByCategory(req.query.category)
      .then(function (data) {
        res.render("posts", { posts: data });
      })
      .catch(function (err) {
        res.render("posts", { message: "no results" });
      });
  } else if (req.query.minDateStr) {
    blogService
      .getPostsByMinDate(req.query.minDateStr)
      .then(function (data) {
        res.render("posts", { posts: data });
      })
      .catch(function (err) {
        res.render("posts", { message: "no results" });
      });
  } else {
    blogService
      .getAllPosts()
      .then((data) => {
        res.render("posts", { posts: data });
      })

      .catch((err) => {
        res.render("posts", { message: "no results" });
      });
  }
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

app.get("/blog/:id", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    let posts = [];
    if (req.query.category) {
      posts = await blogService.getPublishedPostsByCategory(req.query.category);
    } else {
      posts = await blogService.getPublishedPosts();
    }

    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    viewData.posts = posts;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the post by "id"
    viewData.post = await blogService.getPostById(req.params.id);
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    let categories = await blogService.getCategories();
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", { data: viewData });
});

//old
// app.get("/categories", (req, res) => {
//   blogService
//     .getCategories()
//     .then((data) => {
//       res.json(data);
//     })
//     .catch((err) => {
//       res.json(err);
//     });
// });
//********************************* */

app.get("/categories", (req, res) => {
  blogService
    .getCategories()
    .then((data) => {
      res.render("categories", { categories: data });
    })
    .catch((err) => {
      res.render("categories", { message: "no results" });
    });
});

//GET/posts/add
app.get("/posts/add", (req, res) => {
  res.render("addPost");
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
