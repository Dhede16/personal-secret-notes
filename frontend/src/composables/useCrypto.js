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

export function gfMul(a, b) {
  let p = 0;
  let aa = a;
  let bb = b;
  for (let i = 0; i < 8; i++) {
    if (bb & 1) p ^= aa;
    const hi = aa & 0x80;
    aa = (aa << 1) & 0xff;
    if (hi) aa ^= 0x1b;
    bb >>= 1;
  }
  return p;
}

const AES_INV_SBOX = new Uint8Array(256);
for (let i = 0; i < 256; i++) {
  AES_INV_SBOX[AES_SBOX[i]] = i;
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

export function invMixColumns(state) {
  const output = new Uint8Array(16);
  for (let column = 0; column < 4; column++) {
    const offset = column * 4;
    const s0 = state[offset];
    const s1 = state[offset + 1];
    const s2 = state[offset + 2];
    const s3 = state[offset + 3];

    output[offset] = gfMul(0x0e, s0) ^ gfMul(0x0b, s1) ^ gfMul(0x0d, s2) ^ gfMul(0x09, s3);
    output[offset + 1] = gfMul(0x09, s0) ^ gfMul(0x0e, s1) ^ gfMul(0x0b, s2) ^ gfMul(0x0d, s3);
    output[offset + 2] = gfMul(0x0d, s0) ^ gfMul(0x09, s1) ^ gfMul(0x0e, s2) ^ gfMul(0x0b, s3);
    output[offset + 3] = gfMul(0x0b, s0) ^ gfMul(0x0d, s1) ^ gfMul(0x09, s2) ^ gfMul(0x0e, s3);
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
    steps: [{
      name: 'AddRoundKey (awal)',
      inputState: new Uint8Array(inputBlock),
      roundKey: new Uint8Array(roundKeys[0]),
      state: new Uint8Array(state)
    }],
  });

  for (let round = 1; round <= 14; round++) {
    const steps = [];
    const beforeSub = new Uint8Array(state);
    state = state.map((byte) => AES_SBOX[byte]);
    steps.push({
      name: 'SubBytes',
      inputState: beforeSub,
      state: new Uint8Array(state)
    });

    const beforeShift = new Uint8Array(state);
    const shifted = new Uint8Array(16);
    for (let row = 0; row < 4; row++) {
      for (let column = 0; column < 4; column++) {
        shifted[row + 4 * column] = state[row + 4 * ((column + row) % 4)];
      }
    }
    state = shifted;
    steps.push({
      name: 'ShiftRows',
      inputState: beforeShift,
      state: new Uint8Array(state)
    });

    if (round < 14) {
      const beforeMix = new Uint8Array(state);
      state = mixColumns(state);
      steps.push({
        name: 'MixColumns',
        inputState: beforeMix,
        state: new Uint8Array(state)
      });
    }

    const beforeAddKey = new Uint8Array(state);
    state = xorRoundKey(state, roundKeys[round]);
    steps.push({
      name: 'AddRoundKey',
      inputState: beforeAddKey,
      roundKey: new Uint8Array(roundKeys[round]),
      state: new Uint8Array(state)
    });
    trace.push({ round, steps });
  }

  return trace;
}

/**
 * Returns the state after each AES-256 inverse cipher decryption operation (FIPS 197).
 */
export function createAes256DecryptionTrace(cipherBlock, roundKeys) {
  if (!(cipherBlock instanceof Uint8Array) || cipherBlock.length !== 16) {
    throw new Error('AES decryption requires exactly 16 input bytes.');
  }
  if (!Array.isArray(roundKeys) || roundKeys.length !== 15 || roundKeys.some((key) => key.length !== 16)) {
    throw new Error('AES-256 decryption requires 15 round keys of 16 bytes each.');
  }

  const trace = [];
  const state0 = xorRoundKey(cipherBlock, roundKeys[14]);
  trace.push({
    round: 0,
    steps: [{
      name: 'AddRoundKey (awal)',
      inputState: new Uint8Array(cipherBlock),
      roundKey: new Uint8Array(roundKeys[14]),
      state: new Uint8Array(state0)
    }],
  });

  let state = state0;
  for (let round = 1; round <= 14; round++) {
    const steps = [];

    // 1. InvShiftRows
    const beforeShift = new Uint8Array(state);
    const shifted = new Uint8Array(16);
    for (let row = 0; row < 4; row++) {
      for (let column = 0; column < 4; column++) {
        shifted[row + 4 * column] = state[row + 4 * ((column - row + 4) % 4)];
      }
    }
    state = shifted;
    steps.push({
      name: 'InvShiftRows',
      inputState: beforeShift,
      state: new Uint8Array(state)
    });

    // 2. InvSubBytes
    const beforeSub = new Uint8Array(state);
    state = state.map((byte) => AES_INV_SBOX[byte]);
    steps.push({
      name: 'InvSubBytes',
      inputState: beforeSub,
      state: new Uint8Array(state)
    });

    // 3. AddRoundKey (K_{14 - round})
    const beforeAddKey = new Uint8Array(state);
    const roundKey = roundKeys[14 - round];
    state = xorRoundKey(state, roundKey);
    steps.push({
      name: 'AddRoundKey',
      inputState: beforeAddKey,
      roundKey: new Uint8Array(roundKey),
      state: new Uint8Array(state)
    });

    // 4. InvMixColumns (putaran 1 sampai 13)
    if (round < 14) {
      const beforeMix = new Uint8Array(state);
      state = invMixColumns(state);
      steps.push({
        name: 'InvMixColumns',
        inputState: beforeMix,
        state: new Uint8Array(state)
      });
    }

    trace.push({ round, steps });
  }

  return trace;
}

export { AES_SBOX, AES_INV_SBOX, AES_RCON };

/**
 * Multiplication in GF(2^128) according to NIST SP 800-38D (Algorithm 1)
 * Standard irreducible polynomial: P(x) = x^128 + x^7 + x^2 + x + 1
 * Reduction constant R = 0xe1000000000000000000000000000000
 */
export function gf128Multiply(X, Y) {
  const Z = new Uint8Array(16);
  const V = new Uint8Array(Y);
  for (let i = 0; i < 128; i++) {
    const byteIndex = Math.floor(i / 8);
    const bitIndex = 7 - (i % 8);
    if ((X[byteIndex] >> bitIndex) & 1) {
      for (let j = 0; j < 16; j++) Z[j] ^= V[j];
    }
    const lsb = V[15] & 1;
    for (let j = 15; j > 0; j--) {
      V[j] = (V[j] >>> 1) | ((V[j - 1] & 1) << 7);
    }
    V[0] >>>= 1;
    if (lsb === 1) V[0] ^= 0xe1;
  }
  return Z;
}

export const PBKDF2_ITERATIONS = 600000;

/**
 * Computes all mathematical and cryptographic components of AES-256-GCM:
 * - Hash Subkey H = AES_K(0^128)
 * - Initial Counter Block J0 = IV || 0^31 1
 * - Masking Tag S0 = AES_K(J0)
 * - Per-block Counter Blocks CB_i = IV || (i + 1)
 * - Keystreams S_i = AES_K(CB_i)
 * - GHASH intermediate polynomial calculations over AAD and ciphertext
 * - Computed Authentication Tag = GHASH_H(C) ^ S0
 */
export function computeGcmPipelineDetails({
  keyBytes,
  ivBytes,
  plaintextBytes,
  ciphertextBytes,
  tagBytes,
  aadBytes = new Uint8Array(0),
}) {
  if (!keyBytes || keyBytes.length !== 32) {
    throw new Error('computeGcmPipelineDetails requires a 32-byte key.');
  }
  if (!ivBytes || ivBytes.length !== 12) {
    throw new Error('computeGcmPipelineDetails requires a 12-byte IV.');
  }

  const { roundKeys, wordSteps } = expandAes256KeyWithDetails(keyBytes);

  // 1. Hash Subkey H = AES_K(0^128)
  const zeroBlock = new Uint8Array(16);
  const traceH = createAes256EncryptionTrace(zeroBlock, roundKeys);
  const H = traceH[14].steps[traceH[14].steps.length - 1].state;

  // 2. Initial Counter J0 = IV || 0^31 1
  const J0 = new Uint8Array(16);
  J0.set(ivBytes);
  new DataView(J0.buffer).setUint32(12, 1, false);
  const traceJ0 = createAes256EncryptionTrace(J0, roundKeys);
  const S0 = traceJ0[14].steps[traceJ0[14].steps.length - 1].state;

  // 3. Counter Blocks & Keystream for data
  const hasCiphertext = ciphertextBytes instanceof Uint8Array;
  const hasPlaintext = plaintextBytes instanceof Uint8Array;
  const dataLen = hasCiphertext
    ? ciphertextBytes.length
    : hasPlaintext
    ? plaintextBytes.length
    : 0;
  const numBlocks = Math.ceil(dataLen / 16);
  const counterBlocks = [];
  const effectiveCiphertext = hasCiphertext ? new Uint8Array(ciphertextBytes) : new Uint8Array(dataLen);
  const effectivePlaintext = hasPlaintext ? new Uint8Array(plaintextBytes) : new Uint8Array(dataLen);

  for (let i = 0; i < numBlocks; i++) {
    const counterVal = i + 2; // CB1 = 2, CB2 = 3, ...
    const CB = new Uint8Array(16);
    CB.set(ivBytes);
    new DataView(CB.buffer).setUint32(12, counterVal, false);

    const traceCB = createAes256EncryptionTrace(CB, roundKeys);
    const keystream = traceCB[14].steps[traceCB[14].steps.length - 1].state;

    const pOffset = i * 16;
    const chunkLength = Math.min(16, dataLen - pOffset);
    const pChunk = new Uint8Array(chunkLength);
    const cChunk = new Uint8Array(chunkLength);
    for (let j = 0; j < chunkLength; j++) {
      if (hasCiphertext) {
        cChunk[j] = ciphertextBytes[pOffset + j];
        pChunk[j] = ciphertextBytes[pOffset + j] ^ keystream[j];
      } else {
        pChunk[j] = plaintextBytes[pOffset + j];
        cChunk[j] = plaintextBytes[pOffset + j] ^ keystream[j];
      }
      effectivePlaintext[pOffset + j] = pChunk[j];
      effectiveCiphertext[pOffset + j] = cChunk[j];
    }

    counterBlocks.push({
      blockIndex: i,
      counterValue: counterVal,
      counterBlock: CB,
      keystream,
      trace: traceCB,
      plainChunk: pChunk,
      cipherChunk: cChunk,
    });
  }

  // 4. Plaintext Blocks for Direct Inspection & Matrix Mapping
  const plaintextBlocks = [];
  const ptLen = effectivePlaintext.length;
  const numPtBlocks = Math.max(1, Math.ceil(ptLen / 16));
  for (let i = 0; i < numPtBlocks; i++) {
    const chunk = new Uint8Array(16);
    const start = i * 16;
    const end = Math.min(start + 16, ptLen);
    if (ptLen > 0 && end > start) {
      chunk.set(effectivePlaintext.slice(start, end));
    }
    const traceEnc = createAes256EncryptionTrace(chunk, roundKeys);
    const cipherBlock = traceEnc[14].steps[traceEnc[14].steps.length - 1].state;
    const traceDec = createAes256DecryptionTrace(cipherBlock, roundKeys);

    let textPreview = '';
    const byteMappings = [];
    for (let j = 0; j < 16; j++) {
      const b = chunk[j];
      const char = (b >= 32 && b <= 126) ? String.fromCharCode(b) : '·';
      textPreview += char;
      const row = j % 4;
      const col = Math.floor(j / 4);
      byteMappings.push({
        byteIndex: j,
        byteValue: b,
        char: (b >= 32 && b <= 126) ? String.fromCharCode(b) : (b === 0 ? '\\0' : '·'),
        row,
        col,
      });
    }

    plaintextBlocks.push({
      blockIndex: i,
      inputBlock: chunk,
      textPreview,
      byteMappings,
      cipherBlock,
      traceEnc,
      traceDec,
    });
  }

  // GHASH authenticates padded AAD, padded ciphertext, and their bit lengths.
  const ghashSteps = [];
  let currentY = new Uint8Array(16);

  ghashSteps.push({
    name: 'Inisialisasi Y₀',
    description: 'Blok Galois 128-bit nol',
    inputBlock: new Uint8Array(16),
    stateY: new Uint8Array(currentY),
  });

  const aadPaddedBlocks = aadBytes.length ? splitIntoBlocks(aadBytes, 16) : [];
  const cipherPaddedBlocks = effectiveCiphertext.length ? splitIntoBlocks(effectiveCiphertext, 16) : [];
  const authenticatedBlocks = [
    ...aadPaddedBlocks.map((block, index) => ({ block, name: `AAD${index + 1}` })),
    ...cipherPaddedBlocks.map((block, index) => ({ block, name: `C${index + 1}` })),
  ];
  for (const [bIdx, { block: rawChunk, name }] of authenticatedBlocks.entries()) {
    const block16 = new Uint8Array(16);
    block16.set(rawChunk);

    const xored = new Uint8Array(16);
    for (let j = 0; j < 16; j++) {
      xored[j] = currentY[j] ^ block16[j];
    }
    currentY = gf128Multiply(xored, H);

    ghashSteps.push({
      name: `GHASH Blok ${name}`,
      description: `(Y${bIdx} ⊕ ${name}) • H dalam GF(2¹²⁸)`,
      inputBlock: block16,
      xoredWithY: xored,
      stateY: new Uint8Array(currentY),
    });
  }

  // Length block: 64-bit len(AAD) in bits || 64-bit len(C) in bits
  const lenBlock = new Uint8Array(16);
  const aadBitLen = BigInt(aadBytes.length * 8);
  const cBitLen = BigInt(effectiveCiphertext.length * 8);
  new DataView(lenBlock.buffer).setBigUint64(0, aadBitLen, false);
  new DataView(lenBlock.buffer).setBigUint64(8, cBitLen, false);

  const lenXored = new Uint8Array(16);
  for (let j = 0; j < 16; j++) {
    lenXored[j] = currentY[j] ^ lenBlock[j];
  }
  const ghashFinal = gf128Multiply(lenXored, H);

  ghashSteps.push({
    name: 'GHASH Length Block',
    description: `(Y${authenticatedBlocks.length} ⊕ [len(AAD)||len(C)]) • H dalam GF(2¹²⁸)`,
    inputBlock: lenBlock,
    xoredWithY: lenXored,
    stateY: new Uint8Array(ghashFinal),
  });

  // 5. Final Authentication Tag = GHASH_H(C) ^ S0
  const computedTag = new Uint8Array(16);
  for (let j = 0; j < 16; j++) {
    computedTag[j] = ghashFinal[j] ^ S0[j];
  }

  let tagMatches = null;
  if (tagBytes && tagBytes.length === 16) {
    let difference = 0;
    for (let j = 0; j < 16; j++) {
      difference |= tagBytes[j] ^ computedTag[j];
    }
    tagMatches = difference === 0;
  }

  return {
    roundKeys,
    wordSteps,
    H,
    traceH,
    J0,
    S0,
    traceJ0,
    counterBlocks,
    plaintextBlocks,
    effectivePlaintext,
    effectiveCiphertext,
    aadBytes: new Uint8Array(aadBytes),
    receivedTag: tagBytes && tagBytes.length === 16 ? new Uint8Array(tagBytes) : null,
    lenBlock,
    ghashSteps,
    ghashFinal,
    computedTag,
    tagMatches,
  };
}

async function deriveKeyBytes(keyString, saltBytes = null) {
  const encoder = new TextEncoder();
  const keyBytes = encoder.encode(keyString);
  if (saltBytes) {
    const passwordKey = await crypto.subtle.importKey('raw', keyBytes, 'PBKDF2', false, ['deriveBits']);
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        hash: 'SHA-256',
        salt: saltBytes,
        iterations: PBKDF2_ITERATIONS,
      },
      passwordKey,
      256
    );
    return new Uint8Array(derivedBits);
  }
  return new Uint8Array(await crypto.subtle.digest('SHA-256', keyBytes));
}

export async function getAes256KeySchedule(keyString, saltBase64 = '') {
  const saltBytes = saltBase64 ? new Uint8Array(base64ToBuffer(saltBase64)) : null;
  if (saltBytes && saltBytes.length !== 16) {
    throw new Error('PBKDF2 salt must be exactly 16 bytes.');
  }
  const keyBytes = await deriveKeyBytes(keyString, saltBytes);
  const expansion = expandAes256KeyWithDetails(keyBytes);
  return {
    keyBytes,
    roundKeys: expansion.roundKeys,
    wordSteps: expansion.wordSteps,
    saltBytes,
    legacy: !saltBytes,
  };
}

/**
 * Derives a 256-bit AES-GCM CryptoKey from user input string using SHA-256
 */
async function deriveKey(keyString, saltBytes = null) {
  const keyBytes = await deriveKeyBytes(keyString, saltBytes);
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
   * @returns {Promise<{ciphertext: string, iv: string, salt: string, rawEncrypted: ArrayBuffer}>}
   */
  async function encryptNote(plaintext, keyString) {
    if (!plaintext || typeof plaintext !== 'string') {
      throw new Error('Content cannot be empty.');
    }
    if (!keyString || typeof keyString !== 'string') {
      throw new Error('Encryption key cannot be empty.');
    }

    const saltBytes = crypto.getRandomValues(new Uint8Array(16));
    const key = await deriveKey(keyString, saltBytes);
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
      salt: bufferToBase64(saltBytes),
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
  async function decryptNote(ciphertextBase64, ivBase64, keyString, saltBase64 = '') {
    if (!ciphertextBase64 || !ivBase64) {
      throw new Error('The encrypted data is invalid or corrupted.');
    }
    if (!keyString) {
      throw new Error('Encryption key cannot be empty.');
    }

    try {
      const saltBytes = saltBase64 ? new Uint8Array(base64ToBuffer(saltBase64)) : null;
      if (saltBytes && saltBytes.length !== 16) {
        throw new Error('Invalid PBKDF2 salt.');
      }
      const key = await deriveKey(keyString, saltBytes);
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
