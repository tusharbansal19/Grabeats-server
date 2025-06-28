const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema({
  ID: {
    type: Number,
    required: true,
    unique: true
  },
  Product_Name: {
    type: String,
    required: true,
    trim: true
  },
  Product_Description: {
    type: String,
    required: true
  },
  Product_Rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5,
    default: 0
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
  get_all_products: [{
    Product_ID: {
      type: Number,
      required: true
    },
    Picture_URL: {
      type: String,
      required: true
    },
    Attribute_Combination: {
      type: String,
      required: true
    },
    Product_Price: {
      type: Number,
      required: true,
      min: 0
    },
    Product_Discount_Price: {
      type: Number,
      required: true,
      min: 0
    }
  }],
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

// Index for better search performance
dishSchema.index({ Product_Name: 'text', Product_Description: 'text' });
dishSchema.index({ 'get_product_category.Product_Category': 1 });
dishSchema.index({ Product_Rating: -1 });

const Dish = mongoose.model('Dish', dishSchema);

module.exports = Dish; 