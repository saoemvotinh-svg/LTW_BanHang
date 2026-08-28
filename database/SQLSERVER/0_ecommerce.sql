/* =========================================================
   DATABASE: ecommerce
   SQL SERVER VERSION
   ========================================================= */

IF DB_ID(N'ecommerce') IS NULL
BEGIN
    CREATE DATABASE ecommerce;
END
GO

USE ecommerce;
GO

/* =========================================================
   1. USERS
   ========================================================= */
CREATE TABLE users
(
    id INT IDENTITY(1,1) NOT NULL,
    full_name NVARCHAR(100) NOT NULL,
    email NVARCHAR(255) NOT NULL,
    password NVARCHAR(255) NOT NULL,
    phone NVARCHAR(20) NOT NULL,
    address NVARCHAR(MAX) NULL,
    role NVARCHAR(20) NOT NULL,
    created_at DATETIME2 NULL,

    CONSTRAINT PK_users PRIMARY KEY (id),
    CONSTRAINT UQ_users_email UNIQUE (email)
);
GO

/* =========================================================
   2. SESSIONS
   ========================================================= */
CREATE TABLE sessions
(
    id INT IDENTITY(1,1) NOT NULL,
    user_id INT NOT NULL,
    session_token NVARCHAR(255) NOT NULL,
    expires_at DATETIME2 NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    last_activity DATETIME2 NULL,

    CONSTRAINT PK_sessions PRIMARY KEY (id),
    CONSTRAINT UQ_sessions_user UNIQUE (user_id),
    CONSTRAINT UQ_sessions_token UNIQUE (session_token),

    CONSTRAINT FK_sessions_users
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);
GO

/* =========================================================
   3. CATEGORIES
   ========================================================= */
CREATE TABLE categories
(
    id INT IDENTITY(1,1) NOT NULL,
    name NVARCHAR(150) NOT NULL,
    description NVARCHAR(MAX) NULL,

    CONSTRAINT PK_categories PRIMARY KEY (id)
);
GO

/* =========================================================
   4. PRODUCTS
   ========================================================= */
CREATE TABLE products
(
    id INT IDENTITY(1,1) NOT NULL,
    category_id INT NOT NULL,
    name NVARCHAR(MAX) NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    stock INT NOT NULL,
    description NVARCHAR(MAX) NULL,
    created_at DATETIME2 NULL,

    CONSTRAINT PK_products PRIMARY KEY (id),

    CONSTRAINT FK_products_categories
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
);
GO

/* =========================================================
   5. PRODUCT IMAGES
   ========================================================= */
CREATE TABLE product_images
(
    id INT IDENTITY(1,1) NOT NULL,
    product_id INT NOT NULL,
    image_url NVARCHAR(500) NULL,
    is_primary BIT NULL,

    CONSTRAINT PK_product_images PRIMARY KEY (id),

    CONSTRAINT FK_product_images_products
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE
);
GO

/* =========================================================
   6. REVIEWS
   ========================================================= */
CREATE TABLE reviews
(
    id INT IDENTITY(1,1) NOT NULL,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    rating TINYINT NULL,
    comment NVARCHAR(MAX) NULL,
    created_at DATETIME2 NULL,

    CONSTRAINT PK_reviews PRIMARY KEY (id),

    CONSTRAINT FK_reviews_products
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

    CONSTRAINT FK_reviews_users
        FOREIGN KEY (user_id)
        REFERENCES users(id)
);
GO

/* =========================================================
   7. NEWS
   ========================================================= */
CREATE TABLE news
(
    id INT IDENTITY(1,1) NOT NULL,
    title NVARCHAR(255) NOT NULL,
    slug NVARCHAR(255) NULL,
    content NVARCHAR(MAX) NULL,
    image_url NVARCHAR(500) NULL,
    published_at DATETIME2 NULL,

    CONSTRAINT PK_news PRIMARY KEY (id)
);
GO

/* =========================================================
   8. PROMOTIONS
   ========================================================= */
CREATE TABLE promotions
(
    id INT IDENTITY(1,1) NOT NULL,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    discount_percent DECIMAL(5,2) NULL,
    start_date DATETIME2 NULL,
    end_date DATETIME2 NULL,

    CONSTRAINT PK_promotions PRIMARY KEY (id)
);
GO

/* =========================================================
   9. CARTS
   ========================================================= */
CREATE TABLE carts
(
    id INT IDENTITY(1,1) NOT NULL,
    user_id INT NOT NULL,
    created_at DATETIME2 NULL,
    updated_at DATETIME2 NULL,

    CONSTRAINT PK_carts PRIMARY KEY (id),

    CONSTRAINT FK_carts_users
        FOREIGN KEY (user_id)
        REFERENCES users(id)
);
GO

/* =========================================================
   10. CART ITEMS
   ========================================================= */
CREATE TABLE cart_items
(
    id INT IDENTITY(1,1) NOT NULL,
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,

    CONSTRAINT PK_cart_items PRIMARY KEY (id),

    CONSTRAINT FK_cart_items_carts
        FOREIGN KEY (cart_id)
        REFERENCES carts(id),

    CONSTRAINT FK_cart_items_products
        FOREIGN KEY (product_id)
        REFERENCES products(id)
);
GO

/* =========================================================
   11. ORDERS
   ========================================================= */
CREATE TABLE orders
(
    id INT IDENTITY(1,1) NOT NULL,
    user_id INT NOT NULL,
    customer_name NVARCHAR(100) NOT NULL,
    phone NVARCHAR(20) NOT NULL,
    address NVARCHAR(MAX) NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    status NVARCHAR(30) NOT NULL,
    created_at DATETIME2 NULL,

    CONSTRAINT PK_orders PRIMARY KEY (id),

    CONSTRAINT FK_orders_users
        FOREIGN KEY (user_id)
        REFERENCES users(id)
);
GO

/* =========================================================
   12. ORDER ITEMS
   ========================================================= */
CREATE TABLE order_items
(
    id INT IDENTITY(1,1) NOT NULL,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL,

    CONSTRAINT PK_order_items PRIMARY KEY (id),

    CONSTRAINT FK_order_items_orders
        FOREIGN KEY (order_id)
        REFERENCES orders(id),

    CONSTRAINT FK_order_items_products
        FOREIGN KEY (product_id)
        REFERENCES products(id)
);
GO
/* =========================================================
   INDEX
   ========================================================= */

CREATE INDEX IX_sessions_expires_at
ON sessions(expires_at);
GO

CREATE INDEX IX_sessions_last_activity
ON sessions(last_activity);
GO

CREATE INDEX IX_products_category_id
ON products(category_id);
GO

CREATE INDEX IX_product_images_product_id
ON product_images(product_id);
GO

CREATE INDEX IX_reviews_product_id
ON reviews(product_id);
GO

CREATE INDEX IX_reviews_user_id
ON reviews(user_id);
GO

CREATE INDEX IX_carts_user_id
ON carts(user_id);
GO

CREATE INDEX IX_cart_items_cart_id
ON cart_items(cart_id);
GO

CREATE INDEX IX_cart_items_product_id
ON cart_items(product_id);
GO

CREATE INDEX IX_orders_user_id
ON orders(user_id);
GO

CREATE INDEX IX_order_items_order_id
ON order_items(order_id);
GO

CREATE INDEX IX_order_items_product_id
ON order_items(product_id);
GO
