const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');

// Sample initial dishes array
const dishess  = [
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
        get_all_products: [
            {
                Product_ID: 1037,
                Picture_URL: "https://example.com/images/pizza_large.jpg",
                Attribute_Combination: "Large, Extra Toppings",
                Product_Price: 12.99,
                Product_Discount_Price: 10.99
            },
            {
                Product_ID: 1038,
                Picture_URL: "https://example.com/images/pizza_small.jpg",
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
            Picture_Url: "https://example.com/images/greek_salad.jpg"
        },
        get_all_products: [
            {
                Product_ID: 1045,
                Picture_URL: "https://example.com/images/greek_large.jpg",
                Attribute_Combination: "Large, Extra Feta",
                Product_Price: 9.99,
                Product_Discount_Price: 7.99
            },
            {
                Product_ID: 1046,
                Picture_URL: "https://example.com/images/greek_small.jpg",
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
            Picture_Url: "https://example.com/images/quinoa_bowl.jpg"
        },
        get_all_products: [
            {
                Product_ID: 1039,
                Picture_URL: "https://example.com/images/quinoa_large.jpg",
                Attribute_Combination: "Large, Extra Avocado",
                Product_Price: 11.99,
                Product_Discount_Price: 9.99
            },
            {
                Product_ID: 1040,
                Picture_URL: "https://example.com/images/quinoa_small.jpg",
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
            Picture_Url: "https://example.com/images/vegetable_stir_fry.jpg"
        },
        get_all_products: [
            {
                Product_ID: 1033,
                Picture_URL: "https://example.com/images/stir_fry_large.jpg",
                Attribute_Combination: "Large, Extra Sauce",
                Product_Price: 10.99,
                Product_Discount_Price: 8.99
            },
            {
                Product_ID: 1034,
                Picture_URL: "https://example.com/images/stir_fry_small.jpg",
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
            Picture_Url: "https://example.com/images/spinach_lasagna.jpg"
        },
        get_all_products: [
            {
                Product_ID: 1041,
                Picture_URL: "https://example.com/images/lasagna_large.jpg",
                Attribute_Combination: "Large, Extra Cheese",
                Product_Price: 13.99,
                Product_Discount_Price: 11.99
            },
            {
                Product_ID: 1042,
                Picture_URL: "https://example.com/images/lasagna_small.jpg",
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
            Picture_Url: "https://example.com/images/baked_ziti.jpg"
        },
        get_all_products: [
            {
                Product_ID: 1057,
                Picture_URL: "https://example.com/images/ziti_large.jpg",
                Attribute_Combination: "Large, Extra Marinara",
                Product_Price: 13.99,
                Product_Discount_Price: 11.99
            },
            {
                Product_ID: 1058,
                Picture_URL: "https://example.com/images/ziti_small.jpg",
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
            Picture_Url: "https://example.com/images/pasta_primavera.jpg"
        },
        get_all_products: [
            {
                Product_ID: 1055,
                Picture_URL: "https://example.com/images/pasta_large.jpg",
                Attribute_Combination: "Large, Extra Olive Oil",
                Product_Price: 12.99,
                Product_Discount_Price: 10.99
            },
            {
                Product_ID: 1056,
                Picture_URL: "https://example.com/images/pasta_small.jpg",
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
            Picture_Url: "https://example.com/images/mushroom_risotto.jpg"
        },
        get_all_products: [
            {
                Product_ID: 1035,
                Picture_URL: "https://example.com/images/risotto_large.jpg",
                Attribute_Combination: "Large, Extra Parmesan",
                Product_Price: 14.99,
                Product_Discount_Price: 12.99
            },
            {
                Product_ID: 1036,
                Picture_URL: "https://example.com/images/risotto_small.jpg",
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
            Picture_Url: "https://example.com/images/lentil_soup.jpg"
        },
        get_all_products: [
            {
                Product_ID: 1047,
                Picture_URL: "https://example.com/images/lentil_large.jpg",
                Attribute_Combination: "Large, Extra Spices",
                Product_Price: 8.99,
                Product_Discount_Price: 7.49
            },
            {
                Product_ID: 1048,
                Picture_URL: "https://example.com/images/lentil_small.jpg",
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
            Picture_Url: "https://example.com/images/eggplant_parmesan.jpg"
        },
        get_all_products: [
            {
                Product_ID: 1043,
                Picture_URL: "https://example.com/images/eggplant_large.jpg",
                Attribute_Combination: "Large, Extra Marinara",
                Product_Price: 12.99,
                Product_Discount_Price: 10.99
            },
            {
                Product_ID: 1044,
                Picture_URL: "https://example.com/images/eggplant_small.jpg",
                Attribute_Combination: "Small, No Marinara",
                Product_Price: 8.99,
                Product_Discount_Price: 7.49
            }
        ]
    }
  ];

// GET /grabeats/get - return dishes array
router.get('/get', (req, res) => {
    res.json(dishess);
});

// Placeholder for cart array endpoint
// router.get('/cart', (req, res) => {
//     res.json(cartArray);
// });

// POST /mycart/add - Add a product to a user's cart in MongoDB
router.post('/mycart/add', async (req, res) => {
    const { email, product } = req.body;
    if (!email || !product) {
        return res.status(400).json({ error: 'Email and product are required.' });
    }
    try {
        let cart = await Cart.findOne({ email });
        if (!cart) {
            cart = new Cart({ email, products: [product] });
        } else {
            cart.products.push(product);
        }
        await cart.save();
        res.json({ message: 'Product added to cart.', cart: cart.products });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add product to cart.' });
    }
});

// GET /mycart/get?email=... - Get a user's cart from MongoDB
router.get('/mycart/get', async (req, res) => {
    const { email } = req.query;
    if (!email) {
        return res.status(400).json({ error: 'Email is required.' });
    }
    try {
        const cart = await Cart.findOne({ email });
        res.json({ cart: cart ? cart.products : [] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch cart.' });
    }
});

// DELETE /mycart/delete - Remove a product from a user's cart by product ID in MongoDB
router.delete('/mycart/delete', async (req, res) => {
    const { email, productId } = req.body;
    if (!email || !productId) {
        return res.status(400).json({ error: 'Email and productId are required.' });
    }
    try {
        const cart = await Cart.findOne({ email });
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found for this user.' });
        }
        cart.products = cart.products.filter(item => item.ID !== productId);
        await cart.save();
        res.json({ message: 'Product removed from cart.', cart: cart.products });
    } catch (err) {
        res.status(500).json({ error: 'Failed to remove product from cart.' });
    }
});

module.exports = router; 