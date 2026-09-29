// Web Crypto API AES-256-GCM Cryptography Composable

/**
 * Converts an ArrayBuffer to a Base64 string
 */
export function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Converts a Base64 string to an ArrayBuffer
 */
export function base64ToBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Derives a 256-bit AES-GCM CryptoKey from user input string using SHA-256
 */
async function deriveKey(keyString) {
  const encoder = new TextEncoder();
  const keyBytes = encoder.encode(keyString);
  const hash = await crypto.subtle.digest('SHA-256', keyBytes);
  return crypto.subtle.importKey(
    'raw',
    hash,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Generates deterministic scrambled/corrupted text when decryption fails
 * @param {string} ciphertextBase64
 * @param {string} keyString
 * @returns {string}
 */
export function generateScrambledText(ciphertextBase64, keyString = '') {
  try {
    const raw = atob(ciphertextBase64);
    const chars = '█▓▒░#@!$%&*?/~^+=<>{}[]()|\\;:,.~0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ§±µ¿Ø×¶';
    let seed = 0;
    for (let i = 0; i < keyString.length; i++) {
      seed = (seed * 31 + keyString.charCodeAt(i)) >>> 0;
    }
    let result = '';
    const length = Math.max(30, Math.min(raw.length * 2, 400));
    for (let i = 0; i < length; i++) {
      const code = (raw.charCodeAt(i % raw.length) ^ (seed + i * 17)) % chars.length;
      result += chars[Math.abs(code) % chars.length];
      if (i > 0 && i % 48 === 0) result += '\n';
      else if (i > 0 && i % 8 === 0) result += ' ';
    }
    return result;
  } catch (e) {
    return '§k9#@!~?¿Ø×¶… %#@!*&^%$§¿Ø×¶…\n[DATA GAGAL TERDEKRIPSI / KUNCI SALAH]';
  }
}

/**
 * Converts a byte number to 2-char uppercase Hex
 */
export function byteToHex(byte) {
  return byte.toString(16).padStart(2, '0').toUpperCase();
}

/**
 * Splits an ArrayBuffer or Uint8Array into 16-byte chunks
 * @param {Uint8Array|ArrayBuffer} data
 * @param {number} blockSize
 * @returns {Uint8Array[]}
 */
export function splitIntoBlocks(data, blockSize = 16) {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  if (bytes.length === 0) {
    return [new Uint8Array(0)];
  }
  const blocks = [];
  for (let i = 0; i < bytes.length; i += blockSize) {
    blocks.push(bytes.slice(i, i + blockSize));
  }
  return blocks;
}

/**
 * Extracts ciphertext payload and 16-byte Authentication Tag from AES-GCM base64 string
 * In Web Crypto AES-GCM, the last 16 bytes (128 bits) of the ciphertext buffer are the GMAC tag.
 * @param {string} ciphertextBase64
 * @returns {{ cipherBytes: Uint8Array, tagBytes: Uint8Array, rawBytes: Uint8Array }}
 */
export function parseEncryptedPayload(ciphertextBase64) {
  try {
    const buffer = base64ToBuffer(ciphertextBase64);
    const rawBytes = new Uint8Array(buffer);
    if (rawBytes.length >= 16) {
      const cipherBytes = rawBytes.slice(0, rawBytes.length - 16);
      const tagBytes = rawBytes.slice(rawBytes.length - 16);
      return { cipherBytes, tagBytes, rawBytes };
    }
    return { cipherBytes: rawBytes, tagBytes: new Uint8Array(0), rawBytes };
  } catch (e) {
    return { cipherBytes: new Uint8Array(0), tagBytes: new Uint8Array(0), rawBytes: new Uint8Array(0) };
  }
}

export function useCrypto() {
  /**
   * Encrypts plaintext string using AES-256-GCM with a random 12-byte IV
   * @param {string} plaintext
   * @param {string} keyString
   * @returns {Promise<{ciphertext: string, iv: string, rawEncrypted: ArrayBuffer}>}
   */
  async function encryptNote(plaintext, keyString) {
    if (!plaintext || typeof plaintext !== 'string') {
      throw new Error('Content cannot be empty.');
    }
    if (!keyString || typeof keyString !== 'string') {
      throw new Error('Encryption key cannot be empty.');
    }

    const key = await deriveKey(keyString);
    const encoder = new TextEncoder();
    const encodedPlaintext = encoder.encode(plaintext);

    // 12-byte (96-bit) IV is standard and recommended for AES-GCM
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encodedPlaintext
    );

    return {
      ciphertext: bufferToBase64(encryptedBuffer),
      iv: bufferToBase64(iv),
      rawEncrypted: encryptedBuffer,
    };
  }

  /**
   * Decrypts AES-256-GCM ciphertext using the given key and IV
   * @param {string} ciphertextBase64
   * @param {string} ivBase64
   * @param {string} keyString
   * @returns {Promise<string>}
   */
  async function decryptNote(ciphertextBase64, ivBase64, keyString) {
    if (!ciphertextBase64 || !ivBase64) {
      throw new Error('The encrypted data is invalid or corrupted.');
    }
    if (!keyString) {
      throw new Error('Encryption key cannot be empty.');
    }

    try {
      const key = await deriveKey(keyString);
      const ciphertextBuffer = base64ToBuffer(ciphertextBase64);
      const ivBuffer = base64ToBuffer(ivBase64);

      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: new Uint8Array(ivBuffer),
        },
        key,
        ciphertextBuffer
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (err) {
      // Catch authentication tag mismatch or malformed base64
      throw new Error('Unable to decrypt note. The provided key may be incorrect.');
    }
  }

  return {
    encryptNote,
    decryptNote,
    generateScrambledText,
    byteToHex,
    splitIntoBlocks,
    parseEncryptedPayload,
  };
}

