const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

// Import MongoDB models
const Dish = require('../models/Dish');
const Cart = require('../models/Cart');
const User = require('../models/User');

const router = express.Router();
const PORT = process.env.PORT || 8000;

// ==================== MIDDLEWARE ====================

// Note: Dishes and Carts are now stored in MongoDB using Dish and Cart models

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

// POST /auth/verify-otp - Verify OTP
router.post('/verify-otp', (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
        error: 'Missing required fields'
      });
    }

    // Mock OTP verification (replace with actual OTP verification logic)
    const isValidOTP = otp === '123456'; // Example: hardcoded OTP for testing
    
    if (!isValidOTP) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
        error: 'OTP verification failed'
      });
    }

    res.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        email: email,
        verified: true
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: error.message
    });
  }
});

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
router.get('/get', async (req, res) => {
    try {
        const dishes = await Dish.find({});
        
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

// GET /grabeats/get/:id - Get dish by ID
router.get('/get/:id', async (req, res) => {
    try {
        const dish = await Dish.findOne({ ID: parseInt(req.params.id) });
        
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

// GET /grabeats/category/:category - Get dishes by category
router.get('/category/:category', async (req, res) => {
    try {
        const category = req.params.category;
        const dishes = await Dish.find({
            'get_product_category.Product_Category': { 
                $regex: new RegExp(category, 'i') 
            }
        });
        
        res.json({
            success: true,
            message: `Dishes in ${category} category retrieved successfully`,
            data: dishes,
            count: dishes.length
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
router.get('/dishes/search/:query', async (req, res) => {
    try {
        const query = req.params.query;
        const searchResults = await Dish.find({
            $text: { $search: query }
        });
        
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
router.get('/dishes/rating/:rating', async (req, res) => {
    try {
        const minRating = parseFloat(req.params.rating);
        const ratedDishes = await Dish.find({
            Product_Rating: { $gte: minRating }
        });
        
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
router.get('/categories', async (req, res) => {
    try {
        const categories = await Dish.distinct('get_product_category.Product_Category');
        
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
router.get('/dishes/price-range', async (req, res) => {
    try {
        const { min, max } = req.query;
        const minPrice = min ? parseFloat(min) : 0;
        const maxPrice = max ? parseFloat(max) : Infinity;
        
        const priceRangeDishes = await Dish.find({
            'get_all_products.Product_Discount_Price': {
                $gte: minPrice,
                $lte: maxPrice === Infinity ? 999999 : maxPrice
            }
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
router.get('/dishes/featured', async (req, res) => {
    try {
        const featuredDishes = await Dish.find({
            Product_Rating: { $gte: 4.5 }
        })
        .sort({ Product_Rating: -1 })
        .limit(6);
        
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
router.get('/dishes/popular', async (req, res) => {
    try {
        const popularDishes = await Dish.aggregate([
            {
                $addFields: {
                    minPrice: { $min: '$get_all_products.Product_Discount_Price' }
                }
            },
            {
                $addFields: {
                    popularityScore: {
                        $multiply: ['$Product_Rating', { $divide: [1, '$minPrice'] }]
                    }
                }
            },
            {
                $sort: { popularityScore: -1 }
            },
            {
                $limit: 8
            },
            {
                $project: {
                    popularityScore: 0,
                    minPrice: 0
                }
            }
        ]);
        
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
router.get('/dishes/on-sale', async (req, res) => {
    try {
        const onSaleDishes = await Dish.find({
            $expr: {
                $gt: [
                    { $min: '$get_all_products.Product_Price' },
                    { $min: '$get_all_products.Product_Discount_Price' }
                ]
            }
        });
        
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

// POST /grabeats/dishes - Add new dish
router.post('/dishes', async (req, res) => {
    try {
        const newDish = req.body;
        
        // Create new dish in MongoDB
        const dish = await Dish.create(newDish);
        
        res.status(201).json({
            success: true,
            message: 'Dish added successfully',
            data: dish
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding dish',
            error: error.message
        });
    }
});

// PUT /grabeats/dishes/:id - Update dish
router.put('/dishes/:id', async (req, res) => {
    try {
        const dishId = parseInt(req.params.id);
        const updateData = req.body;
        
        const dish = await Dish.findOneAndUpdate(
            { ID: dishId },
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!dish) {
            return res.status(404).json({
                success: false,
                message: 'Dish not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Dish updated successfully',
            data: dish
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating dish',
            error: error.message
        });
    }
});

// DELETE /grabeats/dishes/:id - Delete dish
router.delete('/dishes/:id', async (req, res) => {
    try {
        const dishId = parseInt(req.params.id);
        
        const deletedDish = await Dish.findOneAndDelete({ ID: dishId });
        
        if (!deletedDish) {
            return res.status(404).json({
                success: false,
                message: 'Dish not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Dish deleted successfully',
            data: deletedDish
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting dish',
            error: error.message
        });
    }
});

// GET /grabeats/dishes/stats - Get dish statistics
router.get('/dishes/stats', async (req, res) => {
    try {
        const stats = await Dish.aggregate([
            {
                $group: {
                    _id: null,
                    totalDishes: { $sum: 1 },
                    avgRating: { $avg: '$Product_Rating' },
                    maxRating: { $max: '$Product_Rating' },
                    minRating: { $min: '$Product_Rating' },
                    totalCategories: { $addToSet: '$get_product_category.Product_Category' }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalDishes: 1,
                    avgRating: { $round: ['$avgRating', 2] },
                    maxRating: 1,
                    minRating: 1,
                    totalCategories: { $size: '$totalCategories' }
                }
            }
        ]);

        res.json({
            success: true,
            message: 'Dish statistics retrieved successfully',
            data: stats[0] || {
                totalDishes: 0,
                avgRating: 0,
                maxRating: 0,
                minRating: 0,
                totalCategories: 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving dish statistics',
            error: error.message
        });
    }
});

// GET /grabeats/dishes/category-stats - Get statistics by category
router.get('/dishes/category-stats', async (req, res) => {
    try {
        const categoryStats = await Dish.aggregate([
            {
                $group: {
                    _id: '$get_product_category.Product_Category',
                    count: { $sum: 1 },
                    avgRating: { $avg: '$Product_Rating' },
                    avgPrice: { $avg: { $min: '$get_all_products.Product_Discount_Price' } }
                }
            },
            {
                $project: {
                    category: '$_id',
                    count: 1,
                    avgRating: { $round: ['$avgRating', 2] },
                    avgPrice: { $round: ['$avgPrice', 2] },
                    _id: 0
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        res.json({
            success: true,
            message: 'Category statistics retrieved successfully',
            data: categoryStats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving category statistics',
            error: error.message
        });
    }
});

// GET /grabeats/dishes/price-analysis - Get price analysis
router.get('/dishes/price-analysis', async (req, res) => {
    try {
        const priceAnalysis = await Dish.aggregate([
            {
                $addFields: {
                    minPrice: { $min: '$get_all_products.Product_Discount_Price' },
                    maxPrice: { $max: '$get_all_products.Product_Discount_Price' }
                }
            },
            {
                $group: {
                    _id: null,
                    avgMinPrice: { $avg: '$minPrice' },
                    avgMaxPrice: { $avg: '$maxPrice' },
                    totalMinPrice: { $sum: '$minPrice' },
                    totalMaxPrice: { $sum: '$maxPrice' },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    avgMinPrice: { $round: ['$avgMinPrice', 2] },
                    avgMaxPrice: { $round: ['$avgMaxPrice', 2] },
                    totalMinPrice: { $round: ['$totalMinPrice', 2] },
                    totalMaxPrice: { $round: ['$totalMaxPrice', 2] },
                    count: 1
                }
            }
        ]);

        res.json({
            success: true,
            message: 'Price analysis retrieved successfully',
            data: priceAnalysis[0] || {
                avgMinPrice: 0,
                avgMaxPrice: 0,
                totalMinPrice: 0,
                totalMaxPrice: 0,
                count: 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving price analysis',
            error: error.message
        });
    }
});

// GET /grabeats/dishes/paginated - Get dishes with pagination
router.get('/dishes/paginated', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortBy = req.query.sortBy || 'Product_Name';
        const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
        const category = req.query.category;
        const minRating = req.query.minRating ? parseFloat(req.query.minRating) : 0;
        const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : Infinity;

        // Build filter object
        const filter = {};
        if (category) {
            filter['get_product_category.Product_Category'] = { 
                $regex: new RegExp(category, 'i') 
            };
        }
        if (minRating > 0) {
            filter.Product_Rating = { $gte: minRating };
        }
        if (maxPrice !== Infinity) {
            filter['get_all_products.Product_Discount_Price'] = { $lte: maxPrice };
        }

        // Calculate skip value for pagination
        const skip = (page - 1) * limit;

        // Get total count for pagination info
        const totalCount = await Dish.countDocuments(filter);

        // Get dishes with pagination
        const dishes = await Dish.find(filter)
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(totalCount / limit);

        res.json({
            success: true,
            message: 'Dishes retrieved successfully with pagination',
            data: dishes,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalCount: totalCount,
                limit: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving dishes with pagination',
            error: error.message
        });
    }
});

// GET /grabeats/dishes/advanced-search - Advanced search with multiple criteria
router.get('/dishes/advanced-search', async (req, res) => {
    try {
        const {
            search,
            category,
            minRating,
            maxRating,
            minPrice,
            maxPrice,
            sortBy,
            sortOrder
        } = req.query;

        // Build filter object
        const filter = {};

        // Text search
        if (search) {
            filter.$text = { $search: search };
        }

        // Category filter
        if (category) {
            filter['get_product_category.Product_Category'] = { 
                $regex: new RegExp(category, 'i') 
            };
        }

        // Rating range
        if (minRating || maxRating) {
            filter.Product_Rating = {};
            if (minRating) filter.Product_Rating.$gte = parseFloat(minRating);
            if (maxRating) filter.Product_Rating.$lte = parseFloat(maxRating);
        }

        // Price range
        if (minPrice || maxPrice) {
            filter['get_all_products.Product_Discount_Price'] = {};
            if (minPrice) filter['get_all_products.Product_Discount_Price'].$gte = parseFloat(minPrice);
            if (maxPrice) filter['get_all_products.Product_Discount_Price'].$lte = parseFloat(maxPrice);
        }

        // Sort options
        const sortOptions = {};
        if (sortBy) {
            sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
        } else {
            sortOptions.Product_Name = 1; // Default sort
        }

        const dishes = await Dish.find(filter).sort(sortOptions);

        res.json({
            success: true,
            message: 'Advanced search completed successfully',
            data: dishes,
            count: dishes.length,
            filters: {
                search,
                category,
                minRating,
                maxRating,
                minPrice,
                maxPrice,
                sortBy,
                sortOrder
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error performing advanced search',
            error: error.message
        });
    }
});

// ==================== CART ROUTES ====================

// GET /grabeats/mycart/get - Get user cart
router.get('/mycart/get', async (req, res) => {
  const { email } = req.query;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
      error: 'No email provided'
    });
  }

  try {
    // Find cart for the given email in MongoDB
    let userCart = await Cart.findOne({ email });
    
    if (!userCart) {
      return res.json({
        success: true,
        message: 'Cart retrieved successfully',
        cart: [],         // <-- THIS IS WHAT REDUX EXPECTS!
        totalItems: 0,
        totalPrice: 0
      });
    }

    const totalItems = userCart.cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = userCart.cart.reduce((sum, item) => sum + (item.Product_Discount_Price * item.quantity), 0);

    res.json({
      success: true,
      message: 'Cart retrieved successfully',
      cart: userCart.cart,         // <-- THIS IS WHAT REDUX EXPECTS!
      totalItems: totalItems,
      totalPrice: totalPrice
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
router.post('/mycart/add', async (req, res) => {

  const { email, item, product } = req.body;
  const itemToAdd = item || product;

  if (!email || !itemToAdd) {
    return res.status(400).json({
      success: false,
      message: 'Email and item/product are required',
      error: 'Missing required fields'
    });
  }

  try {
    let userCart = await Cart.findOne({ email });
    
    if (!userCart) {
      userCart = new Cart({ email, cart: [] });
    }

    const existingItemIndex = userCart.cart.findIndex(cartItem =>
      cartItem.ID === itemToAdd.ID && cartItem.Attribute_Combination === itemToAdd.Attribute_Combination
    );

    if (existingItemIndex !== -1) {
      userCart.cart[existingItemIndex].quantity += itemToAdd.quantity || 1;
    } else {
      userCart.cart.push({
        ...itemToAdd,
        quantity: itemToAdd.quantity || 1
      });
    }

    // Save to MongoDB
    await userCart.save();

    const totalItems = userCart.cart.reduce((sum, cartItem) => sum + cartItem.quantity, 0);
    const totalPrice = userCart.cart.reduce((sum, cartItem) => sum + (cartItem.Product_Discount_Price * cartItem.quantity), 0);

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      cart: userCart.cart,         // <-- THIS IS WHAT REDUX EXPECTS!
      totalItems: totalItems,
      totalPrice: totalPrice
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
router.put('/mycart/update', async (req, res) => {
  const { email, itemId, attributeCombination, quantity } = req.body;
  
  if (!email || !itemId || !attributeCombination || quantity === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Email, itemId, attributeCombination, and quantity are required',
      error: 'Missing required fields'
    });
  }

  try {
    const userCart = await Cart.findOne({ email });
    
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

    // Save to MongoDB
    await userCart.save();

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
router.delete('/mycart/remove', async (req, res) => {
  const { email, itemId, attributeCombination } = req.body;
  
  if (!email || !itemId || !attributeCombination) {
    return res.status(400).json({
      success: false,
      message: 'Email, itemId, and attributeCombination are required',
      error: 'Missing required fields'
    });
  }

  try {
    const userCart = await Cart.findOne({ email });
    
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

    // Save to MongoDB
    await userCart.save();

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
router.delete('/mycart/clear', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
      error: 'No email provided'
    });
  }

  try {
    const userCart = await Cart.findOne({ email });
    
    if (!userCart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
        error: 'No cart exists for this email'
      });
    }

    // Clear cart
    userCart.cart = [];

    // Save to MongoDB
    await userCart.save();

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

// DELETE /grabeats/mycart/delete - Remove item from cart (alternative endpoint)
router.delete('/mycart/delete', async (req, res) => {
  const { email, itemId, attributeCombination, ID, Attribute_Combination, productId } = req.body;
  
  // Accept multiple formats: itemId/ID/productId and attributeCombination/Attribute_Combination
  const finalItemId = itemId || ID || productId;
  const finalAttributeCombination = attributeCombination || Attribute_Combination;
  
  if (!email || !finalItemId) {
    return res.status(400).json({
      success: false,
      message: 'Email and itemId/ID/productId are required',
      error: 'Missing required fields',
      received: { email, itemId, attributeCombination, ID, Attribute_Combination, productId }
    });
  }

  try {
    const userCart = await Cart.findOne({ email });
    
    if (!userCart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
        error: 'No cart exists for this email'
      });
    }

    // If no attributeCombination provided, remove all items with that productId
    let itemIndex;
    if (finalAttributeCombination) {
      itemIndex = userCart.cart.findIndex(item => 
        item.ID === finalItemId && item.Attribute_Combination === finalAttributeCombination
      );
    } else {
      itemIndex = userCart.cart.findIndex(item => item.ID === finalItemId);
    }

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart',
        error: 'Item does not exist in cart',
        searchedFor: { itemId: finalItemId, attributeCombination: finalAttributeCombination },
        availableItems: userCart.cart.map(item => ({ ID: item.ID, Attribute_Combination: item.Attribute_Combination }))
      });
    }

    // Remove item from cart
    const removedItem = userCart.cart.splice(itemIndex, 1)[0];

    // Save to MongoDB
    await userCart.save();

    const totalItems = userCart.cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = userCart.cart.reduce((sum, item) => sum + (item.Product_Discount_Price * item.quantity), 0);

    res.json({
      success: true,
      message: 'Item deleted from cart successfully',
      cart: userCart.cart,         // <-- THIS IS WHAT REDUX EXPECTS!
      totalItems: totalItems,
      totalPrice: totalPrice,
      removedItem: removedItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting item from cart',
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