const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  ID: Number,
  Product_Name: String,
  Product_Description: String,
  Product_Rating: Number,
  Product_Price: Number,
  Product_Discount_Price: Number,
  Attribute_Combination: String,
  get_product_category: {
    ID: Number,
    Product_Category: String,
    Picture_Url: String
  },
  Picture_URL: String
}, { _id: false });

const CartSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  products: [ProductSchema]
});

module.exports = mongoose.model('Cart', CartSchema); 