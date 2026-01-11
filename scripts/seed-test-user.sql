-- Seed test user for development
-- Email: admin@example.com
-- Password: admin

INSERT INTO users (id, email, name, password, "createdAt", "updatedAt")
VALUES (
  'test-user-id',
  'admin@example.com',
  'Test Superuser',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- bcrypt hash of "admin"
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;
