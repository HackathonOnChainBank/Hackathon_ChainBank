// JavaScript version of short-uuid 
import { generateUuidV4 } from './uuid-generator.js';

const defaultCharacters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-";

//這個 uuidToShortId() 的目的是：
// 把 UUID（例如 "550e8400-e29b-41d4-a716-446655440000"）轉成比較短、可讀的 ID。
// 做法是：把 UUID（16 bytes = 128 bits）轉成一個大整數 BigInt。
// 再用自定義的「字元集（character set）」作為進位系統的基底，把那個數字轉成短字串。
/**
 * Convert a UUID to a short ID string
 * @param {string} uuid - UUID string (e.g., "550e8400-e29b-41d4-a716-446655440000")
 * @param {string} characters - Character set to use for encoding
 * @returns {string} Short ID
 */
function uuidToShortId(uuid, characters = defaultCharacters) {
  const exponent = assertCharactersSize(characters);
  const lookupTable = characters.split('');
  const base = BigInt(Math.pow(2, exponent));
  const expectedLength = Math.ceil((64 * 2) / exponent);
  
  // Convert UUID to BigInt
  const cleanUuid = uuid.replace(/-/g, '');
  let number = BigInt('0x' + cleanUuid);
  
  const buffer = [];
  do {
    const mod = number % base;
    number = number / base;
    buffer.push(lookupTable[Number(mod)]);
  } while (number > 0n);
  
  // Pad to expected length
  while (buffer.length < expectedLength) {
    buffer.push(lookupTable[0]);
  }
  
  return buffer.reverse().join('');
}

/**
 * Convert a short ID back to UUID
 * @param {string} shortId - Short ID string
 * @param {string} characters - Character set used for encoding
 * @returns {string} UUID string
 */
function shortIdToUuid(shortId, characters = defaultCharacters) {
  const exponent = assertCharactersSize(characters);
  const expectedLength = Math.ceil((64 * 2) / exponent);
  
  if (shortId.length !== expectedLength) {
    throw new Error("the string could not be represented with the characters");
  }
  
  const base = BigInt(Math.pow(2, exponent));
  let number = 0n;
  
  for (let i = 0; i < shortId.length; i++) {
    const char = shortId[i];
    const index = BigInt(characters.indexOf(char));
    if (index === -1n) {
      throw new Error(`Invalid character '${char}' in short ID`);
    }
    number = number * base + index;
  }
  
  // Convert BigInt to UUID format
  const hex = number.toString(16).padStart(32, '0');
  return formatUuid(hex);
}

/**
 * Format hex string as UUID (with dashes)
 * @param {string} hex - 32-character hex string
 * @returns {string} Formatted UUID
 */
function formatUuid(hex) {
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32)
  ].join('-');
}

/**
 * Validate and get exponent for character set
 * @param {string} characters - Character set
 * @returns {number} Exponent (log2 of character set size)
 */
function assertCharactersSize(characters) {
  const exponent = Math.log2(characters.length);
  
  if (!Number.isInteger(exponent)) {
    throw new Error("must have 2 ^ n characters");
  }
  
  if (exponent <= 4) {
    throw new Error("less than 16 characters");
  }
  
  return exponent;
}

/**
 * Generate a new short UUID
 * @param {string} characters - Character set to use
 * @returns {string} Short UUID
 */
function generate(characters = defaultCharacters) {
  // Generate a random UUID v4
  const uuid = generateUuidV4();
  return uuidToShortId(uuid, characters);
}

// Export as ES module
export default {
  uuidToShortId,
  shortIdToUuid,
  generate,
  defaultCharacters
};

// Also export individual functions
export {
  uuidToShortId,
  shortIdToUuid,
  generate,
  defaultCharacters
};
