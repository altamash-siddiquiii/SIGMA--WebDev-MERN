const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

// Schema for listing
const listingSchema = new Schema({
    title: {
        type: String,
        require: true
    },
    description: String,
    image: {
        type: String,
        default: "https://images.unsplash.com/photo-1663790682196-926e224c50a7?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        set: (v) => v === "" ? "https://images.unsplash.com/photo-1663790682196-926e224c50a7?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" : v
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
});

// Mongoose Middleware - To delete associated reviews when a listing is deleted
listingSchema.post("findOneAndDelete", async (listingData) => {
    if (listingData) {
        await Review.deleteMany({ _id: {$in: listingData.reviews} });
    }
});

const Listing = mongoose.model("Listing", listingSchema );

module.exports = Listing;