"""
Configuration for AESVault - Secure File Encryption System.
Academic project configuration with security best practices.
"""
import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    # Flask session secret key (use environment variable in production)
    SECRET_KEY = os.environ.get('SECRET_KEY', 'aesvault-dev-secret-key-academic-2026-secure')

    # Maximum file upload size: 100 MB
    MAX_CONTENT_LENGTH = 100 * 1024 * 1024

    # Storage paths (kept outside public static web directory for security)
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
    ENCRYPTED_FOLDER = os.path.join(BASE_DIR, 'encrypted')
    DECRYPTED_FOLDER = os.path.join(BASE_DIR, 'decrypted')
    INSTANCE_FOLDER = os.path.join(BASE_DIR, 'instance')
    DATABASE = os.path.join(INSTANCE_FOLDER, 'aesvault.db')

    # Security settings
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    PERMANENT_SESSION_LIFETIME = 86400  # 24 hours
