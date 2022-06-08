//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require('mongoose');


const homeStartingContent = "Welcome to the Open Forum. All post shared here will be beamed to the UFOs. They are watching.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

// let posts = [];
mongoose.connect("mongodb+srv://admin-andrew:H6ik4i4PJaFKnLIm@cluster0.nhwux.mongodb.net/blogDB", {
    useNewUrlParser: true
});
// mongoose.connect("mongodb://localhost:27017/blogDB");

const postSchema = {
    title: String,
    content: String,
    date: {
        type: Date,
        default: Date.now
    }
};

const Post = mongoose.model("Post", postSchema);


app.get("/", function (req, res) {

    Post.find({}, function (err, posts) {

        const sortedPosts = posts.sort(function (a, b) {
            return b.date - a.date;
        });


        res.render("home", {
            startingContent: homeStartingContent,
            posts: sortedPosts,
            weekday: weekday
        });

    })
});

app.get("/about", function (req, res) {
    res.render("about", {
        aboutContent: aboutContent
    });
});

app.get("/contact", function (req, res) {
    res.render("contact", {
        contactContent: contactContent
    });
});

app.get("/compose", function (req, res) {
    res.render("compose");
});

app.post("/compose", function (req, res) {

    const post = new Post({
        title: req.body.postTitle,
        content: req.body.postBody
    });

    post.save(function (err) {

        if (!err) {
            res.redirect("/");
        }
    });


});

// app.post("/postDelete", function (req, res) {
//     const postId = req.body.postId;

//     Post.findByIdAndRemove(postId, function (err) {
//         if (!err) {
//             console.log("Successfully deleted post.");
//             res.redirect("/");
//         }
//     });
// });


const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
app.get("/posts/:postId", function (req, res) {
    const requestedPostId = req.params.postId;

    Post.findOne({
        _id: requestedPostId
    }, function (err, post) {

        res.render("post", {
            _id: requestedPostId,
            title: post.title,
            content: post.content,
            date: post.date,
            weekday: weekday
        });
    });

});

app.post("/posts/:postId/edit", function (req, res) {
    const requestedPostId = req.params.postId;

    Post.findOne({
        _id: requestedPostId
    }, function (err, post) {

        res.render("edit", {
            _id: requestedPostId,
            title: post.title,
            content: post.content
        });
    });
});

app.post("/posts/:postId/save", function (req, res) {
    const requestedPostId = req.params.postId;

    Post.updateOne({
        _id: requestedPostId
    }, {
        title: req.body.postTitle,
        content: req.body.postBody
    }, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("Post was successfully updated.")
        }
    });

    res.redirect("/posts/" + requestedPostId);
});



// This post will take the editted post and save to db
// app.post("/editPost", function (req, res) {

//     const post = new Post({
//         title: req.body.postTitle,
//         content: req.body.postBody
//     });

//     post.save(function (err) {

//         if (!err) {
//             res.redirect("/");
//         }
//     });


// });

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}
app.listen(port, function () {
    console.log("Server started successfully.");

});