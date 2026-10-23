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

const AES_SBOX = new Uint8Array([
  0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
  0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
  0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
  0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
  0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
  0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
  0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
  0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
  0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
  0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
  0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
  0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
  0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
  0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
  0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
  0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16,
]);

const AES_RCON = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40];

/**
 * Expands a 256-bit AES key into the 15 round keys used by AES-256.
 */
export function expandAes256KeyWithDetails(keyBytes) {
  if (!(keyBytes instanceof Uint8Array) || keyBytes.length !== 32) {
    throw new Error('AES-256 key expansion requires exactly 32 bytes.');
  }

  const words = [];
  const wordSteps = [];
  for (let i = 0; i < 8; i++) {
    const word = Array.from(keyBytes.slice(i * 4, i * 4 + 4));
    words.push(word);
    wordSteps.push({
      index: i,
      initial: true,
      resultWord: [...word],
    });
  }

  for (let i = 8; i < 60; i++) {
    let temp = [...words[i - 1]];
    let rotatedWord = null;
    let substitutedWord = null;
    let rconValue = null;
    if (i % 8 === 0) {
      rotatedWord = [temp[1], temp[2], temp[3], temp[0]];
      substitutedWord = rotatedWord.map((byte) => AES_SBOX[byte]);
      temp = [...substitutedWord];
      rconValue = AES_RCON[i / 8 - 1];
      temp[0] ^= rconValue;
    } else if (i % 8 === 4) {
      substitutedWord = temp.map((byte) => AES_SBOX[byte]);
      temp = [...substitutedWord];
    }
    const baseWord = [...words[i - 8]];
    const previousWord = [...words[i - 1]];
    const resultWord = baseWord.map((byte, index) => byte ^ temp[index]);
    words.push(resultWord);
    wordSteps.push({
      index: i,
      initial: false,
      baseWord,
      previousWord,
      rotatedWord,
      substitutedWord,
      rconValue,
      tempWord: [...temp],
      resultWord: [...resultWord],
    });
  }

  return {
    roundKeys: Array.from({ length: 15 }, (_, round) =>
      words.slice(round * 4, round * 4 + 4).flat()
    ),
    wordSteps,
  };
}

export function expandAes256Key(keyBytes) {
  return expandAes256KeyWithDetails(keyBytes).roundKeys;
}

function xtime(byte) {
  return ((byte << 1) ^ ((byte & 0x80) ? 0x11b : 0)) & 0xff;
}

function mixColumns(state) {
  const output = new Uint8Array(16);
  for (let column = 0; column < 4; column++) {
    const offset = column * 4;
    const a0 = state[offset];
    const a1 = state[offset + 1];
    const a2 = state[offset + 2];
    const a3 = state[offset + 3];
    const all = a0 ^ a1 ^ a2 ^ a3;

    output[offset] = a0 ^ all ^ xtime(a0 ^ a1);
    output[offset + 1] = a1 ^ all ^ xtime(a1 ^ a2);
    output[offset + 2] = a2 ^ all ^ xtime(a2 ^ a3);
    output[offset + 3] = a3 ^ all ^ xtime(a3 ^ a0);
  }
  return output;
}

function xorRoundKey(state, roundKey) {
  return state.map((byte, index) => byte ^ roundKey[index]);
}

/**
 * Returns the state after each AES-256 encryption operation.
 * State bytes use AES column-major order.
 */
export function createAes256EncryptionTrace(inputBlock, roundKeys) {
  if (!(inputBlock instanceof Uint8Array) || inputBlock.length !== 16) {
    throw new Error('AES encryption requires exactly 16 input bytes.');
  }
  if (!Array.isArray(roundKeys) || roundKeys.length !== 15 || roundKeys.some((key) => key.length !== 16)) {
    throw new Error('AES-256 encryption requires 15 round keys of 16 bytes each.');
  }

  const trace = [];
  let state = xorRoundKey(inputBlock, roundKeys[0]);
  trace.push({
    round: 0,
    steps: [{ name: 'AddRoundKey (awal)', state: new Uint8Array(state) }],
  });

  for (let round = 1; round <= 14; round++) {
    const steps = [];
    state = state.map((byte) => AES_SBOX[byte]);
    steps.push({ name: 'SubBytes', state: new Uint8Array(state) });

    const shifted = new Uint8Array(16);
    for (let row = 0; row < 4; row++) {
      for (let column = 0; column < 4; column++) {
        shifted[row + 4 * column] = state[row + 4 * ((column + row) % 4)];
      }
    }
    state = shifted;
    steps.push({ name: 'ShiftRows', state: new Uint8Array(state) });

    if (round < 14) {
      state = mixColumns(state);
      steps.push({ name: 'MixColumns', state: new Uint8Array(state) });
    }

    state = xorRoundKey(state, roundKeys[round]);
    steps.push({ name: 'AddRoundKey', state: new Uint8Array(state) });
    trace.push({ round, steps });
  }

  return trace;
}

async function deriveKeyBytes(keyString) {
  const encoder = new TextEncoder();
  const keyBytes = encoder.encode(keyString);
  return new Uint8Array(await crypto.subtle.digest('SHA-256', keyBytes));
}

export async function getAes256KeySchedule(keyString) {
  const keyBytes = await deriveKeyBytes(keyString);
  const expansion = expandAes256KeyWithDetails(keyBytes);
  return {
    keyBytes,
    roundKeys: expansion.roundKeys,
    wordSteps: expansion.wordSteps,
  };
}

/**
 * Derives a 256-bit AES-GCM CryptoKey from user input string using SHA-256
 */
async function deriveKey(keyString) {
  const keyBytes = await deriveKeyBytes(keyString);
  return crypto.subtle.importKey(
    'raw',
    keyBytes,
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
