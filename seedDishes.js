const mongoose = require('mongoose');
require('dotenv').config();
const Dish = require('./models/Dish');

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

// Connect to MongoDB and seed data
async function seedDishes() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing dishes
        await Dish.deleteMany({});
        console.log('Cleared existing dishes');

        // Insert new dishes
        const result = await Dish.insertMany(dishes);
        console.log(`Successfully seeded ${result.length} dishes`);

        mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error seeding dishes:', error);
        process.exit(1);
    }
}

seedDishes(); 