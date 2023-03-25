/*********************************************************************************
 *  WEB322 – Assignment 03
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name:Abdullah Student ID: 152158200 Date: 23 March 2023
 *
 *  Online (Cyclic) Link: https://funny-ray-cuff-links.cyclic.app/posts/add
 *
 ********************************************************************************/

const express = require("express");
const exphbs = require("express-handlebars");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const path = require("path");
const streamifier = require("streamifier");
const blogService = require("./blog-service");
var fs = require("fs");


const upload = multer(); // no { storage: storage } since we are not using disk storage


const app = express();
app.use(express.static("./public"));
app.use(express.static("./views"));
app.use(express.urlencoded({ extended: true }));

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
      formatDate: function (dateObj) {
        let year = dateObj.getFullYear();
        let month = (dateObj.getMonth() + 1).toString();
        let day = dateObj.getDate().toString();
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      },
    },
  })
);
app.set("view engine", ".hbs");


//Redirect to the home page
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


//Redirect to blog for /
app.get("/", (req, res) => {
  res.redirect("/blog");
});


app.get("/about", (req, res) => {
  res.render("about");
});


app.get("/blog", async (req, res) => {
  let viewData = {};

  try {
    let posts = [];
    if (req.query.category) {
      posts = await blogService.getPublishedPostsByCategory(req.query.category);
    } else {
      posts = await blogService.getPublishedPosts();
    }
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    let post = posts[0];

    viewData.posts = posts;
    viewData.post = post;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    let categories = await blogService.getCategories();

    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  res.render("blog", { data: viewData });
});

app.get("/posts", (req, res) => {
  if (req.query.category) {
    blogService
      .getPostsByCategory(req.query.category)
      .then(function (data) {
        if (data.length > 0) {
          res.render("posts", { posts: data });
        } else {
          res.render("posts", { message: "no results" });
        }
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
      .then(function (data) {
        if (data.length > 0) {
          res.render("posts", { posts: data });
        } else {
          res.render("posts", { message: "no results" });
        }
      })
      .catch((err) => {
        res.render("posts", { message: "no results" });
      });
  }
});

// Add the "/post/id" route
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
  res.render("blog", { data: viewData });
});


app.get("/categories", (req, res) => {
  blogService
    .getCategories()
    .then((data) => {
      if (data.length > 0) {
        res.render("categories", { categories: data });
      } else {
        res.render("categories", { message: "no results" });
      }
    })
    .catch((err) => {
      res.render("categories", { message: "no results" });
    });
});

// /posts/add
app.get("/posts/add", (req, res) => {
  blogService
    .getCategories()
    .then((categories) => {
      res.render("addPost", { categories: categories });
    })
    .catch((err) => {
      res.render("addPost", { categories: [] });
    });
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

app.get("/categories/add", (req, res) => {
  res.render("addCategory");
});

app.post("/categories/add", (req, res) => {
  let categoryobj = {};

  categoryobj.category = req.body.category;
  console.log(req.body.category);

  if (req.body.category != "") {
    blogService
      .addCategory(categoryobj)
      .then(() => {
        res.redirect("/categories");
      })
      .catch((err) => {
        res.json(err);
      });
  }
});

app.get("/categories/delete/:id", (req, res) => {
  blogService
    .deleteCategoryById(req.params.id)
    .then(() => {
      res.redirect("/categories");
    })
    .catch(() => {
      console.log("Unable to remove category / Category not found");
    });
});

app.get("/posts/delete/:id", (req, res) => {
  blogService
    .deletePostById(req.params.id)
    .then(() => {
      res.redirect("/posts");
    })
    .catch(() => {
      res.status(500).send("Server Error");
      console.log("Unable to remove post / post not found");
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
cloudinary.config({
  cloud_name: "devvtx5mb",
  api_key: "245521392787718",
  api_secret: "9YrmTclJ5Lz13g9nnHL7yZQ3Pnc",
  secure: true,
});

