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
 * Derives the 256-bit raw key used by AES-GCM from the passphrase using SHA-256.
 */
export async function deriveKeyBytes(keyString) {
  const encoder = new TextEncoder();
  const keyBytes = encoder.encode(keyString);
  const hash = await crypto.subtle.digest('SHA-256', keyBytes);
  return new Uint8Array(hash);
}

/**
 * Expands a 256-bit AES key into its 15 round keys (AES-256 key schedule).
 */
export function expandAes256Key(keyBytes) {
  if (!(keyBytes instanceof Uint8Array) || keyBytes.length !== 32) {
    throw new Error('AES-256 key must contain exactly 32 bytes.');
  }

  function multiplyInField(left, right) {
    let product = 0;
    for (let bit = 0; bit < 8; bit++) {
      if (right & 1) product ^= left;
      const highBit = left & 0x80;
      left = (left << 1) & 0xff;
      if (highBit) left ^= 0x1b;
      right >>= 1;
    }
    return product;
  }

  function rotateByteLeft(value, shift) {
    return ((value << shift) | (value >> (8 - shift))) & 0xff;
  }

  function substituteByte(value) {
    let inverse = 0;
    if (value !== 0) {
      let base = value;
      let exponent = 254;
      inverse = 1;
      while (exponent > 0) {
        if (exponent & 1) inverse = multiplyInField(inverse, base);
        base = multiplyInField(base, base);
        exponent >>= 1;
      }
    }
    return inverse ^ rotateByteLeft(inverse, 1) ^ rotateByteLeft(inverse, 2)
      ^ rotateByteLeft(inverse, 3) ^ rotateByteLeft(inverse, 4) ^ 0x63;
  }

  const expanded = new Uint8Array(240);
  expanded.set(keyBytes);
  let roundConstant = 1;

  for (let word = 8; word < 60; word++) {
    const offset = word * 4;
    const previous = expanded.slice(offset - 4, offset);

    if (word % 8 === 0) {
      const first = previous[0];
      previous[0] = substituteByte(previous[1]) ^ roundConstant;
      previous[1] = substituteByte(previous[2]);
      previous[2] = substituteByte(previous[3]);
      previous[3] = substituteByte(first);
      roundConstant = multiplyInField(roundConstant, 2);
    } else if (word % 8 === 4) {
      for (let index = 0; index < 4; index++) {
        previous[index] = substituteByte(previous[index]);
      }
    }

    for (let index = 0; index < 4; index++) {
      expanded[offset + index] = expanded[offset - 32 + index] ^ previous[index];
    }
  }

  return Array.from({ length: 15 }, (_, round) => expanded.slice(round * 16, (round + 1) * 16));
}

/**
 * Derives a 256-bit AES-GCM CryptoKey from user input string using SHA-256
 */
async function deriveKey(keyString) {
  const hash = await deriveKeyBytes(keyString);
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

