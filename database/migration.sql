-- Execute no seu banco MySQL (Railway, etc.)

CREATE TABLE IF NOT EXISTS cars (
  id VARCHAR(50) PRIMARY KEY,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  version VARCHAR(200) NOT NULL,
  year INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  mileage INT NOT NULL,
  color VARCHAR(50) NOT NULL,
  fuel VARCHAR(50) NOT NULL,
  transmission VARCHAR(50) NOT NULL,
  doors INT NOT NULL DEFAULT 4,
  status VARCHAR(20) NOT NULL DEFAULT 'disponivel',
  images JSON NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  features JSON NOT NULL,
  whatsapp VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
