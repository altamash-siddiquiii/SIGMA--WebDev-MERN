const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initData = require("./data.js");

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}
main().then((res) => {
    console.log("Connection successful.");
}).catch((err) => {
    console.log(err);
});

const initDB = async () => {
    await Listing.deleteMany();

    await Listing.insertMany(initData.data);
    console.log("Data was initialized.");
}

initDB();