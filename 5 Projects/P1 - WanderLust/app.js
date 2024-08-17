// First major project - WanderLust

const express = require('express'); const app = express(); // Importing the Express framework to create a web application and initializing express app
const mongoose = require('mongoose'); // Importing Mongoose to interact with MongoDB
const path = require("path"); // Importing the 'path' module to work with file and directory paths
const methodOverride = require("method-override"); // Importing method-override to use HTTP verbs such as PUT or DELETE in places where the client doesn't support it
const ejsMate = require("ejs-mate"); // Importing ejs-mate to use EJS layouts and partials more efficiently
const MyExpressErr = require("./utils/MyExpressErr.js"); // Importing the custom error class to handle app-specific errors
const listingRoutes = require("./routes/listing.js");
const reviewRoutes = require("./routes/review.js");

app.set("view engine", "ejs"); // Setting the view engine to EJS to render dynamic HTML templates
app.set("views", path.join(__dirname, "/views")); // Setting the directory for the EJS views
app.use(express.urlencoded({ extended: true })); // Middleware to parse incoming requests with URL-encoded payloads (from forms)
app.use(methodOverride("_method")); // Middleware to override HTTP methods using a query parameter or form input
app.use(express.static(path.join(__dirname, "/public"))); // Serving static files from the 'public' directory
app.use("/listings", listingRoutes);
app.use("/listings/:id/reviews", reviewRoutes);

app.engine("ejs", ejsMate); // Setting ejsMate as the template engine to use EJS layouts

// Connecting to the MongoDB database using Mongoose
async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}
main().then((res) => {
    console.log("Connection successful.");
}).catch((err) => {
    console.log(err);
});


// Starting the server on 8080 port
app.listen(8080, () => {
    console.log("App is listening on 8080 port...");
});

// Defining the root path route
app.get("/", (req, res) => {
    res.render("listings/home.ejs");
});

// Catching all undefined routes and throwing a 404 error.
app.all("*", (req, res, next) => {
    next(new MyExpressErr(404, "Page Not Found!"));
});

// Global error handling middleware
app.use( (err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;

    res.status(statusCode).render("error.ejs", { err });
    // res.status(statusCode).send(message);
});