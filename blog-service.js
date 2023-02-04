
/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name:Abdullah Student ID: 152158200 Date: 03 FEB 2023
*
*  Online (Cyclic) Link: https://funny-ray-cuff-links.cyclic.app/about
*
********************************************************************************/

const fs = require("fs");

//GLobal arrays
var posts = [];
var categories = [];

function initialize() {
  return new Promise(function (resolve, reject) {
    fs.readFile("./data/posts.json", "utf8", (err, data) => {
      if (err) {
        // console.error(err);
        reject("Unable to read posts.json file");
        return;
      }

      const post = JSON.parse(data);
      // posts.push(post);
      posts = post.slice();
      // console.log(posts);

      fs.readFile("./data/categories.json", "utf8", (err, data) => {
        if (err) {
          // console.error(err);
          reject("Unable to read categories.json file");
          return;
        }

        const category = JSON.parse(data);
        categories = category.slice();
        // console.log(categories);
        // console.log(categories);

        //resolve method
        resolve({ posts, categories });
      });
    });
  });
}
// ************************************************************************************************


function getAllPosts() {
  return new Promise((resolve, reject) => {
    initialize()
      .then(({ posts }) => {
        if (posts.length === 0) {
          reject("no results available");
          return;
        }
        resolve(posts);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
// ************************************************************************************************


function getPublishedPosts() {
  return new Promise((resolve, reject) => {
    // Just a trial code
    // const posts = getAllPosts().filter((post) => post.published === true);
    initialize()
      .then(({ posts }) => {
        let publishedPosts = posts.filter((post) => post.published === true);
        if (publishedPosts.length === 0) {
          reject("No results returned");
          return;
        }
        resolve(publishedPosts);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
// ************************************************************************************************


function getCategories() {
  return new Promise((resolve, reject) => {
    initialize()
      .then(({ categories }) => {
        if (categories.length === 0) {
          reject("no results available");
          return;
        }
        resolve(categories);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
// ************************************************************************************************


//making initialize available for other modules
module.exports.initialize = initialize;
module.exports.getAllPosts = getAllPosts;
module.exports.getPublishedPosts = getPublishedPosts;
module.exports.getCategories = getCategories;
// ************************************************************************************************