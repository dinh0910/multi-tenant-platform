from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
new_hash = pwd_context.hash("Admin@1234")
print(f"NEW HASH FOR 'Admin@1234': {new_hash}")
