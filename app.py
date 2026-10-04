"""
AESVault - Secure File Encryption and Decryption System.
Main Flask Application Server.

Focus: AES (Advanced Encryption Standard) - AES-256-GCM authenticated encryption.
Compatible with standard WSGI servers and Vercel serverless execution.
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

from config import Config, BASE_DIR
from database import (
    init_db, create_user, get_user_by_email, get_user_by_id,
    update_user_name, record_file_operation, get_user_history,
    get_user_statistics
)
from crypto import (
    generate_key, decode_key, encrypt_file, decrypt_file,
    encrypt_text, decrypt_text
)

app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, 'templates'),
    static_folder=os.path.join(BASE_DIR, 'static')
)
app.config.from_object(Config)

# Ensure required storage folders exist with proper permissions
for folder in [Config.UPLOAD_FOLDER, Config.ENCRYPTED_FOLDER, Config.DECRYPTED_FOLDER, Config.INSTANCE_FOLDER]:
    try:
        os.makedirs(folder, exist_ok=True)
    except Exception:
        pass

# Initialize database schema on startup
try:
    with app.app_context():
        init_db()
except Exception as e:
    print(f"Warning: DB initialization error: {e}")

# -------------------------------------------------------------
# Authentication Decorator
# -------------------------------------------------------------
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash("Please log in to continue.", "warning")
            return redirect(url_for('login', next=request.url))
        return f(*args, **kwargs)
    return decorated_function

@app.context_processor
def inject_user():
    """Inject current user profile into templates."""
    user = None
    if 'user_id' in session:
        try:
            user = get_user_by_id(session['user_id'])
        except Exception:
            user = None
    return {'current_user': user}

# -------------------------------------------------------------
# Public Routes
# -------------------------------------------------------------
@app.route('/')
def index():
    """Landing Page with AES visual workflow and cybersecurity features."""
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    """User Registration."""
    if 'user_id' in session:
        return redirect(url_for('dashboard'))

    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')

        if not name or not email or not password:
            flash("All fields are required.", "danger")
            return render_template('register.html', name=name, email=email)

        if '@' not in email or '.' not in email:
            flash("Please enter a valid email address.", "danger")
            return render_template('register.html', name=name, email=email)

        if len(password) < 6:
            flash("Password must be at least 6 characters long.", "danger")
            return render_template('register.html', name=name, email=email)

        if password != confirm_password:
            flash("Passwords do not match.", "danger")
            return render_template('register.html', name=name, email=email)

        try:
            user_id = create_user(name, email, password)
            flash("Account registered successfully! Please log in.", "success")
            return redirect(url_for('login'))
        except ValueError as e:
            flash(str(e), "danger")
            return render_template('register.html', name=name, email=email)

    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """User Login with secure password verification."""
    if 'user_id' in session:
        return redirect(url_for('dashboard'))

    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')

        user = get_user_by_email(email)
        if user and check_password_hash(user['password_hash'], password):
            session.clear()
            session['user_id'] = user['id']
            session['user_name'] = user['name']
            session['user_email'] = user['email']
            flash(f"Welcome back, {user['name']}!", "success")
            next_page = request.args.get('next')
            return redirect(next_page if next_page and next_page.startswith('/') else url_for('dashboard'))

        flash("Invalid email or password.", "danger")
        return render_template('login.html', email=email)

    return render_template('login.html')

@app.route('/logout')
def logout():
    """Log out current user and clear session."""
    session.clear()
    flash("You have been securely logged out.", "info")
    return redirect(url_for('login'))

# -------------------------------------------------------------
# Dashboard & Protected Routes
# -------------------------------------------------------------
@app.route('/dashboard')
@login_required
def dashboard():
    """User Dashboard with real statistics and recent activities."""
    user_id = session['user_id']
    try:
        stats = get_user_statistics(user_id)
        recent_history = get_user_history(user_id)[:5]
    except Exception:
        stats = {"total_operations": 0, "encrypted_files": 0, "decrypted_files": 0, "total_bytes": 0}
        recent_history = []
    return render_template('dashboard.html', stats=stats, recent_history=recent_history)

@app.route('/encrypt', methods=['GET', 'POST'])
@login_required
def encrypt():
    """File Encryption Page using AES-256-GCM."""
    if request.method == 'POST':
        if 'file' not in request.files:
            flash("Please select a file to encrypt.", "danger")
            return redirect(request.url)

        file = request.files['file']
        if file.filename == '':
            flash("No file was selected.", "danger")
            return redirect(request.url)

        aes_key = request.form.get('aes_key', '').strip()
        if not aes_key:
            flash("Please provide or generate an AES key.", "danger")
            return redirect(request.url)

        try:
            original_filename = secure_filename(file.filename) or "secure_file"
            file_bytes = file.read()
            file_size = len(file_bytes)

            if file_size > app.config['MAX_CONTENT_LENGTH']:
                flash("File exceeds the 100 MB limit.", "danger")
                return redirect(request.url)

            # Perform REAL AES-256-GCM encryption
            encrypted_data = encrypt_file(file_bytes, original_filename, aes_key)

            # Save the encrypted file securely
            encrypted_filename = f"{original_filename}.enc"
            save_path = os.path.join(Config.ENCRYPTED_FOLDER, f"{session['user_id']}_{int(time.time())}_{encrypted_filename}")
            
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            with open(save_path, 'wb') as f:
                f.write(encrypted_data)

            # Record in SQLite history
            try:
                record_file_operation(
                    user_id=session['user_id'],
                    original_filename=original_filename,
                    encrypted_filename=encrypted_filename,
                    file_size=file_size,
                    operation='Encryption',
                    status='Success'
                )
            except Exception as db_err:
                print(f"Warning: Failed to record history: {db_err}")

            # If requested as AJAX/JSON
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest' or request.accept_mimetypes.accept_json:
                session['last_encrypted_file'] = os.path.basename(save_path)
                session['download_filename'] = encrypted_filename
                return jsonify({
                    "success": True,
                    "message": "File encrypted successfully with AES-256-GCM.",
                    "encrypted_filename": encrypted_filename,
                    "download_url": url_for('download_file', file_type='encrypted', filename=os.path.basename(save_path))
                })

            flash(f"File '{original_filename}' successfully encrypted using AES-256-GCM!", "success")
            return render_template('encrypt.html',
                encrypted_filename=encrypted_filename,
                download_path=os.path.basename(save_path),
                encryption_done=True
            )

        except ValueError as e:
            flash(str(e), "danger")
            return redirect(request.url)
        except Exception as e:
            flash("An unexpected error occurred during encryption. Please try again.", "danger")
            return redirect(request.url)

    return render_template('encrypt.html')

@app.route('/decrypt', methods=['GET', 'POST'])
@login_required
def decrypt():
    """File Decryption Page using AES-256-GCM."""
    if request.method == 'POST':
        if 'file' not in request.files:
            flash("Please select an encrypted (.enc) file.", "danger")
            return redirect(request.url)

        file = request.files['file']
        if file.filename == '':
            flash("No file was selected.", "danger")
            return redirect(request.url)

        aes_key = request.form.get('aes_key', '').strip()
        if not aes_key:
            flash("Please enter the AES key.", "danger")
            return redirect(request.url)

        try:
            encrypted_bytes = file.read()
            file_size = len(encrypted_bytes)

            # Perform REAL AES-256-GCM decryption and authentication tag check
            decrypted_bytes, recovered_filename = decrypt_file(encrypted_bytes, aes_key)

            # Save decrypted file temporarily for user download
            safe_rec_fname = secure_filename(recovered_filename) or "decrypted_file"
            save_name = f"{session['user_id']}_{int(time.time())}_{safe_rec_fname}"
            save_path = os.path.join(Config.DECRYPTED_FOLDER, save_name)
            
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            with open(save_path, 'wb') as f:
                f.write(decrypted_bytes)

            # Record in SQLite history
            try:
                record_file_operation(
                    user_id=session['user_id'],
                    original_filename=safe_rec_fname,
                    encrypted_filename=file.filename,
                    file_size=len(decrypted_bytes),
                    operation='Decryption',
                    status='Success'
                )
            except Exception as db_err:
                print(f"Warning: Failed to record history: {db_err}")

            # Handle JSON/AJAX requests
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest' or request.accept_mimetypes.accept_json:
                return jsonify({
                    "success": True,
                    "message": "Decryption successful! File integrity verified.",
                    "recovered_filename": safe_rec_fname,
                    "download_url": url_for('download_file', file_type='decrypted', filename=save_name)
                })

            flash("Decryption successful! File integrity verified.", "success")
            return render_template('decrypt.html',
                decrypted_filename=safe_rec_fname,
                download_path=save_name,
                decryption_done=True
            )

        except ValueError as e:
            try:
                record_file_operation(
                    user_id=session['user_id'],
                    original_filename=file.filename,
                    encrypted_filename=file.filename,
                    file_size=len(encrypted_bytes),
                    operation='Decryption',
                    status='Failed'
                )
            except Exception:
                pass
            flash(str(e), "danger")
            return render_template('decrypt.html')
        except Exception:
            flash("Decryption failed. The AES key is incorrect or the file has been modified.", "danger")
            return render_template('decrypt.html')

    return render_template('decrypt.html')

@app.route('/download/<file_type>/<filename>')
@login_required
def download_file(file_type, filename):
    """Securely stream encrypted or decrypted files preventing path traversal."""
    # Prevent path traversal attacks
    safe_name = os.path.basename(filename)
    if '..' in safe_name or safe_name.startswith('/'):
        abort(400, "Invalid filename")

    # Verify that file belongs to this user session (prefix check)
    user_prefix = f"{session['user_id']}_"
    if not safe_name.startswith(user_prefix):
        abort(403, "Access denied to requested file.")

    if file_type == 'encrypted':
        directory = Config.ENCRYPTED_FOLDER
        download_name = safe_name.split('_', 2)[-1]
    elif file_type == 'decrypted':
        directory = Config.DECRYPTED_FOLDER
        download_name = safe_name.split('_', 2)[-1]
    else:
        abort(404, "Invalid file category.")

    file_path = os.path.join(directory, safe_name)
    if not os.path.exists(file_path):
        abort(404, "File not found or expired.")

    return send_file(
        file_path,
        as_attachment=True,
        download_name=download_name
    )

@app.route('/history')
@login_required
def history():
    """File Operation History with SQLite filtering and search."""
    user_id = session['user_id']
    op_filter = request.args.get('filter', 'All')
    search_q = request.args.get('search', '').strip()

    try:
        records = get_user_history(user_id, operation_filter=op_filter, search_query=search_q)
    except Exception:
        records = []
    return render_template('history.html', records=records, current_filter=op_filter, search_query=search_q)

@app.route('/aes')
def aes_educational():
    """Educational AES explanation and interactive visualizer."""
    return render_template('aes.html')

@app.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    """User Profile and account info."""
    user = get_user_by_id(session['user_id'])
    if request.method == 'POST':
        new_name = request.form.get('name', '').strip()
        if new_name:
            update_user_name(session['user_id'], new_name)
            session['user_name'] = new_name
            flash("Your profile name has been updated.", "success")
            return redirect(url_for('profile'))
        flash("Name cannot be empty.", "danger")
    return render_template('profile.html', user=user)

# -------------------------------------------------------------
# API Endpoints (For Key Generation & Educational Visualizer)
# -------------------------------------------------------------
@app.route('/api/generate-key', methods=['GET'])
def api_generate_key():
    """Generate a fresh 256-bit AES key encoded in URL-safe Base64."""
    key = generate_key()
    return jsonify({
        "status": "success",
        "key": key,
        "algorithm": "AES-256-GCM",
        "length_bits": 256
    })

@app.route('/api/visualize-aes', methods=['POST'])
def api_visualize_aes():
    """Educational AES-256-GCM live visualizer step-by-step breakdown."""
    data = request.get_json() or {}
    plaintext = data.get('plaintext', 'Hello AESVault')
    key = data.get('key')
    
    if not key:
        key = generate_key()
        
    try:
        result = encrypt_text(plaintext, key)
        return jsonify({"status": "success", "result": result})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route('/api/visualize-decrypt', methods=['POST'])
def api_visualize_decrypt():
    """Educational AES-256-GCM live visualizer decryption."""
    data = request.get_json() or {}
    combined_b64 = data.get('ciphertext')
    nonce_b64 = data.get('nonce')
    key = data.get('key')
    
    if not combined_b64 or not nonce_b64 or not key:
        return jsonify({"status": "error", "message": "Missing decryption parameters"}), 400
        
    try:
        plaintext = decrypt_text(combined_b64, nonce_b64, key)
        return jsonify({"status": "success", "plaintext": plaintext})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

# -------------------------------------------------------------
# Error Handlers
# -------------------------------------------------------------
@app.errorhandler(404)
def not_found_error(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template('500.html'), 500

@app.errorhandler(413)
def file_too_large(error):
    flash("File exceeds the 100 MB limit.", "danger")
    return redirect(request.url)

if __name__ == '__main__':
    # Run locally on 127.0.0.1:5000 as requested for student demo
    app.run(host='127.0.0.1', port=5000, debug=True)
