// Database Relationships

// Importing the mongoose library for MongoDB interactions
const mongoose = require("mongoose");
const { Schema } = mongoose;

// Async function to establish a connection to the MongoDB database
async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/relationDemo");
}
main()
    .then(() => console.log("Connection successful."))
    .catch((err) => console.log(err));

// Mongo Relationships

// One to many - Approach 2
// Defining the schema for the Order collection
const orderSchema = new Schema({
    itemName: String,
    price: Number
});

// Defining the schema for the Customer collection
const customerSchema = new Schema({
    custName: String,
    orders: [
        {
            type: Schema.Types.ObjectId, // Reference to the Order collection
            ref: "Order"                 // Name of the model being referenced
        }
    ]
});

// Creating models for Order and Customer collections
const Order = mongoose.model("Order", orderSchema);
const Customer = mongoose.model("Customer", customerSchema);

// Async function to add multiple orders to the collection
const addOrders = async () => {
    let addedOrders = await Order.insertMany([
        { itemName: "Samosa", price: 8 },
        { itemName: "Chips", price: 10 },
        { itemName: "Chocolate", price: 40 }
    ]);
    console.log(addedOrders);
}
// addOrders(); // Uncomment to add orders to the database

// Async function to add a customer and link their orders
const addCustomers = async () => {
    let customer1 = new Customer({
        custName: "Roman"
    });
    
    // Finding specific orders by itemName
    let order1 = await Order.findOne({ itemName: "Chips" });
    let order2 = await Order.findOne({ itemName: "Chocolate" });

    // Adding the orders to the customer's orders array
    customer1.orders.push(order1);
    customer1.orders.push(order2);

    // Saving the customer to the database
    let addedCustomer = await customer1.save();
    console.log(addedCustomer);
}
// addCustomers(); // Uncomment to add the customer and their orders to the database

// Async function to find customers and populate their orders
const findCustomers = async () => {
    let customers = await Customer.find().populate("orders");
    console.log(customers[0]); // Logging the first customer with populated orders
}
findCustomers(); // Calling the function to find and display customers with their orders