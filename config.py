"""
Configuration for AESVault - Secure File Encryption System.
Academic project configuration with Vercel serverless compatibility.
"""
import os
import secrets
import tempfile

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    # Flask session secret key
    # Reads SECRET_KEY or FLASK_SECRET_KEY from environment variables,
    # or generates a cryptographically secure 256-bit random key.
    SECRET_KEY = (
        os.environ.get('SECRET_KEY') or 
        os.environ.get('FLASK_SECRET_KEY') or 
        secrets.token_hex(32)
    )

    # Maximum file upload size: 100 MB
    MAX_CONTENT_LENGTH = 100 * 1024 * 1024

    # Determine writable directory for temporary file processing and SQLite DB
    # On Vercel serverless environment, the root directory is read-only, so use /tmp
    IS_SERVERLESS = (
        os.environ.get('VERCEL') == '1' or 
        os.environ.get('VERCEL_ENV') is not None or 
        not os.access(BASE_DIR, os.W_OK)
    )

    if IS_SERVERLESS:
        TMP_DIR = tempfile.gettempdir()
        UPLOAD_FOLDER = os.path.join(TMP_DIR, 'uploads')
        ENCRYPTED_FOLDER = os.path.join(TMP_DIR, 'encrypted')
        DECRYPTED_FOLDER = os.path.join(TMP_DIR, 'decrypted')
        INSTANCE_FOLDER = os.path.join(TMP_DIR, 'instance')
    else:
        UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
        ENCRYPTED_FOLDER = os.path.join(BASE_DIR, 'encrypted')
        DECRYPTED_FOLDER = os.path.join(BASE_DIR, 'decrypted')
        INSTANCE_FOLDER = os.path.join(BASE_DIR, 'instance')

    DATABASE = os.path.join(INSTANCE_FOLDER, 'aesvault.db')

    # Security settings
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    PERMANENT_SESSION_LIFETIME = 86400  # 24 hours
