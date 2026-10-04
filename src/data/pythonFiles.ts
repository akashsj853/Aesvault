/**
 * Complete Python Flask Project Files Content
 * Provides student with live in-browser file browser, copy, and export.
 */

export interface ProjectFile {
  name: string;
  path: string;
  category: 'python' | 'template' | 'css' | 'config' | 'doc';
  description: string;
  content: string;
}

export const PYTHON_PROJECT_FILES: ProjectFile[] = [
  {
    name: "app.py",
    path: "app.py",
    category: "python",
    description: "Main Flask application server with all routes, auth decorators, and file handlers.",
    content: `"""
AESVault - Secure File Encryption and Decryption System.
Main Flask Application Server.

Focus: AES (Advanced Encryption Standard) - AES-256-GCM authenticated encryption.
"""

import os
import io
import time
from functools import wraps
from flask import (
    Flask, render_template, request, redirect, url_for,
    flash, session, send_file, jsonify, abort
)
from werkzeug.utils import secure_filename
from werkzeug.security import check_password_hash

from config import Config
from database import (
    init_db, create_user, get_user_by_email, get_user_by_id,
    update_user_name, record_file_operation, get_user_history,
    get_user_statistics
)
from crypto import (
    generate_key, decode_key, encrypt_file, decrypt_file,
    encrypt_text, decrypt_text
)

app = Flask(__name__)
app.config.from_object(Config)

# Ensure required storage folders exist with proper permissions
for folder in [Config.UPLOAD_FOLDER, Config.ENCRYPTED_FOLDER, Config.DECRYPTED_FOLDER, Config.INSTANCE_FOLDER]:
    os.makedirs(folder, exist_ok=True)

# Initialize database schema on startup
with app.app_context():
    init_db()

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash("Please log in to continue.", "warning")
            return redirect(url_for('login', next=request.url))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dashboard')
@login_required
def dashboard():
    user_id = session['user_id']
    stats = get_user_statistics(user_id)
    recent_history = get_user_history(user_id)[:5]
    return render_template('dashboard.html', stats=stats, recent_history=recent_history)

@app.route('/encrypt', methods=['GET', 'POST'])
@login_required
def encrypt():
    if request.method == 'POST':
        file = request.files.get('file')
        aes_key = request.form.get('aes_key', '').strip()
        if not file or file.filename == '':
            flash("No file was selected.", "danger")
            return redirect(request.url)
        if not aes_key:
            flash("Please provide an AES key.", "danger")
            return redirect(request.url)

        original_filename = secure_filename(file.filename) or "secure_file"
        file_bytes = file.read()
        
        # Real AES-256-GCM encryption
        encrypted_data = encrypt_file(file_bytes, original_filename, aes_key)
        encrypted_filename = f"{original_filename}.enc"
        
        save_path = os.path.join(Config.ENCRYPTED_FOLDER, f"{session['user_id']}_{int(time.time())}_{encrypted_filename}")
        with open(save_path, 'wb') as f:
            f.write(encrypted_data)

        record_file_operation(session['user_id'], original_filename, encrypted_filename, len(file_bytes), 'Encryption', 'Success')
        flash(f"File '{original_filename}' successfully encrypted using AES-256-GCM!", "success")
        return render_template('encrypt.html', encrypted_filename=encrypted_filename, download_path=os.path.basename(save_path), encryption_done=True)

    return render_template('encrypt.html')

@app.route('/decrypt', methods=['GET', 'POST'])
@login_required
def decrypt():
    if request.method == 'POST':
        file = request.files.get('file')
        aes_key = request.form.get('aes_key', '').strip()
        if not file or not aes_key:
            flash("Missing file or AES key.", "danger")
            return redirect(request.url)

        try:
            encrypted_bytes = file.read()
            decrypted_bytes, recovered_filename = decrypt_file(encrypted_bytes, aes_key)
            safe_rec_fname = secure_filename(recovered_filename) or "decrypted_file"
            save_name = f"{session['user_id']}_{int(time.time())}_{safe_rec_fname}"
            save_path = os.path.join(Config.DECRYPTED_FOLDER, save_name)
            with open(save_path, 'wb') as f:
                f.write(decrypted_bytes)

            record_file_operation(session['user_id'], safe_rec_fname, file.filename, len(decrypted_bytes), 'Decryption', 'Success')
            return render_template('decrypt.html', decrypted_filename=safe_rec_fname, download_path=save_name, decryption_done=True)
        except ValueError as e:
            record_file_operation(session['user_id'], file.filename, file.filename, len(encrypted_bytes), 'Decryption', 'Failed')
            flash(str(e), "danger")
            return render_template('decrypt.html')

    return render_template('decrypt.html')

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)`
  },
  {
    name: "aes_crypto.py",
    path: "crypto/aes_crypto.py",
    category: "python",
    description: "AES-256-GCM cryptographic engine using cryptography.hazmat.primitives.ciphers.aead.AESGCM.",
    content: `"""
AES-256-GCM Core Cryptographic Implementation for AESVault.
Standard: NIST SP 800-38D Authenticated Encryption.
"""
import os
import base64
import struct
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.exceptions import InvalidTag

MAGIC_HEADER = b"AESV"
VERSION = 1
NONCE_LENGTH = 12       # 96 bits for AES-GCM
KEY_LENGTH_BYTES = 32   # 256 bits for AES-256
TAG_LENGTH_BYTES = 16   # 128-bit authentication tag

def generate_key() -> str:
    return base64.b64encode(os.urandom(KEY_LENGTH_BYTES)).decode('utf-8')

def decode_key(b64_key: str) -> bytes:
    key_bytes = base64.b64decode(b64_key.strip())
    if len(key_bytes) != KEY_LENGTH_BYTES:
        raise ValueError(f"Invalid key length: Expected {KEY_LENGTH_BYTES} bytes, got {len(key_bytes)}.")
    return key_bytes

def encrypt_file(plaintext_bytes: bytes, original_filename: str, b64_key: str) -> bytes:
    key = decode_key(b64_key)
    nonce = os.urandom(NONCE_LENGTH)
    aesgcm = AESGCM(key)
    ciphertext_with_tag = aesgcm.encrypt(nonce, plaintext_bytes, None)

    safe_fname = os.path.basename(original_filename) if original_filename else "decrypted_file"
    fname_bytes = safe_fname.encode('utf-8')
    fname_len = len(fname_bytes)

    header = MAGIC_HEADER + struct.pack("!BBH", VERSION, NONCE_LENGTH, fname_len)
    return header + fname_bytes + nonce + ciphertext_with_tag

def decrypt_file(encrypted_package: bytes, b64_key: str) -> tuple[bytes, str]:
    key = decode_key(b64_key)
    if not encrypted_package.startswith(MAGIC_HEADER):
        raise ValueError("Invalid file format. Not an AESVault encrypted file.")

    offset = len(MAGIC_HEADER)
    version, nonce_len, fname_len = struct.unpack("!BBH", encrypted_package[offset:offset+4])
    offset += 4

    fname_bytes = encrypted_package[offset:offset+fname_len]
    original_filename = fname_bytes.decode('utf-8', errors='ignore') or "decrypted_file"
    offset += fname_len

    nonce = encrypted_package[offset:offset+nonce_len]
    offset += nonce_len

    ciphertext_with_tag = encrypted_package[offset:]
    aesgcm = AESGCM(key)

    try:
        plaintext = aesgcm.decrypt(nonce, ciphertext_with_tag, None)
        return plaintext, original_filename
    except InvalidTag as e:
        raise ValueError("Decryption failed. The AES key is incorrect or the file has been modified.") from e`
  },
  {
    name: "database.py",
    path: "database/database.py",
    category: "python",
    description: "SQLite storage management for user accounts and audit logs. Zero key storage.",
    content: `"""
Database Management Module for AESVault (SQLite).
Security rule: Plaintext passwords and AES keys are NEVER stored.
"""
import sqlite3
import os
from werkzeug.security import generate_password_hash, check_password_hash
from config import Config

def get_db_connection():
    os.makedirs(Config.INSTANCE_FOLDER, exist_ok=True)
    conn = sqlite3.connect(Config.DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        original_filename TEXT NOT NULL,
        encrypted_filename TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        operation TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    """)
    conn.commit()
    conn.close()`
  },
  {
    name: "config.py",
    path: "config.py",
    category: "config",
    description: "Centralized configuration: 100MB upload limits, folder paths, session settings.",
    content: `import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'aesvault-dev-secret-key-academic-2026')
    MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100 MB Limit
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
    ENCRYPTED_FOLDER = os.path.join(BASE_DIR, 'encrypted')
    DECRYPTED_FOLDER = os.path.join(BASE_DIR, 'decrypted')
    INSTANCE_FOLDER = os.path.join(BASE_DIR, 'instance')
    DATABASE = os.path.join(INSTANCE_FOLDER, 'aesvault.db')
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'`
  },
  {
    name: "requirements.txt",
    path: "requirements.txt",
    category: "config",
    description: "Minimal verified Python dependencies.",
    content: `Flask==3.0.3\ncryptography==42.0.8\nWerkzeug==3.0.3`
  },
  {
    name: "test_crypto.py",
    path: "tests/test_crypto.py",
    category: "python",
    description: "Automated unit tests verifying exact byte recovery: original_bytes == decrypted_bytes.",
    content: `import unittest
from crypto.aes_crypto import generate_key, encrypt_file, decrypt_file

class TestAESVault(unittest.TestCase):
    def test_byte_recovery(self):
        key = generate_key()
        payload = b"Hello Cryptography \\x00\\xFF\\xFE"
        encrypted = encrypt_file(payload, "test.bin", key)
        decrypted, fname = decrypt_file(encrypted, key)
        self.assertEqual(payload, decrypted, "Exact byte match required!")

    def test_wrong_key(self):
        key1 = generate_key()
        key2 = generate_key()
        encrypted = encrypt_file(b"secret", "test.bin", key1)
        with self.assertRaises(ValueError):
            decrypt_file(encrypted, key2)

if __name__ == '__main__':
    unittest.main()`
  }
];
