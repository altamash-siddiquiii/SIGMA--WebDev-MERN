// First major project - WanderLust

// Importing the Express framework to create a web application and initializing express app
const express = require('express'); const app = express();
// Importing Mongoose to interact with MongoDB
const mongoose = require('mongoose');
// Importing the 'path' module to work with file and directory paths
const path = require("path");
// Importing the Listing model to interact with the 'listings' collection in MongoDB
const Listing = require("./models/listing.js");
// Importing method-override to use HTTP verbs such as PUT or DELETE in places where the client doesn't support it
const methodOverride = require("method-override");
// Importing ejs-mate to use EJS layouts and partials more efficiently
const ejsMate = require("ejs-mate");
// Importing the wrapAsync function to handle async errors
const wrapAsync = require("./utils/wrapAsync.js");
// Importing the custom error class to handle app-specific errors
const MyExpressErr = require("./utils/MyExpressErr.js");
// // Importing Joi validation schema to validate listings
const { listingSchema } = require("./schema_joi.js");

// Setting the view engine to EJS to render dynamic HTML templates
app.set("view engine", "ejs");
// Setting the directory for the EJS views
app.set("views", path.join(__dirname, "/views"));

// Middleware to parse incoming requests with URL-encoded payloads (from forms)
app.use(express.urlencoded({ extended: true }));
// Middleware to override HTTP methods using a query parameter or form input
app.use(methodOverride("_method"));
// Serving static files from the 'public' directory
app.use(express.static(path.join(__dirname, "/public")));

// Setting ejsMate as the template engine to use EJS layouts
app.engine("ejs", ejsMate);

// Validating listing data with Joi schema and handling errors if validation fails
const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((elmnt) => elmnt.message).join(", ");

        throw new MyExpressErr(400, errMsg);
    } else {
        next();
    }
};

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
app.get('/', (req, res) => {
    res.render("listings/home.ejs");
});
// app.get("/testlisting", async (req, res) => {
//     let sampleListing = new Listing({
//         title: "Sample Listing",
//         description: "My new Listing",
//         price: 1200,
//         location: "Delhi",
//         country: "India"
//     });
//     await sampleListing.save();
//     console.log("Samole listing was saved.");
//     res.send("Successful testing.");
// });

// index route - Show all listings
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find();

    res.render("listings/index.ejs", { allListings });
}));

// Create route - Render form to create a new listing
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});
// Create route - Add new listing to the database
app.post("/listings", validateListing, wrapAsync(async (req, res) => {
    let listing = req.body.listing;
    let newListing = new Listing(listing);
    await newListing.save();

    res.redirect("/listings");
}));

// Show route - Show details of one specific listing
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);

    res.render("listings/show.ejs", { listing });
}));

// Edit route - Render form to edit a specific listing
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);

    res.render("listings/edit.ejs", { listing });
}));
// Edit route - Update a specific listing in the database
app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let updatedListing = req.body.listing;
    await Listing.findByIdAndUpdate(id, {...updatedListing});

    res.redirect(`/listings/${id}`);
}));

// Delete route - Remove a specific listing from the database
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log("Deleted Listing :", deletedListing);

    res.redirect("/listings");
}));

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