# MongoDB Integration Documentation

## Overview
This document outlines the complete MongoDB integration implemented in the GrabEats Server project. All APIs now use MongoDB for data persistence instead of in-memory storage.

## Models Implemented

### 1. User Model (`models/User.js`)
- **Purpose**: User authentication and profile management
- **Features**:
  - Password hashing with bcrypt
  - JWT token generation
  - Role-based access control (user/admin)
  - Email validation
  - Phone number validation
  - Account status tracking
  - Last login tracking

### 2. Dish Model (`models/Dish.js`)
- **Purpose**: Food item management
- **Features**:
  - Text search indexing on Product_Name and Product_Description
  - Category indexing for fast filtering
  - Rating indexing for sorting
  - Complex nested structure for product variants
  - Price and discount price tracking

### 3. Cart Model (`models/Cart.js`)
- **Purpose**: Shopping cart management
- **Features**:
  - User-specific cart storage
  - Cart item management with quantities
  - Email-based cart identification
  - Timestamp tracking

### 4. Auth Model (`models/Auth.js`)
- **Purpose**: Alternative authentication system
- **Features**:
  - Password hashing
  - Email uniqueness validation
  - Password comparison methods

### 5. Post Model (`models/Post.js`)
- **Purpose**: Content management
- **Features**:
  - Comment system
  - View and rating tracking
  - Timestamp management

### 6. Task Models
- **Task Model** (`models/Task.js`): User-specific task management
- **Daily Task Model** (`models/taskModel.js`): Daily task scheduling with cron jobs

## API Endpoints with MongoDB Integration

### Authentication APIs
- `POST /register` - User registration with MongoDB storage
- `POST /login` - User login with MongoDB validation
- `GET /profile` - Get user profile from MongoDB
- `PUT /profile` - Update user profile in MongoDB
- `PUT /change-password` - Change password with MongoDB update

### Dish Management APIs
- `GET /get` - Get all dishes from MongoDB
- `GET /get/:id` - Get dish by ID from MongoDB
- `GET /category/:category` - Get dishes by category with MongoDB aggregation
- `GET /dishes/search/:query` - Text search using MongoDB text indexes
- `GET /dishes/rating/:rating` - Get dishes by rating with MongoDB filtering
- `GET /categories` - Get unique categories using MongoDB distinct
- `GET /dishes/price-range` - Price range filtering with MongoDB queries
- `GET /dishes/featured` - Featured dishes with MongoDB aggregation
- `GET /dishes/popular` - Popular dishes with MongoDB aggregation
- `GET /dishes/on-sale` - Discounted dishes with MongoDB aggregation
- `GET /dishes/stats` - Dish statistics with MongoDB aggregation
- `GET /dishes/category-stats` - Category statistics with MongoDB aggregation
- `GET /dishes/price-analysis` - Price analysis with MongoDB aggregation
- `GET /dishes/paginated` - Paginated dish retrieval with MongoDB
- `GET /dishes/advanced-search` - Advanced search with multiple MongoDB criteria
- `POST /dishes` - Create new dish in MongoDB
- `PUT /dishes/:id` - Update dish in MongoDB
- `DELETE /dishes/:id` - Delete dish from MongoDB

### Cart Management APIs
- `GET /mycart/get` - Get user cart from MongoDB
- `POST /mycart/add` - Add item to cart in MongoDB
- `PUT /mycart/update` - Update cart item quantity in MongoDB
- `DELETE /mycart/remove` - Remove item from cart in MongoDB
- `DELETE /mycart/clear` - Clear entire cart in MongoDB
- `DELETE /mycart/delete` - Alternative delete endpoint for cart items

### Additional APIs
- `POST /verify-otp` - OTP verification (mock implementation)
- `GET /health` - Health check endpoint

## MongoDB Features Implemented

### 1. Indexing
- **Text Indexes**: Full-text search on dish names and descriptions
- **Compound Indexes**: Category and rating indexing for fast queries
- **Unique Indexes**: Email uniqueness for users
- **Performance Indexes**: Optimized queries for cart operations

### 2. Aggregation Pipelines
- **Statistics**: Dish counts, average ratings, price analysis
- **Grouping**: Category-based statistics and analysis
- **Sorting**: Popular dishes, featured items, price-based sorting
- **Filtering**: Complex filtering with multiple criteria

### 3. Data Validation
- **Schema Validation**: All models have proper validation rules
- **Type Checking**: Proper data types for all fields
- **Required Fields**: Essential fields are marked as required
- **Custom Validation**: Email format, phone number format, rating ranges

### 4. Error Handling
- **MongoDB Errors**: Proper error handling for database operations
- **Validation Errors**: Detailed error messages for invalid data
- **Connection Errors**: Graceful handling of database connection issues
- **Query Errors**: Proper error responses for failed queries

### 5. Performance Optimizations
- **Pagination**: Efficient pagination for large datasets
- **Projection**: Selective field retrieval to reduce data transfer
- **Indexing**: Strategic indexing for common query patterns
- **Aggregation**: Optimized aggregation pipelines for complex queries

## Database Operations

### CRUD Operations
- **Create**: `Model.create()`, `new Model().save()`
- **Read**: `Model.find()`, `Model.findOne()`, `Model.findById()`
- **Update**: `Model.findOneAndUpdate()`, `Model.findByIdAndUpdate()`
- **Delete**: `Model.findOneAndDelete()`, `Model.findByIdAndDelete()`

### Advanced Operations
- **Aggregation**: Complex data analysis with `Model.aggregate()`
- **Text Search**: Full-text search with `$text` operator
- **Geospatial**: Location-based queries (if needed in future)
- **Transactions**: ACID compliance for critical operations

## Security Features

### 1. Authentication
- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control
- Token expiration management

### 2. Data Protection
- Password field exclusion from queries
- Input validation and sanitization
- SQL injection prevention (MongoDB is NoSQL)
- XSS protection through proper data handling

### 3. Authorization
- Route protection middleware
- Role-based route access
- User-specific data isolation

## Performance Considerations

### 1. Query Optimization
- Proper indexing strategy
- Efficient aggregation pipelines
- Pagination for large datasets
- Selective field projection

### 2. Connection Management
- Connection pooling
- Proper connection error handling
- Connection timeout management

### 3. Caching Strategy
- Consider implementing Redis for frequently accessed data
- Cache popular dishes and categories
- Cache user sessions and cart data

## Monitoring and Maintenance

### 1. Database Monitoring
- Query performance monitoring
- Index usage analysis
- Connection pool monitoring
- Error rate tracking

### 2. Backup Strategy
- Regular database backups
- Point-in-time recovery
- Data consistency checks

### 3. Scaling Considerations
- Horizontal scaling with MongoDB sharding
- Read replicas for read-heavy operations
- Write concern optimization

## Future Enhancements

### 1. Additional Features
- Real-time notifications with WebSockets
- File upload for dish images
- Advanced analytics and reporting
- Recommendation engine

### 2. Performance Improvements
- Redis caching layer
- CDN for static assets
- Database query optimization
- Connection pooling optimization

### 3. Security Enhancements
- Rate limiting
- API key management
- Advanced authentication (OAuth, 2FA)
- Audit logging

## Conclusion

The MongoDB integration provides a robust, scalable, and performant foundation for the GrabEats application. All data operations are now persistent, secure, and optimized for production use. The implementation includes comprehensive error handling, validation, and performance optimizations to ensure a smooth user experience. 