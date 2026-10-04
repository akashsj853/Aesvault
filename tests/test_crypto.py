"""
Automated Test Suite for AESVault.
Verifies:
1. AES-256 key generation (32 bytes / 256 bits)
2. AES-256-GCM encryption & decryption
3. Exact byte recovery: original_file_bytes == decrypted_file_bytes
4. Rejection of incorrect AES key (InvalidTag)
5. Rejection of tampered / corrupted ciphertext (InvalidTag)
6. Nonce uniqueness (different nonce for every encryption)
7. Package binary header integrity
"""

import unittest
import os
import tempfile
import base64
from crypto.aes_crypto import (
    generate_key, decode_key, encrypt_file, decrypt_file,
    MAGIC_HEADER, VERSION, NONCE_LENGTH
)

class TestAESVaultCryptography(unittest.TestCase):

    def setUp(self):
        self.test_key = generate_key()
        self.original_text = "AESVault Academic Security Project: Secret Document 2026."
        self.original_bytes = self.original_text.encode('utf-8')
        self.filename = "report.docx"

    def test_key_generation(self):
        """Test that generated key is a valid 32-byte (256-bit) Base64 string."""
        raw_key = decode_key(self.test_key)
        self.assertEqual(len(raw_key), 32, "Key must be exactly 32 bytes (256 bits)")

    def test_encrypt_decrypt_exact_byte_match(self):
        """CRITICAL: Test that original_file_bytes == decrypted_file_bytes."""
        # Arbitrary binary payload including null bytes and emoji
        binary_payload = b"\x00\xFF\xAA\x55\xDE\xAD\xBE\xEF" + "🚀 Encryption Works 🔒".encode('utf-8')
        test_filename = "data_analysis.pdf"

        # Encrypt
        encrypted_package = encrypt_file(binary_payload, test_filename, self.test_key)
        
        # Verify encrypted package is definitely different from original
        self.assertNotEqual(encrypted_package, binary_payload)
        self.assertTrue(encrypted_package.startswith(MAGIC_HEADER))

        # Decrypt with correct key
        decrypted_bytes, recovered_filename = decrypt_file(encrypted_package, self.test_key)

        # Confirm exact byte equality
        self.assertEqual(
            decrypted_bytes,
            binary_payload,
            "CRITICAL FAILURE: Decrypted bytes do not match original bytes!"
        )
        self.assertEqual(recovered_filename, test_filename)

    def test_wrong_key_fails_gracefully(self):
        """Test that an incorrect AES key is rejected by GCM authentication tag."""
        encrypted_package = encrypt_file(self.original_bytes, self.filename, self.test_key)
        
        different_key = generate_key()
        self.assertNotEqual(self.test_key, different_key)

        with self.assertRaises(ValueError) as context:
            decrypt_file(encrypted_package, different_key)

        self.assertIn("The AES key is incorrect or the file has been modified", str(context.exception))

    def test_tampered_ciphertext_fails(self):
        """Test that modifying even a single byte of ciphertext triggers GCM tag failure."""
        encrypted_package = bytearray(encrypt_file(self.original_bytes, self.filename, self.test_key))
        
        # Corrupt one byte near the end (in ciphertext/tag region)
        encrypted_package[-5] ^= 0xFF

        with self.assertRaises(ValueError) as context:
            decrypt_file(bytes(encrypted_package), self.test_key)

        self.assertIn("The AES key is incorrect or the file has been modified", str(context.exception))

    def test_tampered_header_fails(self):
        """Test that invalid magic bytes are rejected immediately."""
        encrypted_package = bytearray(encrypt_file(self.original_bytes, self.filename, self.test_key))
        
        # Corrupt magic header
        encrypted_package[0] = ord('X')

        with self.assertRaises(ValueError) as context:
            decrypt_file(bytes(encrypted_package), self.test_key)

        self.assertIn("Invalid file format", str(context.exception))

    def test_nonce_uniqueness(self):
        """Test that two encryptions of identical data with same key produce different nonces and ciphertexts."""
        enc1 = encrypt_file(self.original_bytes, self.filename, self.test_key)
        enc2 = encrypt_file(self.original_bytes, self.filename, self.test_key)

        self.assertNotEqual(enc1, enc2, "Nonces must never be reused!")

if __name__ == '__main__':
    unittest.main()
