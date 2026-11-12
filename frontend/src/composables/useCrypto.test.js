import test from 'node:test';
import assert from 'node:assert/strict';
import {
  base64ToBuffer,
  bufferToBase64,
  createAes256EncryptionTrace,
  createAes256DecryptionTrace,
  expandAes256Key,
  computeGcmPipelineDetails,
  gf128Multiply,
  useCrypto,
} from './useCrypto.js';

test('expands a 256-bit AES key into the expected round keys', () => {
  const key = Uint8Array.from({ length: 32 }, (_, index) => index);
  const roundKeys = expandAes256Key(key).map((roundKey) =>
    Array.from(roundKey, (byte) => byte.toString(16).padStart(2, '0')).join('')
  );

  assert.equal(roundKeys.length, 15);
  assert.equal(roundKeys[0], '000102030405060708090a0b0c0d0e0f');
  assert.equal(roundKeys[1], '101112131415161718191a1b1c1d1e1f');
  assert.equal(roundKeys[2], 'a573c29fa176c498a97fce93a572c09c');
  assert.equal(roundKeys[14], '24fc79ccbf0979e9371ac23c6d68de36');
});

test('rejects keys that are not exactly 256 bits', () => {
  assert.throws(() => expandAes256Key(new Uint8Array(31)), /requires exactly 32 bytes/);
});

test('shows the AES-256 round operations and produces the FIPS 197 ciphertext', () => {
  const key = Uint8Array.from({ length: 32 }, (_, index) => index);
  const plaintext = Uint8Array.from(
    '00112233445566778899aabbccddeeff'.match(/.{2}/g),
    (byte) => Number.parseInt(byte, 16)
  );
  const trace = createAes256EncryptionTrace(plaintext, expandAes256Key(key));
  const ciphertext = Array.from(trace.at(-1).steps.at(-1).state, (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');

  assert.equal(trace.length, 15);
  assert.deepEqual(trace[0].steps.map((step) => step.name), ['AddRoundKey (awal)']);
  assert.deepEqual(trace[1].steps.map((step) => step.name), [
    'SubBytes',
    'ShiftRows',
    'MixColumns',
    'AddRoundKey',
  ]);
  assert.deepEqual(trace[14].steps.map((step) => step.name), [
    'SubBytes',
    'ShiftRows',
    'AddRoundKey',
  ]);
  assert.equal(ciphertext, '8ea2b7ca516745bfeafc49904b496089');
});

test('decrypts AES-256 ciphertext with inverse cipher operations back to plaintext', () => {
  const key = Uint8Array.from({ length: 32 }, (_, index) => index);
  const roundKeys = expandAes256Key(key);
  const ciphertext = Uint8Array.from(
    '8ea2b7ca516745bfeafc49904b496089'.match(/.{2}/g),
    (byte) => Number.parseInt(byte, 16)
  );
  const decTrace = createAes256DecryptionTrace(ciphertext, roundKeys);
  const recoveredPlaintext = Array.from(decTrace.at(-1).steps.at(-1).state, (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');

  assert.equal(decTrace.length, 15);
  assert.deepEqual(decTrace[0].steps.map((step) => step.name), ['AddRoundKey (awal)']);
  assert.deepEqual(decTrace[1].steps.map((step) => step.name), [
    'InvShiftRows',
    'InvSubBytes',
    'AddRoundKey',
    'InvMixColumns',
  ]);
  assert.deepEqual(decTrace[14].steps.map((step) => step.name), [
    'InvShiftRows',
    'InvSubBytes',
    'AddRoundKey',
  ]);
  assert.equal(recoveredPlaintext, '00112233445566778899aabbccddeeff');
});

test('computes AES-256-GCM pipeline details matching NIST GCM test vectors', () => {
  const key = new Uint8Array(32).fill(0x42);
  const iv = new Uint8Array(12).fill(0x11);
  const plaintext = new TextEncoder().encode('Hello World, this is my secret note');

  const details = computeGcmPipelineDetails({
    keyBytes: key,
    ivBytes: iv,
    plaintextBytes: plaintext,
  });

  assert.equal(details.roundKeys.length, 15);
  assert.equal(details.H.length, 16);
  assert.equal(details.J0.length, 16);
  assert.equal(details.S0.length, 16);
  assert.equal(details.counterBlocks.length, 3);
  assert.equal(details.computedTag.length, 16);
  assert.ok(details.ghashSteps.length > 0);
});

test('matches the NIST AES-256-GCM vector for one data block', () => {
  const key = new Uint8Array(32);
  const iv = new Uint8Array(12);
  const plaintext = new Uint8Array(16);
  const ciphertext = Uint8Array.from(
    'cea7403d4d606b6e074ec5d3baf39d18'.match(/.{2}/g),
    (byte) => Number.parseInt(byte, 16)
  );
  const tag = Uint8Array.from(
    'd0d1c8a799996bf0265b98b5d48ab919'.match(/.{2}/g),
    (byte) => Number.parseInt(byte, 16)
  );

  const details = computeGcmPipelineDetails({
    keyBytes: key,
    ivBytes: iv,
    plaintextBytes: plaintext,
    ciphertextBytes: ciphertext,
    tagBytes: tag,
  });

  assert.equal(details.tagMatches, true);
  assert.deepEqual(details.effectiveCiphertext, ciphertext);
  assert.deepEqual(details.effectivePlaintext, plaintext);
});

test('authenticates AAD and encodes both lengths in GHASH', () => {
  const details = computeGcmPipelineDetails({
    keyBytes: new Uint8Array(32),
    ivBytes: new Uint8Array(12),
    plaintextBytes: new Uint8Array(0),
    aadBytes: Uint8Array.of(0x61),
  });

  assert.equal(details.ghashSteps[1].name, 'GHASH Blok AAD1');
  assert.equal(details.lenBlock[7], 8);
  assert.equal(details.lenBlock[15], 0);
});

test('uses per-note PBKDF2 salt for new notes and retains legacy SHA-256 decryption', async () => {
  const { encryptNote, decryptNote } = useCrypto();
  const keyString = 'test-password';
  const encrypted = await encryptNote('secret note', keyString);

  assert.equal(new Uint8Array(base64ToBuffer(encrypted.salt)).length, 16);
  assert.equal(await decryptNote(encrypted.ciphertext, encrypted.iv, keyString, encrypted.salt), 'secret note');

  const tampered = new Uint8Array(base64ToBuffer(encrypted.ciphertext));
  tampered[0] ^= 1;
  await assert.rejects(
    decryptNote(bufferToBase64(tampered), encrypted.iv, keyString, encrypted.salt),
    /Unable to decrypt note/
  );

  const legacyDigest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(keyString));
  const legacyKey = await crypto.subtle.importKey('raw', legacyDigest, { name: 'AES-GCM' }, false, ['encrypt']);
  const legacyIv = crypto.getRandomValues(new Uint8Array(12));
  const legacyCiphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: legacyIv },
    legacyKey,
    new TextEncoder().encode('old note')
  );
  assert.equal(
    await decryptNote(bufferToBase64(legacyCiphertext), bufferToBase64(legacyIv), keyString),
    'old note'
  );
});
