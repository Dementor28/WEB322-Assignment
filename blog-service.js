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


//Arrays
var posts = [];
var categories = [];

var errormsg = "No Results Returned";

const { promises, resolve } = require("dns");
const fs = require("fs"); // required at the top of your module

module.exports.initialize = function () {
  fs.readFile("./data/posts.json", (err, posts_data) => {
    if (err) {
      return Promise.reject("unable to read the File posts.json");
    }
    posts = JSON.parse(posts_data);
  });

  fs.readFile("./data/categories.json", (err, categories_data) => {
    if (err) {
      return Promise.reject("unable to read the File categories.json");
    }
    categories = JSON.parse(categories_data);
  });

  return Promise.resolve();
};


module.exports.getAllPosts = function () {
  var promise = new Promise((resolve, reject) => {
    if (posts.length === 0) {
      reject(errormsg);
    }
    resolve(posts);
  });
  return promise;
};


module.exports.getPublishedPosts = function () {
  var publishedPost = [];
  var promise = new Promise((resolve, reject) => {
    for (var i = 0; i < posts.length; i++) {
      if (posts[i].published == true) {
        publishedPost.push(posts[i]);
      }
    }
    if (posts.length === 0) {
      reject(errormsg);
    }
    resolve(publishedPost);
  });
  return promise;
};

module.exports.addPost = function (postData) {
  return new Promise(function (resolve, reject) {
    if (postData.published == undefined) {
      postData.published = false;
    } else {
      postData.published = true;
    }
    postData.id = posts.length + 1;
    posts.push(postData);
    resolve(posts);
  });
};


module.exports.getPostsByCategory = function (category) {
  var postsByCategory = [];

  return new Promise((resolve, reject) => {
    for (var i = 0; i < posts.length; i++) {
      if (posts[i].category == category) {
        postsByCategory.push(posts[i]);
      }
    }
    if (postsByCategory.length > 0) {
      resolve(postsByCategory);
    } else {
      reject(errormsg);
    }
  });
};

//Get Post by category By using Filter
// module.exports.getPostsByCategory = (category) => {
//   return new Promise(function(resolve, reject) {
//       const read = fs.readFileSync('./data/posts.json');
//       var Posts = JSON.parse(read);
//       var filter = Posts.filter(a => a.category == category);
//       if (filter.length > 0) {
//           resolve(filter);
//       } else {
//           reject("No Matching Category Found!");
//       }
//   });
// };


module.exports.getPostsByMinDate = (minDateStr) => {
  return new Promise((resolve, reject) => {
      const read = fs.readFileSync('./data/posts.json');
      var publishedPosts = JSON.parse(read);
      var filter = publishedPosts.filter(a => new Date(a.postDate) >= new Date(minDateStr));
      if (filter.length > 0) {
          resolve(filter);
      } else {
          reject(errormsg);
      }

  });
}

module.exports.getPostById = (id) => {
  return new Promise((resolve, reject) => {
      const read = fs.readFileSync('./data/posts.json');
      var publishedPosts = JSON.parse(read);
      var filter = publishedPosts.filter(a => a.id == id);
      if (filter.length > 0) {
          resolve(filter);
      } else {
          reject(errormsg);
      }

  });
}
