CREATE TABLE pending_operations (
                                    id BIGSERIAL PRIMARY KEY,
                                    account_id BIGINT NOT NULL, -- Ссылка на аккаунт в банке
                                    idempotency_key VARCHAR(255) NOT NULL UNIQUE, -- Ключ для защиты от повторов
                                    amount NUMERIC(19, 2) NOT NULL,
                                    status VARCHAR(50) NOT NULL, -- HOLD, CAPTURED, RELEASED
                                    expires_at TIMESTAMP NOT NULL, -- Время, после которого HOLD сгорает (TTL)
                                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Добавляем индекс для быстрой выборки просроченных холдов воркером
CREATE INDEX idx_pending_ops_expires_status ON pending_operations(expires_at, status);
