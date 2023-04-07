const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;
const { MongoClient } = require('mongodb');


const userSchema = new Schema({
    "userName": {
        type: String,
        unique: true
    },
    "password": String,
    "email": String,
    "loginHistory": [ 
        { 
            "dateTime": Date, 
            "userAgent": String  
        } 
    ]
});
let User; // to be defined on new connection (see initialize)

module.exports.initialize = function() {
  return new Promise((resolve, reject) => {
    let db = mongoose.createConnection(
        "mongodb+srv://abdullah1:" + "Abdullah28" + "@senecaweb.zx6j5w3.mongodb.net/?retryWrites=true&w=majority",
      { useNewUrlParser: true, useUnifiedTopology: true }
    );

    db.on("error", (err) => {
      reject(err);
    });

    db.once("open", () => {
      User = db.model("users", userSchema);
      resolve();
    });
  });
}

module.exports.registerUser = function(userData) {
    return new Promise((resolve, reject) => {
        if (userData.password !== userData.password2) {
            reject("Passwords do not match");
        } else {
            // Hashing the password before storing it
            bcrypt.hash(userData.password, 10).then((hash) => {
                userData.password = hash;
                // Saving the user data
                let newUser = new User(userData);
                newUser.save().then(() => {
                    resolve();
                }).catch((err) => {
                    if (err.code === 11000) {
                        reject("User Name already taken");
                    } else {
                        reject(`There was an error creating the user: ${err}`);
                    }
                })
            })
            .catch((err) => {
                console.log(err);
                reject("There was an error encrypting the password")
            });
        
        }
    })
}

module.exports.checkUser = function(userData) {
    return new Promise((resolve, reject) => {
        User.find({ "userName": userData.userName }).exec()
        .then((users) => {
            if (users.length === 0) {
                reject(`Unable to find user: ${userData.userName}`);
            } else {
                bcrypt.compare(userData.password, users[0].password).then((result) => {
                    if (result === true) {
                        resolve(users[0]);
                    } else {
                        reject(`Incorrect Password for user: ${userData.userName}`);
                    }
                 });
                users[0].loginHistory.push({
                    "dateTime": new Date().toString(),
                    "userAgent": userData.userAgent
                })
                User.updateOne(
                    { "userName": users[0].userName },
                    { "$set": {"loginHistory": users[0].loginHistory} },
                    { "multi": false }
                ).exec().then(() => {
                    resolve(users[0]);
                }).catch((err) => {
                    reject(`There was an error verifying the user: ${err}`)
                })
            }
        }).catch(() => {
            reject(`Unable to find user: ${userData.userName}`);
        });
    })
}
