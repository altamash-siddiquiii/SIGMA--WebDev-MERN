const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js"); // Importing the Listing model to interact with the 'listings' collection in MongoDB
const wrapAsync = require("../utils/wrapAsync.js"); // Importing the wrapAsync function to handle async errors
const MyExpressErr = require("../utils/MyExpressErr.js"); // Importing the custom error class to handle app-specific errors
const { listingSchema } = require("../schema_joi.js"); // Importing Joi validation schemas to validate listings

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

// Index route - Show all listings
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find();

    res.render("listings/index.ejs", { allListings });
}));

// Create route - Render form to create a new listing
router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
});
// Create route - Add new listing to the database
router.post("/", validateListing, wrapAsync(async (req, res) => {
    let listing = req.body.listing;
    let newListing = new Listing(listing);
    await newListing.save();

    res.redirect("/listings");
}));

// Show route - Show details of one specific listing
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");

    res.render("listings/show.ejs", { listing });
}));

// Edit route - Render form to edit a specific listing
router.get("/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);

    res.render("listings/edit.ejs", { listing });
}));
// Edit route - Update a specific listing in the database
router.put("/:id", validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let updatedListing = req.body.listing;
    await Listing.findByIdAndUpdate(id, {...updatedListing});

    res.redirect(`/listings/${id}`);
}));

// Delete route - Remove a specific listing from the database
router.delete("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log("Deleted Listing :", deletedListing);

    res.redirect("/listings");
}));

module.exports = router;