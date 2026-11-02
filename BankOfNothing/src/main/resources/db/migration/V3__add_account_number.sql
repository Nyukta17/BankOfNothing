-- 1. Добавляем колонку (пока без NOT NULL, чтобы не упасть на существующих строках)
ALTER TABLE accounts ADD COLUMN number VARCHAR(20);

-- 2. Заполняем существующие строки, если они есть (заглушка из 20 нулей)
-- Если в БД пусто, этот UPDATE просто ничего не сделает
UPDATE accounts SET number = '00000000000000000000' WHERE number IS NULL;

-- 3. Теперь ставим NOT NULL
ALTER TABLE accounts ALTER COLUMN number SET NOT NULL;

-- 4. Уникальные индексы
CREATE UNIQUE INDEX uk_accounts_number ON accounts(number);
CREATE UNIQUE INDEX uk_accounts_user_currency ON accounts(user_id, currency);