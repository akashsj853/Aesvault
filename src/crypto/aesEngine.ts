/**
 * AESVault Web Cryptography Engine
 * Implements real AES-256-GCM using Web Crypto API.
 * 
 * 100% Bit-for-Bit Compatible with Python cryptography AESGCM:
 * - 256-bit (32-byte) symmetric key
 * - 96-bit (12-byte) random nonce/IV
 * - 128-bit (16-byte) authentication tag appended to ciphertext
 * 
 * Binary Package Format:
 * [MAGIC: 4B 'AESV'] [VER: 1B (0x01)] [NONCE_LEN: 1B (12)] [FNAME_LEN: 2B (uint16 BE)]
 * [ORIGINAL_FNAME: NB utf-8] [NONCE: 12B] [CIPHERTEXT + 16B TAG: remaining bytes]
 */

export const MAGIC_HEADER = new Uint8Array([0x41, 0x45, 0x53, 0x56]); // 'AESV'
export const VERSION = 1;
export const NONCE_LENGTH = 12; // 96 bits
export const KEY_LENGTH = 32;   // 256 bits
export const TAG_LENGTH = 16;   // 128 bits

/**
 * Generate a cryptographically secure 256-bit AES key encoded in Base64.
 */
export function generateAESKey(): string {
  const bytes = new Uint8Array(KEY_LENGTH);
  window.crypto.getRandomValues(bytes);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Convert Base64 string to raw Uint8Array key bytes.
 */
export function decodeBase64Key(b64Key: string): Uint8Array {
  const clean = b64Key.trim();
  if (!clean) throw new Error("AES key is required.");
  
  let raw: string;
  try {
    raw = window.atob(clean);
  } catch {
    throw new Error("Invalid Base64 formatting in AES key.");
  }

  if (raw.length !== KEY_LENGTH) {
    throw new Error(`Invalid key length: Expected 256 bits (32 bytes), but received ${raw.length} bytes.`);
  }

  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    bytes[i] = raw.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encrypt a File or Uint8Array using AES-256-GCM.
 */
export async function encryptFilePackage(
  dataBytes: Uint8Array,
  originalFilename: string,
  b64Key: string
): Promise<Uint8Array> {
  const rawKey = decodeBase64Key(b64Key);

  // Import CryptoKey
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    rawKey as unknown as BufferSource,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  // Generate fresh, cryptographically secure 12-byte Nonce
  const nonce = new Uint8Array(NONCE_LENGTH);
  window.crypto.getRandomValues(nonce);

  // Encrypt plaintext with AES-GCM (automatically appends 16-byte tag)
  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce },
    cryptoKey,
    dataBytes as unknown as BufferSource
  );
  const ciphertextWithTag = new Uint8Array(ciphertextBuffer);

  // Encode Filename into UTF-8
  const safeFilename = originalFilename || 'decrypted_file';
  const fnameBytes = new TextEncoder().encode(safeFilename);
  const fnameLen = fnameBytes.length;

  // Build binary package:
  // MAGIC (4) + VER (1) + NONCE_LEN (1) + FNAME_LEN (2) + FNAME (N) + NONCE (12) + CIPHERTEXT
  const headerLen = 4 + 1 + 1 + 2;
  const totalLength = headerLen + fnameLen + NONCE_LENGTH + ciphertextWithTag.length;
  const packageBytes = new Uint8Array(totalLength);

  // Magic
  packageBytes.set(MAGIC_HEADER, 0);
  // Version
  packageBytes[4] = VERSION;
  // Nonce Len
  packageBytes[5] = NONCE_LENGTH;
  // Filename Len (Big Endian uint16)
  packageBytes[6] = (fnameLen >> 8) & 0xFF;
  packageBytes[7] = fnameLen & 0xFF;
  // Filename
  packageBytes.set(fnameBytes, 8);

  const nonceOffset = 8 + fnameLen;
  packageBytes.set(nonce, nonceOffset);

  const cipherOffset = nonceOffset + NONCE_LENGTH;
  packageBytes.set(ciphertextWithTag, cipherOffset);

  return packageBytes;
}

/**
 * Decrypt an AESVault .enc binary package.
 */
export async function decryptFilePackage(
  encryptedPackage: Uint8Array,
  b64Key: string
): Promise<{ decryptedBytes: Uint8Array; originalFilename: string }> {
  const rawKey = decodeBase64Key(b64Key);

  // Minimum length check
  const minLen = 4 + 1 + 1 + 2 + NONCE_LENGTH + TAG_LENGTH;
  if (encryptedPackage.length < minLen) {
    throw new Error("The encrypted file is invalid or corrupted (file size too small).");
  }

  // Verify Magic Header 'AESV'
  for (let i = 0; i < 4; i++) {
    if (encryptedPackage[i] !== MAGIC_HEADER[i]) {
      throw new Error("Invalid file format. This is not a valid AESVault encrypted file.");
    }
  }

  const version = encryptedPackage[4];
  if (version !== VERSION) {
    throw new Error(`Unsupported AESVault version: ${version}. Expected version ${VERSION}.`);
  }

  const nonceLen = encryptedPackage[5];
  if (nonceLen !== NONCE_LENGTH) {
    throw new Error(`Invalid nonce length: ${nonceLen}. Expected ${NONCE_LENGTH} bytes.`);
  }

  // Filename length
  const fnameLen = (encryptedPackage[6] << 8) | encryptedPackage[7];
  let offset = 8;

  if (encryptedPackage.length < offset + fnameLen + nonceLen + TAG_LENGTH) {
    throw new Error("The encrypted package metadata is truncated.");
  }

  // Original Filename
  const fnameBytes = encryptedPackage.slice(offset, offset + fnameLen);
  let originalFilename = "decrypted_file";
  try {
    originalFilename = new TextDecoder('utf-8').decode(fnameBytes);
  } catch {
    originalFilename = "decrypted_file";
  }
  offset += fnameLen;

  // Nonce
  const nonce = encryptedPackage.slice(offset, offset + nonceLen);
  offset += nonceLen;

  // Ciphertext + 16-byte Tag
  const ciphertextWithTag = encryptedPackage.slice(offset);

  // Import CryptoKey
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    rawKey as unknown as BufferSource,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: nonce },
      cryptoKey,
      ciphertextWithTag as unknown as BufferSource
    );
    return {
      decryptedBytes: new Uint8Array(decryptedBuffer),
      originalFilename
    };
  } catch {
    // Web Crypto raises an OperationError on tag verification failure or wrong key
    throw new Error("Decryption failed. The AES key is incorrect or the file has been modified.");
  }
}

/**
 * Text Visualizer Helper
 */
export async function visualizeAESText(text: string, b64Key: string) {
  const rawKey = decodeBase64Key(b64Key);
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    rawKey as unknown as BufferSource,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  const nonce = new Uint8Array(NONCE_LENGTH);
  window.crypto.getRandomValues(nonce);

  const encoded = new TextEncoder().encode(text);
  const cipherBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce },
    cryptoKey,
    encoded as unknown as BufferSource
  );

  const combined = new Uint8Array(cipherBuffer);
  const pureCipher = combined.slice(0, -TAG_LENGTH);
  const authTag = combined.slice(-TAG_LENGTH);

  const toHex = (buf: Uint8Array) => Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');
  const toB64 = (buf: Uint8Array) => {
    let s = '';
    for (let i = 0; i < buf.length; i++) s += String.fromCharCode(buf[i]);
    return window.btoa(s);
  };

  return {
    keyHex: toHex(rawKey),
    keyB64: b64Key,
    nonceHex: toHex(nonce),
    nonceB64: toB64(nonce),
    pureCipherHex: toHex(pureCipher),
    authTagHex: toHex(authTag),
    combinedHex: toHex(combined),
    combinedB64: toB64(combined)
  };
}

export async function visualizeDecryptText(combinedB64: string, nonceB64: string, b64Key: string): Promise<string> {
  const rawKey = decodeBase64Key(b64Key);
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    rawKey as unknown as BufferSource,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  const nonceRaw = window.atob(nonceB64);
  const nonce = new Uint8Array(nonceRaw.length);
  for (let i = 0; i < nonceRaw.length; i++) nonce[i] = nonceRaw.charCodeAt(i);

  const cipherRaw = window.atob(combinedB64);
  const ciphertextWithTag = new Uint8Array(cipherRaw.length);
  for (let i = 0; i < cipherRaw.length; i++) ciphertextWithTag[i] = cipherRaw.charCodeAt(i);

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: nonce },
      cryptoKey,
      ciphertextWithTag as unknown as BufferSource
    );
    return new TextDecoder('utf-8').decode(decryptedBuffer);
  } catch {
    throw new Error("Decryption failed. The AES key is incorrect or data was altered.");
  }
}
