const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  ID: {
    type: Number,
    required: true
  },
  Product_Name: {
    type: String,
    required: true
  },
  Product_Description: {
    type: String,
    required: true
  },
  Product_Rating: {
    type: Number,
    required: true
  },
  get_product_category: {
    ID: {
      type: Number,
      required: true
    },
    Product_Category: {
      type: String,
      required: true
    },
    Picture_Url: {
      type: String,
      required: true
    }
  },
  Attribute_Combination: {
    type: String,
    required: true
  },
  Product_Price: {
    type: Number,
    required: true
  },
  Product_Discount_Price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  }
});

const cartSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  cart: [cartItemSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
cartSchema.index({ email: 1 });

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart; 