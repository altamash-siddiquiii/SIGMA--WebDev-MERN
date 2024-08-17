const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing.js"); // Importing the Listing model to interact with the 'listings' collection in MongoDB
const Review = require("../models/review.js"); // Importing the Review model to store reviews for a listing
const wrapAsync = require("../utils/wrapAsync.js"); // Importing the wrapAsync function to handle async errors
const MyExpressErr = require("../utils/MyExpressErr.js"); // Importing the custom error class to handle app-specific errors
const { reviewSchema } = require("../schema_joi.js"); // Importing Joi validation schemas to validate reviews

// Validating review data with Joi schema and handling errors if validation fails
const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((elmnt) => elmnt.message).join(", ");

        throw new MyExpressErr(400, errMsg);
    } else {
        next();
    }
};

// Review route - Adding reviews to the listing
router.post("/", validateReview, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    console.log(`Review added for '${listing.title}'`);

    res.redirect(`/listings/${listing._id}`);
}));

// Delete Review route - Remove reviews from the listing
router.delete("/:reviewId", wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    console.log(`Review deleted from the listing.`);

    res.redirect(`/listings/${id}`);
}));

module.exports = router;