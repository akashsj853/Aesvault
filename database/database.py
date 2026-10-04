"""
Database Management Module for AESVault.
Uses SQLite for persistent storage of user credentials (hashed) and audit history.

SECURITY NOTICE:
- Passwords are encrypted/hashed using Werkzeug generate_password_hash.
- Plaintext passwords are NEVER stored.
- AES encryption keys are NEVER stored in this database.
"""

import sqlite3
import os
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from config import Config

def get_db_connection():
    """Create and return a database connection with dictionary-like row access."""
    # Ensure instance directory exists
    os.makedirs(Config.INSTANCE_FOLDER, exist_ok=True)
    conn = sqlite3.connect(Config.DATABASE)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    """Initialize database tables if they do not already exist."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # File operations history table
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
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
    """)
    
    conn.commit()
    conn.close()

def create_user(name: str, email: str, password: str) -> int:
    """
    Register a new user with a hashed password.
    Returns the created user's ID.
    Raises ValueError on duplicate email or invalid input.
    """
    clean_name = name.strip()
    clean_email = email.strip().lower()
    
    if not clean_name or not clean_email or not password:
        raise ValueError("All fields are required.")
    
    if len(password) < 6:
        raise ValueError("Password must be at least 6 characters.")
    
    password_hash = generate_password_hash(password)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
            (clean_name, clean_email, password_hash)
        )
        conn.commit()
        user_id = cursor.lastrowid
        return user_id
    except sqlite3.IntegrityError:
        raise ValueError("An account with this email address already exists.")
    finally:
        conn.close()

def get_user_by_email(email: str):
    """Retrieve user record by email."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email.strip().lower(),))
    user = cursor.fetchone()
    conn.close()
    return user

def get_user_by_id(user_id: int):
    """Retrieve user record by ID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, created_at FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()
    return user

def update_user_name(user_id: int, new_name: str) -> bool:
    """Update user's profile display name."""
    clean_name = new_name.strip()
    if not clean_name:
        return False
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET name = ? WHERE id = ?", (clean_name, user_id))
    conn.commit()
    conn.close()
    return True

def record_file_operation(user_id: int, original_filename: str, encrypted_filename: str, file_size: int, operation: str, status: str = 'Success'):
    """Record a file encryption or decryption event for auditing/history."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO files (user_id, original_filename, encrypted_filename, file_size, operation, status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (user_id, original_filename, encrypted_filename, file_size, operation, status))
    conn.commit()
    conn.close()

def get_user_history(user_id: int, operation_filter: str = 'All', search_query: str = ''):
    """Fetch history records for a user with optional filtering and search."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = "SELECT * FROM files WHERE user_id = ?"
    params = [user_id]
    
    if operation_filter in ['Encryption', 'Decryption']:
        query += " AND operation = ?"
        params.append(operation_filter)
        
    if search_query:
        query += " AND (original_filename LIKE ? OR encrypted_filename LIKE ?)"
        term = f"%{search_query}%"
        params.extend([term, term])
        
    query += " ORDER BY created_at DESC"
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return rows

def get_user_statistics(user_id: int) -> dict:
    """Calculate dashboard statistics for the logged-in user."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM files WHERE user_id = ?", (user_id,))
    total_ops = cursor.fetchone()[0] or 0
    
    cursor.execute("SELECT COUNT(*) FROM files WHERE user_id = ? AND operation = 'Encryption'", (user_id,))
    encrypted_count = cursor.fetchone()[0] or 0
    
    cursor.execute("SELECT COUNT(*) FROM files WHERE user_id = ? AND operation = 'Decryption'", (user_id,))
    decrypted_count = cursor.fetchone()[0] or 0
    
    cursor.execute("SELECT SUM(file_size) FROM files WHERE user_id = ?", (user_id,))
    total_bytes = cursor.fetchone()[0] or 0
    
    conn.close()
    
    return {
        "total_operations": total_ops,
        "encrypted_files": encrypted_count,
        "decrypted_files": decrypted_count,
        "total_bytes": total_bytes
    }
