const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const router = express.Router();
const PORT = process.env.PORT || 8000;

// ==================== USER MODEL ====================
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    match: [/^\d{10}$/, 'Please provide a valid 10-digit phone number']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
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

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = Date.now();
  return this.save();
};

const User = mongoose.model('User', userSchema);

// ==================== DISHES DATA ====================

// Sample dishes data
const dishes = [
    {
        ID: 24,
        Product_Name: "Cauliflower Pizza",
        Product_Description: "A gluten-free pizza base made from cauliflower.",
        Product_Rating: 4.3,
        get_product_category: {
            ID: 406,
            Product_Category: "Pizza",
            Picture_Url: "https://thumbs.dreamstime.com/b/cauliflower-pizza-crust-gluten-free-healthy-alternative-traditional-pizza-base-close-up-view-216123456.jpg"
        },
        get_all_products: [
            {
                Product_ID: 1037,
                Picture_URL: "https://thumbs.dreamstime.com/b/pizza-large-extra-toppings-close-up-view-216123457.jpg",
                Attribute_Combination: "Large, Extra Toppings",
                Product_Price: 12.99,
                Product_Discount_Price: 10.99
            },
            {
                Product_ID: 1038,
                Picture_URL: "https://thumbs.dreamstime.com/b/pizza-small-no-toppings-close-up-view-216123458.jpg",
                Attribute_Combination: "Small, No Toppings",
                Product_Price: 8.99,
                Product_Discount_Price: 7.49
            }
        ]
    },
    {
        ID: 28,
        Product_Name: "Greek Salad",
        Product_Description: "A fresh salad with tomatoes, cucumber, olives, and feta cheese.",
        Product_Rating: 4.4,
        get_product_category: {
            ID: 410,
            Product_Category: "Salad",
            Picture_Url: "https://thumbs.dreamstime.com/b/greek-salad-fresh-tomatoes-cucumber-olives-feta-cheese-216123459.jpg"
        },
        get_all_products: [
            {
                Product_ID: 1045,
                Picture_URL: "https://thumbs.dreamstime.com/b/greek-salad-large-extra-feta-216123460.jpg",
                Attribute_Combination: "Large, Extra Feta",
                Product_Price: 9.99,
                Product_Discount_Price: 7.99
            },
            {
                Product_ID: 1046,
                Picture_URL: "https://thumbs.dreamstime.com/b/greek-salad-small-no-feta-216123461.jpg",
                Attribute_Combination: "Small, No Feta",
                Product_Price: 6.99,
                Product_Discount_Price: 5.99
            }
        ]
    },
    {
        ID: 25,
        Product_Name: "Quinoa Bowl",
        Product_Description: "A nutritious bowl of quinoa with vegetables and spices.",
        Product_Rating: 4.6,
        get_product_category: {
            ID: 407,
            Product_Category: "Salad",
            Picture_Url: "https://thumbs.dreamstime.com/b/quinoa-bowl-nutritious-vegetables-spices-216123462.jpg"
        },
        get_all_products: [
            {
                Product_ID: 1039,
                Picture_URL: "https://thumbs.dreamstime.com/b/quinoa-bowl-large-extra-avocado-216123463.jpg",
                Attribute_Combination: "Large, Extra Avocado",
                Product_Price: 11.99,
                Product_Discount_Price: 9.99
            },
            {
                Product_ID: 1040,
                Picture_URL: "https://thumbs.dreamstime.com/b/quinoa-bowl-small-no-avocado-216123464.jpg",
                Attribute_Combination: "Small, No Avocado",
                Product_Price: 7.99,
                Product_Discount_Price: 6.49
            }
        ]
    },
    {
        ID: 22,
        Product_Name: "Vegetable Stir Fry",
        Product_Description: "A colorful mix of vegetables sautéed with soy sauce.",
        Product_Rating: 4.5,
        get_product_category: {
            ID: 404,
            Product_Category: "Main Course",
            Picture_Url: "https://thumbs.dreamstime.com/b/vegetable-stir-fry-colorful-vegetables-sauteed-soy-sauce-216123465.jpg"
        },
        get_all_products: [
            {
                Product_ID: 1033,
                Picture_URL: "https://thumbs.dreamstime.com/b/stir-fry-large-extra-sauce-216123466.jpg",
                Attribute_Combination: "Large, Extra Sauce",
                Product_Price: 10.99,
                Product_Discount_Price: 8.99
            },
            {
                Product_ID: 1034,
                Picture_URL: "https://thumbs.dreamstime.com/b/stir-fry-small-no-sauce-216123467.jpg",
                Attribute_Combination: "Small, No Sauce",
                Product_Price: 7.99,
                Product_Discount_Price: 6.49
            }
        ]
    },
    {
        ID: 26,
        Product_Name: "Spinach Lasagna",
        Product_Description: "Layers of pasta, spinach, and ricotta cheese.",
        Product_Rating: 4.7,
        get_product_category: {
            ID: 408,
            Product_Category: "Main Course",
            Picture_Url: "https://thumbs.dreamstime.com/b/spinach-lasagna-layers-pasta-spinach-ricotta-cheese-216123468.jpg"
        },
        get_all_products: [
            {
                Product_ID: 1041,
                Picture_URL: "https://thumbs.dreamstime.com/b/lasagna-large-extra-cheese-216123469.jpg",
                Attribute_Combination: "Large, Extra Cheese",
                Product_Price: 13.99,
                Product_Discount_Price: 11.99
            },
            {
                Product_ID: 1042,
                Picture_URL: "https://thumbs.dreamstime.com/b/lasagna-small-no-cheese-216123470.jpg",
                Attribute_Combination: "Small, No Cheese",
                Product_Price: 9.99,
                Product_Discount_Price: 7.99
            }
        ]
    },
    {
        ID: 34,
        Product_Name: "Baked Ziti",
        Product_Description: "Ziti pasta baked with marinara sauce and cheese.",
        Product_Rating: 4.6,
        get_product_category: {
            ID: 416,
            Product_Category: "Pasta",
            Picture_Url: "https://thumbs.dreamstime.com/b/baked-ziti-pasta-marinara-sauce-cheese-216123471.jpg"
        },
        get_all_products: [
            {
                Product_ID: 1057,
                Picture_URL: "https://thumbs.dreamstime.com/b/ziti-large-extra-marinara-216123472.jpg",
                Attribute_Combination: "Large, Extra Marinara",
                Product_Price: 13.99,
                Product_Discount_Price: 11.99
            },
            {
                Product_ID: 1058,
                Picture_URL: "https://thumbs.dreamstime.com/b/ziti-small-no-marinara-216123473.jpg",
                Attribute_Combination: "Small, No Marinara",
                Product_Price: 9.99,
                Product_Discount_Price: 7.99
            }
        ]
    },
    {
        ID: 33,
        Product_Name: "Pasta Primavera",
        Product_Description: "Pasta tossed with fresh vegetables and olive oil.",
        Product_Rating: 4.9,
        get_product_category: {
            ID: 415,
            Product_Category: "Pasta",
            Picture_Url: "https://thumbs.dreamstime.com/b/pasta-primavera-fresh-vegetables-olive-oil-216123474.jpg"
        },
        get_all_products: [
            {
                Product_ID: 1055,
                Picture_URL: "https://thumbs.dreamstime.com/b/pasta-large-extra-olive-oil-216123475.jpg",
                Attribute_Combination: "Large, Extra Olive Oil",
                Product_Price: 12.99,
                Product_Discount_Price: 10.99
            },
            {
                Product_ID: 1056,
                Picture_URL: "https://thumbs.dreamstime.com/b/pasta-small-no-olive-oil-216123476.jpg",
                Attribute_Combination: "Small, No Olive Oil",
                Product_Price: 8.99,
                Product_Discount_Price: 7.49
            }
        ]
    },
    {
        ID: 23,
        Product_Name: "Mushroom Risotto",
        Product_Description: "Creamy risotto with fresh mushrooms and herbs.",
        Product_Rating: 4.9,
        get_product_category: {
            ID: 405,
            Product_Category: "Main Course",
            Picture_Url: "https://thumbs.dreamstime.com/b/mushroom-risotto-creamy-fresh-mushrooms-herbs-216123477.jpg"
        },
        get_all_products: [
            {
                Product_ID: 1035,
                Picture_URL: "https://thumbs.dreamstime.com/b/risotto-large-extra-parmesan-216123478.jpg",
                Attribute_Combination: "Large, Extra Parmesan",
                Product_Price: 14.99,
                Product_Discount_Price: 12.99
            },
            {
                Product_ID: 1036,
                Picture_URL: "https://thumbs.dreamstime.com/b/risotto-small-no-parmesan-216123479.jpg",
                Attribute_Combination: "Small, No Parmesan",
                Product_Price: 9.99,
                Product_Discount_Price: 8.49
            }
        ]
    },
    {
        ID: 29,
        Product_Name: "Lentil Soup",
        Product_Description: "A hearty soup made with lentils and spices.",
        Product_Rating: 4.6,
        get_product_category: {
            ID: 411,
            Product_Category: "Soup",
            Picture_Url: "https://thumbs.dreamstime.com/b/lentil-soup-hearty-lentils-spices-216123480.jpg"
        },
        get_all_products: [
            {
                Product_ID: 1047,
                Picture_URL: "https://thumbs.dreamstime.com/b/lentil-large-extra-spices-216123481.jpg",
                Attribute_Combination: "Large, Extra Spices",
                Product_Price: 8.99,
                Product_Discount_Price: 7.49
            },
            {
                Product_ID: 1048,
                Picture_URL: "https://thumbs.dreamstime.com/b/lentil-small-no-spices-216123482.jpg",
                Attribute_Combination: "Small, No Spices",
                Product_Price: 5.99,
                Product_Discount_Price: 4.99
            }
        ]
    },
    {
        ID: 27,
        Product_Name: "Eggplant Parmesan",
        Product_Description: "Baked eggplant with marinara sauce and cheese.",
        Product_Rating: 4.5,
        get_product_category: {
            ID: 409,
            Product_Category: "Main Course",
            Picture_Url: "https://thumbs.dreamstime.com/b/eggplant-parmesan-baked-marinara-sauce-cheese-216123483.jpg"
        },
        get_all_products: [
            {
                Product_ID: 1043,
                Picture_URL: "https://thumbs.dreamstime.com/b/eggplant-large-extra-marinara-216123484.jpg",
                Attribute_Combination: "Large, Extra Marinara",
                Product_Price: 12.99,
                Product_Discount_Price: 10.99
            },
            {
                Product_ID: 1044,
                Picture_URL: "https://thumbs.dreamstime.com/b/eggplant-small-no-marinara-216123485.jpg",
                Attribute_Combination: "Small, No Marinara",
                Product_Price: 8.99,
                Product_Discount_Price: 7.49
            }
        ]
    }
];

// ==================== CART DATA ====================

// Sample cart data
const carts = [
    {
        email: "anutushi10@gmail.com",
        cart: [
            {
                ID: 24,
                Product_Name: "Cauliflower Pizza",
                Product_Description: "A gluten-free pizza base made from cauliflower.",
                Product_Rating: 4.3,
                get_product_category: {
                    ID: 406,
                    Product_Category: "Pizza",
                    Picture_Url: "https://example.com/images/cauliflower_pizza.jpg"
                },
                Attribute_Combination: "Large, Extra Toppings",
                Product_Price: 12.99,
                Product_Discount_Price: 10.99,
                image: "https://example.com/images/pizza_large.jpg",
                quantity: 2
            }
        ]
    }
];

// ==================== MIDDLEWARE ====================

// Protect routes
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// ==================== VALIDATION MIDDLEWARE ====================
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phone')
    .matches(/^\d{10}$/)
    .withMessage('Please provide a valid 10-digit phone number')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .matches(/^\d{10}$/)
    .withMessage('Please provide a valid 10-digit phone number')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

// ==================== CONTROLLERS ====================

// Register user
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone
    });

    // Create token
    const token = user.getSignedJwtToken();

    // Remove password from response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Create token
    const token = user.getSignedJwtToken();

    // Remove password from response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get current logged in user
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ==================== ROUTES ====================

// Auth routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/f', (req, res) => {
  res.send("hello");
});
router.post('/logout', protect, logout);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfileValidation, updateProfile);
router.put('/change-password', protect, changePasswordValidation, changePassword);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'GrabEats Auth Server is running',
    timestamp: new Date().toISOString()
  });
});

// ==================== DISH ROUTES ====================

// GET /grabeats/get - Get all dishes
router.get('/get', (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Dishes retrieved successfully',
            data: dishes,
            count: dishes.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving dishes',
            error: error.message
        });
    }
});

// GET /grabeats/dishes/:id - Get dish by ID
router.get('/dishes/:id', (req, res) => {
    try {
        const dishId = parseInt(req.params.id);
        const dish = dishes.find(d => d.ID === dishId);
        
        if (!dish) {
            return res.status(404).json({
                success: false,
                message: 'Dish not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Dish retrieved successfully',
            data: dish
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving dish',
            error: error.message
        });
    }
});

// GET /grabeats/dishes/category/:category - Get dishes by category
router.get('/dishes/category/:category', (req, res) => {
    try {
        const category = req.params.category;
        const categoryDishes = dishes.filter(dish => 
            dish.get_product_category.Product_Category.toLowerCase() === category.toLowerCase()
        );
        
        res.json({
            success: true,
            message: `Dishes in category '${category}' retrieved successfully`,
            data: categoryDishes,
            count: categoryDishes.length,
            category: category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving dishes by category',
            error: error.message
        });
    }
});

// GET /grabeats/dishes/search/:query - Search dishes by name or description
router.get('/dishes/search/:query', (req, res) => {
    try {
        const query = req.params.query.toLowerCase();
        const searchResults = dishes.filter(dish => 
            dish.Product_Name.toLowerCase().includes(query) ||
            dish.Product_Description.toLowerCase().includes(query)
        );
        
        res.json({
            success: true,
            message: `Search results for '${query}'`,
            data: searchResults,
            count: searchResults.length,
            query: query
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error searching dishes',
            error: error.message
        });
    }
});

// GET /grabeats/dishes/rating/:rating - Get dishes by minimum rating
router.get('/dishes/rating/:rating', (req, res) => {
    try {
        const minRating = parseFloat(req.params.rating);
        const ratedDishes = dishes.filter(dish => dish.Product_Rating >= minRating);
        
        res.json({
            success: true,
            message: `Dishes with rating >= ${minRating}`,
            data: ratedDishes,
            count: ratedDishes.length,
            minRating: minRating
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving dishes by rating',
            error: error.message
        });
    }
});

// GET /grabeats/categories - Get all unique categories
router.get('/categories', (req, res) => {
    try {
        const categories = [...new Set(dishes.map(dish => dish.get_product_category.Product_Category))];
        
        res.json({
            success: true,
            message: 'Categories retrieved successfully',
            data: categories,
            count: categories.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving categories',
            error: error.message
        });
    }
});

// GET /grabeats/dishes/price-range - Get dishes within price range
router.get('/dishes/price-range', (req, res) => {
    try {
        const { min, max } = req.query;
        const minPrice = min ? parseFloat(min) : 0;
        const maxPrice = max ? parseFloat(max) : Infinity;
        
        const priceRangeDishes = dishes.filter(dish => {
            const minDishPrice = Math.min(...dish.get_all_products.map(p => p.Product_Discount_Price));
            return minDishPrice >= minPrice && minDishPrice <= maxPrice;
        });
        
        res.json({
            success: true,
            message: `Dishes within price range $${minPrice} - $${maxPrice === Infinity ? '∞' : maxPrice}`,
            data: priceRangeDishes,
            count: priceRangeDishes.length,
            priceRange: { min: minPrice, max: maxPrice === Infinity ? '∞' : maxPrice }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving dishes by price range',
            error: error.message
        });
    }
});

// GET /grabeats/dishes/featured - Get featured dishes (highly rated)
router.get('/dishes/featured', (req, res) => {
    try {
        const featuredDishes = dishes
            .filter(dish => dish.Product_Rating >= 4.5)
            .sort((a, b) => b.Product_Rating - a.Product_Rating)
            .slice(0, 6); // Top 6 featured dishes
        
        res.json({
            success: true,
            message: 'Featured dishes retrieved successfully',
            data: featuredDishes,
            count: featuredDishes.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving featured dishes',
            error: error.message
        });
    }
});

// GET /grabeats/dishes/popular - Get popular dishes (based on rating and price)
router.get('/dishes/popular', (req, res) => {
    try {
        const popularDishes = dishes
            .map(dish => ({
                ...dish,
                popularityScore: dish.Product_Rating * (1 / Math.min(...dish.get_all_products.map(p => p.Product_Discount_Price)))
            }))
            .sort((a, b) => b.popularityScore - a.popularityScore)
            .slice(0, 8) // Top 8 popular dishes
            .map(dish => {
                const { popularityScore, ...dishWithoutScore } = dish;
                return dishWithoutScore;
            });
        
        res.json({
            success: true,
            message: 'Popular dishes retrieved successfully',
            data: popularDishes,
            count: popularDishes.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving popular dishes',
            error: error.message
        });
    }
});

// GET /grabeats/dishes/on-sale - Get dishes with discounts
router.get('/dishes/on-sale', (req, res) => {
    try {
        const onSaleDishes = dishes.filter(dish => 
            dish.get_all_products.some(product => product.Product_Discount_Price < product.Product_Price)
        );
        
        res.json({
            success: true,
            message: 'Dishes on sale retrieved successfully',
            data: onSaleDishes,
            count: onSaleDishes.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving dishes on sale',
            error: error.message
        });
    }
});

// ==================== CART ROUTES ====================

// GET /grabeats/mycart/get - Get user cart
router.get('/mycart/get', (req, res) => {
  const { email } = req.query;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
      error: 'No email provided'
    });
  }

  try {
    // Find cart for the given email
    const userCart = carts.find(cart => cart.email === email);
    
    if (!userCart) {
      return res.json({
        success: true,
        message: 'Cart retrieved successfully',
        data: {
          email: email,
          cart: [],
          totalItems: 0,
          totalPrice: 0
        }
      });
    }

    const totalItems = userCart.cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = userCart.cart.reduce((sum, item) => sum + (item.Product_Discount_Price * item.quantity), 0);

    res.json({
      success: true,
      message: 'Cart retrieved successfully',
      data: {
        email: email,
        cart: userCart.cart,
        totalItems: totalItems,
        totalPrice: totalPrice
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving cart',
      error: error.message
    });
  }
});

// POST /grabeats/mycart/add - Add item to cart
router.post('/mycart/add', (req, res) => {
  const { email, item } = req.body;
  
  if (!email || !item) {
    return res.status(400).json({
      success: false,
      message: 'Email and item are required',
      error: 'Missing required fields'
    });
  }

  try {
    let userCart = carts.find(cart => cart.email === email);
    
    if (!userCart) {
      // Create new cart for user
      userCart = {
        email: email,
        cart: []
      };
      carts.push(userCart);
    }

    // Check if item already exists in cart
    const existingItemIndex = userCart.cart.findIndex(cartItem => 
      cartItem.ID === item.ID && cartItem.Attribute_Combination === item.Attribute_Combination
    );

    if (existingItemIndex !== -1) {
      // Update quantity if item exists
      userCart.cart[existingItemIndex].quantity += item.quantity || 1;
    } else {
      // Add new item to cart
      userCart.cart.push({
        ...item,
        quantity: item.quantity || 1
      });
    }

    const totalItems = userCart.cart.reduce((sum, cartItem) => sum + cartItem.quantity, 0);
    const totalPrice = userCart.cart.reduce((sum, cartItem) => sum + (cartItem.Product_Discount_Price * cartItem.quantity), 0);

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      data: {
        email: email,
        cart: userCart.cart,
        totalItems: totalItems,
        totalPrice: totalPrice
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding item to cart',
      error: error.message
    });
  }
});

// PUT /grabeats/mycart/update - Update item quantity in cart
router.put('/mycart/update', (req, res) => {
  const { email, itemId, attributeCombination, quantity } = req.body;
  
  if (!email || !itemId || !attributeCombination || quantity === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Email, itemId, attributeCombination, and quantity are required',
      error: 'Missing required fields'
    });
  }

  try {
    const userCart = carts.find(cart => cart.email === email);
    
    if (!userCart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
        error: 'No cart exists for this email'
      });
    }

    const itemIndex = userCart.cart.findIndex(item => 
      item.ID === itemId && item.Attribute_Combination === attributeCombination
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart',
        error: 'Item does not exist in cart'
      });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      userCart.cart.splice(itemIndex, 1);
    } else {
      // Update quantity
      userCart.cart[itemIndex].quantity = quantity;
    }

    const totalItems = userCart.cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = userCart.cart.reduce((sum, item) => sum + (item.Product_Discount_Price * item.quantity), 0);

    res.json({
      success: true,
      message: 'Cart updated successfully',
      data: {
        email: email,
        cart: userCart.cart,
        totalItems: totalItems,
        totalPrice: totalPrice
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating cart',
      error: error.message
    });
  }
});

// DELETE /grabeats/mycart/remove - Remove item from cart
router.delete('/mycart/remove', (req, res) => {
  const { email, itemId, attributeCombination } = req.body;
  
  if (!email || !itemId || !attributeCombination) {
    return res.status(400).json({
      success: false,
      message: 'Email, itemId, and attributeCombination are required',
      error: 'Missing required fields'
    });
  }

  try {
    const userCart = carts.find(cart => cart.email === email);
    
    if (!userCart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
        error: 'No cart exists for this email'
      });
    }

    const itemIndex = userCart.cart.findIndex(item => 
      item.ID === itemId && item.Attribute_Combination === attributeCombination
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart',
        error: 'Item does not exist in cart'
      });
    }

    // Remove item from cart
    userCart.cart.splice(itemIndex, 1);

    const totalItems = userCart.cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = userCart.cart.reduce((sum, item) => sum + (item.Product_Discount_Price * item.quantity), 0);

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      data: {
        email: email,
        cart: userCart.cart,
        totalItems: totalItems,
        totalPrice: totalPrice
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing item from cart',
      error: error.message
    });
  }
});

// DELETE /grabeats/mycart/clear - Clear entire cart
router.delete('/mycart/clear', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
      error: 'No email provided'
    });
  }

  try {
    const userCart = carts.find(cart => cart.email === email);
    
    if (!userCart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
        error: 'No cart exists for this email'
      });
    }

    // Clear cart
    userCart.cart = [];

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: {
        email: email,
        cart: [],
        totalItems: 0,
        totalPrice: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error clearing cart',
      error: error.message
    });
  }
});

// Export middleware for use in other routes
module.exports = {
  router,
  protect,
  authorize,
  User
}; 