# AESVault — Secure File Encryption and Decryption System

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![Flask 3.0](https://img.shields.io/badge/Flask-3.0.3-green.svg)](https://flask.palletsprojects.com/)
[![Cryptography](https://img.shields.io/badge/Cryptography-AES--256--GCM-indigo.svg)](https://cryptography.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

An academic cybersecurity project focused **exclusively on the Advanced Encryption Standard (AES)** using **AES-256 in Galois/Counter Mode (AES-256-GCM)**. Designed for college students to demonstrate, run locally, explain in viva examinations, and submit as a production-grade software architecture.

---

## 📌 Project Overview

**AESVault** enables authenticated users to securely encrypt any file (PDFs, images, code, archives, audio, documents up to 100 MB) using a 256-bit AES key and a fresh 12-byte random nonce. 

Unlike basic encryption projects that only provide confidentiality (e.g., standard CBC mode or vulnerable ECB mode), AESVault uses **Galois/Counter Mode (GCM)**, an **Authenticated Encryption with Associated Data (AEAD)** standard specified by NIST SP 800-38D. This ensures that:
1. **Confidentiality:** The file content is mathematically shielded by 14 rounds of AES-256 byte substitutions, shift rows, mix columns, and round key additions.
2. **Integrity & Authenticity:** A 128-bit authentication tag is automatically computed and verified. If an attacker modifies even a single bit of the file or if the user enters the wrong AES key, the system safely aborts decryption with zero data leakage.

---

## 🚀 Key Features

- **Real AES-256-GCM Encryption:** Real byte-level encryption using Python's industry-standard `cryptography` library.
- **Unique Nonce per File:** Generates a cryptographically random 12-byte (96-bit) nonce for every file, guaranteeing that nonce reuse is impossible.
- **Client/User Key Sovereignty:** Zero-knowledge key model. Secret AES keys are **never stored on the server** and **never stored in the database**.
- **Tamper Detection:** Uses the 16-byte GCM authentication tag to detect file modification or invalid keys immediately.
- **Binary File Format (.enc):** Encapsulates magic bytes (`AESV`), versioning, original filename, nonce, and authenticated ciphertext into a portable file format.
- **User Authentication:** Multi-user support with secure password hashing via `werkzeug.security.generate_password_hash` (`pbkdf2:sha256`).
- **Interactive Educational AES Visualizer:** Live interactive demonstration showing plaintext conversion, key generation, 12-byte nonce, ciphertext, and tag verification.
- **Cryptographic Audit History:** Real SQLite tracking of file sizes, timestamps, operations, and status with filter and search capabilities.
- **Path Traversal Defense:** Sanitization with `secure_filename()` and user session directory sandboxing.
- **Academic Viva Voce Guide:** Built-in oral examination questions and answers for defending the project.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Backend** | Python 3 + Flask 3.0.3 | Clean MVC architecture, session auth, REST endpoints |
| **Cryptography** | `cryptography.hazmat.primitives.ciphers.aead.AESGCM` | Official NIST AES-256-GCM standard |
| **Database** | SQLite 3 | Embedded, zero-configuration database |
| **Password Hashing** | `werkzeug.security` | PBKDF2 with SHA-256 and salt |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript | Responsive dark cybersecurity design, glassmorphism |
| **File Format** | Binary `.enc` container | Magic header `AESV`, version byte, nonce, ciphertext |

---

## 🔒 Binary `.enc` File Package Format

AESVault packs all necessary decryption metadata (except the secret key) into a custom binary structure:

```
+-------------------------------------------------------------------------------+
| Bytes 0-3  | Byte 4 | Byte 5    | Bytes 6-7     | Variable Bytes | 12 Bytes   |
| MAGIC      | VER    | NONCE_LEN | FILENAME_LEN  | ORIGINAL_NAME  | NONCE (IV) |
| 'AESV'     | 0x01   | 12        | uint16 (BE)   | UTF-8 bytes    | 96 bits    |
+-------------------------------------------------------------------------------+
| Remaining Bytes                                                               |
| CIPHERTEXT + 16-BYTE AUTHENTICATION TAG                                       |
+-------------------------------------------------------------------------------+
```

---

## 📂 Project Structure

```
AESVault/
│
├── app.py                      # Main Flask application and routing
├── config.py                   # Environment, storage paths, limits
├── requirements.txt            # Minimal verified dependencies
├── README.md                   # Complete academic documentation
├── .gitignore                  # Git hygiene rules
│
├── crypto/
│   ├── __init__.py
│   └── aes_crypto.py           # Core AES-256-GCM logic (encrypt/decrypt/key)
│
├── database/
│   ├── __init__.py
│   └── database.py             # SQLite schema and audit queries
│
├── uploads/                    # Temporary upload storage
├── encrypted/                  # Generated .enc packages
├── decrypted/                  # Restored files for user download
│
├── instance/
│   └── aesvault.db             # Auto-generated SQLite database
│
├── templates/
│   ├── base.html               # Master layout and modern header/footer
│   ├── index.html              # Cybersecurity landing page
│   ├── login.html              # Sign-in page
│   ├── register.html           # Registration with validation
│   ├── dashboard.html          # Stats and recent activity
│   ├── encrypt.html            # Drag-and-drop encryption UI with key gen
│   ├── decrypt.html            # Decryption UI with integrity verification
│   ├── history.html            # Audit history with search and filters
│   ├── aes.html                # Educational page and live visualizer
│   ├── profile.html            # User account settings
│   ├── 404.html                # Not found error handler
│   └── 500.html                # Server exception error handler
│
├── static/
│   ├── css/
│   │   └── style.css           # Modern dark-theme stylesheet
│   └── js/
│       ├── main.js             # Navigation and alert dismissals
│       ├── encrypt.js          # Encryption workflow & progress animation
│       ├── decrypt.js          # Decryption handling & clipboard
│       └── aes.js              # Educational visualizer controller
│
└── tests/
    └── test_crypto.py          # Cryptographic unit tests (exact byte recovery)
```

---

## 💻 Installation & Setup

### Prerequisites
- Python 3.10 or higher
- `pip` package manager

### 1. Clone or Extract the Project
```bash
git clone https://github.com/username/AESVault.git
cd AESVault
```

### 2. Create and Activate Virtual Environment

**On Linux / macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**On Windows (Command Prompt):**
```cmd
python -m venv venv
venv\Scripts\activate.bat
```

**On Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Application
```bash
python3 app.py
```
*(On Windows: `python app.py`)*

### 5. Access the Web App
Open your web browser and navigate to:
```
http://127.0.0.1:5000
```

---

## 🧪 Running Automated Unit Tests

AESVault includes automated tests that verify:
1. 256-bit key generation.
2. Exact byte recovery: `original_file_bytes == decrypted_file_bytes`.
3. Immediate rejection when an incorrect AES key is used.
4. Immediate rejection when even a single bit of ciphertext is tampered with.
5. Nonce uniqueness across multiple operations.

Run the test suite:
```bash
python3 -m unittest tests/test_crypto.py
```

Expected output:
```
......
----------------------------------------------------------------------
Ran 6 tests in 0.015s

OK
```

---

## 📖 Step-by-Step User Guide

### 1. Register and Login
- Click **"Register"** on the top right.
- Fill in Full Name, Email, and Password (min 6 characters). Passwords are securely hashed with PBKDF2-SHA256.
- Log in to your personal dashboard.

### 2. Encrypting a File
- Navigate to **"Encrypt File"**.
- Drag & drop your document or click **"Choose File"**.
- Click **"Generate AES Key"**. A 32-byte (256-bit) cryptographically random Base64 key will appear.
- **Copy and save your key!** (Or click "Save" to download the `.key` file).
- Click **"Encrypt File With AES-256"**.
- Download your secure `.enc` file (e.g., `thesis.pdf.enc`).

### 3. Decrypting a File
- Navigate to **"Decrypt File"**.
- Upload the `.enc` file.
- Paste the exact 256-bit AES key used during encryption.
- Click **"Decrypt & Verify File"**.
- If the key is correct and the file is untampered, the original file is recovered with its original name and exact bytes!

---

## 🎓 Viva Voce Questions & Model Answers

### Q1: What is AES and why is it called a symmetric algorithm?
> **Answer:** AES (Advanced Encryption Standard) is a symmetric block cipher standardized by NIST in 2001 (FIPS 197). It is called symmetric because the **same identical secret key** is required for both encrypting the plaintext and decrypting the ciphertext.

### Q2: What is the key size and block size of AES in this project?
> **Answer:** AES always uses a fixed block size of **128 bits (16 bytes)**. In AESVault, we use **AES-256**, meaning the secret key is **256 bits (32 bytes)** in length, which involves 14 internal rounds of transformation.

### Q3: What is GCM (Galois/Counter Mode) and why did you choose it over CBC?
> **Answer:** CBC (Cipher Block Chaining) only provides confidentiality and requires padding (PKCS#7), making it vulnerable to padding oracle attacks unless paired with a separate HMAC. GCM is an **Authenticated Encryption with Associated Data (AEAD)** mode. It combines Counter mode (CTR) for encryption and Galois Field multiplication (GMAC) to produce a 128-bit authentication tag. This ensures that any data corruption or tampering is automatically detected.

### Q4: What is a Nonce and why can it never be reused in GCM?
> **Answer:** A Nonce ("Number used ONCE") is a 96-bit (12-byte) initialization vector. In GCM mode, reusing the same nonce with the same key is a catastrophic cryptographic vulnerability that allows an attacker to deduce the authentication subkey (H) and forge valid authentication tags. AESVault generates a fresh `os.urandom(12)` nonce for every single encryption.

### Q5: Where is the AES key stored?
> **Answer:** The AES key is **never stored in the database or filesystem**. It is generated and provided to the user. This enforces zero-knowledge architecture: even if the server database is compromised, the attacker cannot decrypt any of the stored files without the user's secret key.

### Q6: What happens if an attacker modifies one byte of the encrypted file?
> **Answer:** During decryption, AES-GCM recalculates the 128-bit authentication tag over the received ciphertext. If even a single bit has been altered, the tag verification will fail, triggering an `InvalidTag` exception. Decryption immediately aborts and zero plaintext is released.

---

## 🛡️ Security Highlights

1. **No Hard-coded Keys:** Keys are generated using OS entropy (`os.urandom`).
2. **Safe File Uploads:** Path traversal vectors (`../`) are eliminated using Werkzeug's `secure_filename()`.
3. **No Execution of Uploads:** Files are stored outside static web directories and streamed strictly through authenticated endpoints.
4. **Session Protection:** Flask cookies are flagged `HttpOnly` with `SameSite=Lax`.

---

## 📄 License
This project is open-source and released under the MIT License for educational and academic purposes.
