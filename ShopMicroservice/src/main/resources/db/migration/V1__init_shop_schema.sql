CREATE TABLE products (
                          id BIGSERIAL PRIMARY KEY,
                          name VARCHAR(255) NOT NULL,
                          description TEXT,
                          price NUMERIC(19, 2) NOT NULL,
                          stock INT NOT NULL
);

CREATE TABLE orders (
                        id BIGSERIAL PRIMARY KEY,
                        user_id BIGINT NOT NULL,
                        status VARCHAR(50) NOT NULL,
                        total_amount NUMERIC(19, 2) NOT NULL,
                        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
                             id BIGSERIAL PRIMARY KEY,
                             order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
                             product_id BIGINT NOT NULL REFERENCES products(id),
                             quantity INT NOT NULL,
                             price NUMERIC(19, 2) NOT NULL
);

INSERT INTO products (name, description, price, stock) VALUES
                                                           ('Худи BankOfNothing', 'Стильный оверсайз худи', 4500.00, 10),
                                                           ('Термокружка', 'Сохраняет кофе горячим во время код-ревью', 1500.00, 50),
                                                           ('Стикерпак', 'Для твоего ноутбука', 300.00, 100);
