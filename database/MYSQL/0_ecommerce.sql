/* =========================================================
   DATABASE: ecommerce
   MYSQL VERSION
   ========================================================= */

CREATE DATABASE IF NOT EXISTS ecommerce
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ecommerce;

/* =========================================================
   1. USERS
   ========================================================= */
CREATE TABLE IF NOT EXISTS users
(
    id         INT           NOT NULL AUTO_INCREMENT,
    full_name  VARCHAR(100)  NOT NULL,
    email      VARCHAR(255)  NOT NULL,
    password   VARCHAR(255)  NOT NULL,
    phone      VARCHAR(20)   NOT NULL,
    address    TEXT          NULL,
    role       VARCHAR(20)   NOT NULL,
    created_at DATETIME      NULL,

    PRIMARY KEY (id),
    UNIQUE KEY UQ_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* =========================================================
   2. SESSIONS
   ========================================================= */
CREATE TABLE IF NOT EXISTS sessions
(
    id             INT          NOT NULL AUTO_INCREMENT,
    user_id        INT          NOT NULL,
    session_token  VARCHAR(255) NOT NULL,
    expires_at     DATETIME     NOT NULL,
    created_at     DATETIME     NOT NULL DEFAULT NOW(),
    last_activity  DATETIME     NULL,

    PRIMARY KEY (id),
    UNIQUE KEY UQ_sessions_user  (user_id),
    UNIQUE KEY UQ_sessions_token (session_token),

    CONSTRAINT FK_sessions_users
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* =========================================================
   3. CATEGORIES
   ========================================================= */
CREATE TABLE IF NOT EXISTS categories
(
    id          INT          NOT NULL AUTO_INCREMENT,
    name        VARCHAR(150) NOT NULL,
    description TEXT         NULL,

    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* =========================================================
   4. PRODUCTS
   ========================================================= */
CREATE TABLE IF NOT EXISTS products
(
    id          INT            NOT NULL AUTO_INCREMENT,
    category_id INT            NOT NULL,
    name        TEXT           NOT NULL,
    price       DECIMAL(15,2)  NOT NULL,
    stock       INT            NOT NULL,
    description TEXT           NULL,
    created_at  DATETIME       NULL,

    PRIMARY KEY (id),

    CONSTRAINT FK_products_categories
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* =========================================================
   5. PRODUCT IMAGES
   ========================================================= */
CREATE TABLE IF NOT EXISTS product_images
(
    id          INT          NOT NULL AUTO_INCREMENT,
    product_id  INT          NOT NULL,
    image_url   VARCHAR(500) NULL,
    is_primary  TINYINT(1)   NULL,

    PRIMARY KEY (id),

    CONSTRAINT FK_product_images_products
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* =========================================================
   6. REVIEWS
   ========================================================= */
CREATE TABLE IF NOT EXISTS reviews
(
    id          INT      NOT NULL AUTO_INCREMENT,
    product_id  INT      NOT NULL,
    user_id     INT      NOT NULL,
    rating      TINYINT  NULL,
    comment     TEXT     NULL,
    created_at  DATETIME NULL,

    PRIMARY KEY (id),

    CONSTRAINT FK_reviews_products
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

    CONSTRAINT FK_reviews_users
        FOREIGN KEY (user_id)
        REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* =========================================================
   7. NEWS
   ========================================================= */
CREATE TABLE IF NOT EXISTS news
(
    id           INT          NOT NULL AUTO_INCREMENT,
    title        VARCHAR(255) NOT NULL,
    slug         VARCHAR(255) NULL,
    content      TEXT         NULL,
    image_url    VARCHAR(500) NULL,
    published_at DATETIME     NULL,

    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* =========================================================
   8. PROMOTIONS
   ========================================================= */
CREATE TABLE IF NOT EXISTS promotions
(
    id               INT           NOT NULL AUTO_INCREMENT,
    title            VARCHAR(255)  NOT NULL,
    description      TEXT          NULL,
    discount_percent DECIMAL(5,2)  NULL,
    start_date       DATETIME      NULL,
    end_date         DATETIME      NULL,

    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* =========================================================
   9. CARTS
   ========================================================= */
CREATE TABLE IF NOT EXISTS carts
(
    id         INT      NOT NULL AUTO_INCREMENT,
    user_id    INT      NOT NULL,
    created_at DATETIME NULL,
    updated_at DATETIME NULL,

    PRIMARY KEY (id),

    CONSTRAINT FK_carts_users
        FOREIGN KEY (user_id)
        REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* =========================================================
   10. CART ITEMS
   ========================================================= */
CREATE TABLE IF NOT EXISTS cart_items
(
    id         INT NOT NULL AUTO_INCREMENT,
    cart_id    INT NOT NULL,
    product_id INT NOT NULL,
    quantity   INT NOT NULL,

    PRIMARY KEY (id),

    CONSTRAINT FK_cart_items_carts
        FOREIGN KEY (cart_id)
        REFERENCES carts(id),

    CONSTRAINT FK_cart_items_products
        FOREIGN KEY (product_id)
        REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* =========================================================
   11. ORDERS
   ========================================================= */
CREATE TABLE IF NOT EXISTS orders
(
    id            INT           NOT NULL AUTO_INCREMENT,
    user_id       INT           NOT NULL,
    customer_name VARCHAR(100)  NOT NULL,
    phone         VARCHAR(20)   NOT NULL,
    address       TEXT          NULL,
    total_amount  DECIMAL(15,2) NOT NULL,
    status        VARCHAR(30)   NOT NULL,
    created_at    DATETIME      NULL,

    PRIMARY KEY (id),

    CONSTRAINT FK_orders_users
        FOREIGN KEY (user_id)
        REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* =========================================================
   12. ORDER ITEMS
   ========================================================= */
CREATE TABLE IF NOT EXISTS order_items
(
    id         INT           NOT NULL AUTO_INCREMENT,
    order_id   INT           NOT NULL,
    product_id INT           NOT NULL,
    quantity   INT           NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    subtotal   DECIMAL(15,2) NOT NULL,

    PRIMARY KEY (id),

    CONSTRAINT FK_order_items_orders
        FOREIGN KEY (order_id)
        REFERENCES orders(id),

    CONSTRAINT FK_order_items_products
        FOREIGN KEY (product_id)
        REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* =========================================================
   INDEX
   ========================================================= */

CREATE INDEX IX_sessions_expires_at    ON sessions(expires_at);
CREATE INDEX IX_sessions_last_activity ON sessions(last_activity);
CREATE INDEX IX_products_category_id   ON products(category_id);
CREATE INDEX IX_product_images_product_id ON product_images(product_id);
CREATE INDEX IX_reviews_product_id     ON reviews(product_id);
CREATE INDEX IX_reviews_user_id        ON reviews(user_id);
CREATE INDEX IX_carts_user_id          ON carts(user_id);
CREATE INDEX IX_cart_items_cart_id     ON cart_items(cart_id);
CREATE INDEX IX_cart_items_product_id  ON cart_items(product_id);
CREATE INDEX IX_orders_user_id         ON orders(user_id);
CREATE INDEX IX_order_items_order_id   ON order_items(order_id);
CREATE INDEX IX_order_items_product_id ON order_items(product_id);
