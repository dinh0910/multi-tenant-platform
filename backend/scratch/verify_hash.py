from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Mã hash từ file seed.sql
stored_hash = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqEKtjVAkiHJjuJwRhMI9K2"
password_to_test = "Admin@1234"

is_correct = pwd_context.verify(password_to_test, stored_hash)
print(f"Password '{password_to_test}' matches hash: {is_correct}")
