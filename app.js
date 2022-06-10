//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require('mongoose');

// Use the const ONLINE to switch between online workflow and offline workflow. 
//      Offline workflow will include additional features such as deleting post. 
//      Remember to switch ONLINE to true before uploading to heroku.
const ONLINE = true;

const homeStartingContent = "Greetings, Springfield! Welcome to the Springfield Town Square open forum. It is with great pride that I place the safety of our city in the hands of the first four people who showed up. - Major Quimby";
const characters = ["Local Springfieldian",
    "Homer Simpson", "Marge Simpson", "Bart Simpson",
    "Lisa Simpson", "Otto Mann", "Apu Nahasapeemapetilon",
    "Chief Clancy Wiggum", "Milhouse Van Houten", "Moe Szyslak",
    "Mr. Burns", "Ned Flanders"
];


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));


// Select local DB or online DB
// mongoose.connect("mongodb://localhost:27017/blogDB");
mongoose.connect("mongodb+srv://admin-andrew:H6ik4i4PJaFKnLIm@cluster0.nhwux.mongodb.net/blogDB", {
    useNewUrlParser: true
});


const postSchema = {
    title: {
        type: String,
        trim: true,
        maxLength: [32, 'Title is too long']
    },
    content: String,
    date: {
        type: Date,
        default: Date.now
    },
    author: {
        type: String,
        default: characters[0],
        trim: true,
        maxLength: [32, 'Author name is too long']
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
    res.render("compose", {
        characters: characters
    });
});

app.post("/compose", function (req, res) {

    const post = new Post({
        title: req.body.postTitle,
        content: req.body.postBody,
        author: req.body.postAuthor
    });


    post.save(function (err) {

        if (!err) {
            res.redirect("/");
        }
    });


});

app.post("/postDelete", function (req, res) {
    const postId = req.body.postId;

    Post.findByIdAndRemove(postId, function (err) {
        if (!err) {
            console.log("Successfully deleted post.");
            res.redirect("/");
        }
    });
});

const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
app.get("/posts/:postId", function (req, res) {
    const requestedPostId = req.params.postId;

    Post.findOne({
        _id: requestedPostId
    }, function (err, post) {

        res.render("post", {
            _id: requestedPostId,
            title: post.title,
            author: post.author,
            content: post.content,
            date: post.date,
            weekday: weekday,
            ONLINE: ONLINE
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