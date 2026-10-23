import test from 'node:test';
import assert from 'node:assert/strict';
import { createAes256EncryptionTrace, expandAes256Key } from './useCrypto.js';

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
