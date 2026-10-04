"""
AES-256-GCM Core Cryptographic Implementation for AESVault.

Algorithm: Advanced Encryption Standard (AES) in Galois/Counter Mode (GCM)
Key size: 256 bits (32 bytes)
Nonce / IV size: 96 bits (12 bytes) as recommended by NIST SP 800-38D
Tag size: 128 bits (16 bytes) authentication tag automatically verified by GCM

Binary File Package Format:
+-------------------------------------------------------------------------+
| MAGIC (4B) | VER (1B) | NONCE_LEN (1B) | FNAME_LEN (2B) | FNAME (NB)    |
| 'AESV'     | 0x01     | 12             | uint16 (BE)    | UTF-8 bytes   |
+-------------------------------------------------------------------------+
| NONCE (12B)           | CIPHERTEXT + AUTH_TAG (Remaining bytes)        |
+-------------------------------------------------------------------------+
"""

import os
import base64
import struct
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.exceptions import InvalidTag

MAGIC_HEADER = b"AESV"
VERSION = 1
NONCE_LENGTH = 12       # 96 bits (standard for AES-GCM)
KEY_LENGTH_BYTES = 32   # 256 bits for AES-256
TAG_LENGTH_BYTES = 16   # 128-bit authentication tag

def generate_key() -> str:
    """
    Generate a cryptographically secure 256-bit (32-byte) AES key.
    Returns the key as a URL-safe Base64 string for easy copying/storage.
    """
    key_bytes = os.urandom(KEY_LENGTH_BYTES)
    return base64.b64encode(key_bytes).decode('utf-8')

def decode_key(b64_key: str) -> bytes:
    """
    Validate and decode a Base64-encoded AES-256 key.
    Raises ValueError if key length is not exactly 32 bytes (256 bits).
    """
    if not b64_key:
        raise ValueError("AES key is required.")
    
    clean_key = b64_key.strip()
    try:
        key_bytes = base64.b64decode(clean_key)
    except Exception as e:
        raise ValueError("Invalid Base64 formatting in AES key.") from e

    if len(key_bytes) != KEY_LENGTH_BYTES:
        raise ValueError(
            f"Invalid key length: Expected 256 bits ({KEY_LENGTH_BYTES} bytes), "
            f"but received {len(key_bytes)} bytes."
        )
    return key_bytes

def encrypt_file(plaintext_bytes: bytes, original_filename: str, b64_key: str) -> bytes:
    """
    Encrypt file data using AES-256-GCM.
    
    Parameters:
        plaintext_bytes: The original binary content of the file
        original_filename: The original filename (preserved in header for decryption)
        b64_key: Base64-encoded 256-bit AES key
        
    Returns:
        Packaged bytes containing Header, Metadata, Nonce, and Authenticated Ciphertext.
    """
    key = decode_key(b64_key)
    
    # Generate a fresh, unique 12-byte nonce for every single encryption.
    # CRITICAL: Never reuse a nonce with the same key in GCM mode!
    nonce = os.urandom(NONCE_LENGTH)
    
    # Initialize AES-GCM cipher
    aesgcm = AESGCM(key)
    
    # Encrypt plaintext. AESGCM.encrypt automatically computes and appends
    # the 16-byte authentication tag to the ciphertext.
    ciphertext_with_tag = aesgcm.encrypt(nonce, plaintext_bytes, None)
    
    # Sanitize and encode original filename
    safe_fname = os.path.basename(original_filename) if original_filename else "decrypted_file"
    fname_bytes = safe_fname.encode('utf-8')
    fname_len = len(fname_bytes)
    
    # Header format: MAGIC (4B) + VER (1B) + NONCE_LEN (1B) + FNAME_LEN (2B uint16)
    header = MAGIC_HEADER + struct.pack("!BBH", VERSION, NONCE_LENGTH, fname_len)
    
    # Complete package
    package = header + fname_bytes + nonce + ciphertext_with_tag
    return package

def decrypt_file(encrypted_package: bytes, b64_key: str) -> tuple[bytes, str]:
    """
    Decrypt an AESVault .enc package using AES-256-GCM.
    
    Parameters:
        encrypted_package: The complete binary package from the .enc file
        b64_key: Base64-encoded 256-bit AES key provided by user
        
    Returns:
        tuple (decrypted_plaintext_bytes, original_filename)
        
    Raises:
        ValueError if the file header is invalid, package is corrupted,
        or AES key is incorrect (authentication tag verification fails).
    """
    key = decode_key(b64_key)
    
    # Minimum required length: 4B (magic) + 1B (ver) + 1B (nonce_len) + 2B (fname_len) + 12B (nonce) + 16B (min tag)
    min_len = len(MAGIC_HEADER) + 4 + NONCE_LENGTH + TAG_LENGTH_BYTES
    if len(encrypted_package) < min_len:
        raise ValueError("The encrypted file is invalid or corrupted (file size too small).")
    
    # Verify Magic Header
    if not encrypted_package.startswith(MAGIC_HEADER):
        raise ValueError("Invalid file format. This is not a valid AESVault encrypted file.")
    
    offset = len(MAGIC_HEADER)
    version, nonce_len, fname_len = struct.unpack("!BBH", encrypted_package[offset:offset+4])
    offset += 4
    
    if version != VERSION:
        raise ValueError(f"Unsupported AESVault version: {version}. Expected version {VERSION}.")
    
    if nonce_len != NONCE_LENGTH:
        raise ValueError(f"Invalid nonce length: {nonce_len}. Expected {NONCE_LENGTH} bytes.")
    
    # Extract original filename
    if len(encrypted_package) < offset + fname_len + nonce_len + TAG_LENGTH_BYTES:
        raise ValueError("The encrypted package metadata is truncated.")
    
    fname_bytes = encrypted_package[offset:offset+fname_len]
    try:
        original_filename = fname_bytes.decode('utf-8')
    except UnicodeDecodeError:
        original_filename = "decrypted_file"
    offset += fname_len
    
    # Extract Nonce
    nonce = encrypted_package[offset:offset+nonce_len]
    offset += nonce_len
    
    # Extract Ciphertext (includes authentication tag)
    ciphertext_with_tag = encrypted_package[offset:]
    
    # Decrypt and authenticate
    aesgcm = AESGCM(key)
    try:
        # aesgcm.decrypt decrypts and simultaneously validates the 16-byte authentication tag.
        # If the key is wrong OR even a single bit of ciphertext/nonce has been tampered with,
        # an InvalidTag exception is raised immediately.
        plaintext = aesgcm.decrypt(nonce, ciphertext_with_tag, None)
        return plaintext, original_filename
    except InvalidTag as e:
        raise ValueError("Decryption failed. The AES key is incorrect or the file has been modified.") from e
    except Exception as e:
        raise ValueError("Decryption failed due to an unexpected cryptographic error.") from e

def encrypt_text(plaintext: str, b64_key: str) -> dict:
    """
    Helper for educational AES visualizer.
    Encrypts a text string and returns step-by-step cryptographic values for display.
    """
    key = decode_key(b64_key)
    nonce = os.urandom(NONCE_LENGTH)
    aesgcm = AESGCM(key)
    
    data_bytes = plaintext.encode('utf-8')
    ciphertext_with_tag = aesgcm.encrypt(nonce, data_bytes, None)
    
    # Separate tag (last 16 bytes) and pure ciphertext for educational visualization
    pure_ciphertext = ciphertext_with_tag[:-TAG_LENGTH_BYTES]
    auth_tag = ciphertext_with_tag[-TAG_LENGTH_BYTES:]
    
    return {
        "plaintext": plaintext,
        "key_hex": key.hex(),
        "key_b64": b64_key,
        "nonce_hex": nonce.hex(),
        "nonce_b64": base64.b64encode(nonce).decode('utf-8'),
        "pure_ciphertext_hex": pure_ciphertext.hex(),
        "auth_tag_hex": auth_tag.hex(),
        "combined_hex": ciphertext_with_tag.hex(),
        "combined_b64": base64.b64encode(ciphertext_with_tag).decode('utf-8')
    }

def decrypt_text(combined_b64: str, nonce_b64: str, b64_key: str) -> str:
    """
    Helper for educational AES visualizer.
    Decrypts a visualized ciphertext package.
    """
    key = decode_key(b64_key)
    nonce = base64.b64decode(nonce_b64)
    ciphertext_with_tag = base64.b64decode(combined_b64)
    
    aesgcm = AESGCM(key)
    try:
        decrypted_bytes = aesgcm.decrypt(nonce, ciphertext_with_tag, None)
        return decrypted_bytes.decode('utf-8')
    except InvalidTag as e:
        raise ValueError("Decryption failed. The AES key is incorrect or data was altered.") from e
