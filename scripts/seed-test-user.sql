-- Seed test user for development
-- Email: admin@example.com
-- Password: admin

INSERT INTO users (id, email, name, password, "createdAt", "updatedAt")
VALUES (
  'test-user-id',
  'admin@example.com',
  'Test Superuser',
  '$2b$10$kGYGSU99o9vQJQS9MGmzFu5ZqalWFn5L3kDcbLN0ePe1pE/IMUxM6', -- bcrypt hash of "admin"
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;
