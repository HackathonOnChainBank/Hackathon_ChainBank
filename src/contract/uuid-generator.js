// UUID Generator - Various UUID generation functions

/**
 * Generate a random UUID v4
 * @returns {string} UUID string
 */
export function generateUuidV4() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generate a UUID from a namespace and name (UUID v5 using SHA-1)
 * @param {string} namespace - Namespace UUID
 * @param {string} name - Name to hash
 * @returns {Promise<string>} UUID string
 */
export async function generateUuidV5(namespace, name) {
  // Remove dashes from namespace UUID
  const namespaceBytes = hexToBytes(namespace.replace(/-/g, ''));
  const nameBytes = new TextEncoder().encode(name);
  
  // Concatenate namespace and name
  const combined = new Uint8Array(namespaceBytes.length + nameBytes.length);
  combined.set(namespaceBytes);
  combined.set(nameBytes, namespaceBytes.length);
  
  // Hash using SHA-1
  const hashBuffer = await crypto.subtle.digest('SHA-1', combined);
  const hashArray = new Uint8Array(hashBuffer);
  
  // Set version (5) and variant bits
  hashArray[6] = (hashArray[6] & 0x0f) | 0x50; // Version 5
  hashArray[8] = (hashArray[8] & 0x3f) | 0x80; // Variant
  
  // Format as UUID
  return formatUuidFromBytes(hashArray.slice(0, 16));
}

/**
 * Generate a UUID from timestamp (UUID v1 style, but simplified)
 * @returns {string} UUID string
 */
export function generateUuidV1() {
  const timestamp = Date.now();
  const randomNode = Math.floor(Math.random() * 0xffffffffffff);
  const clockSeq = Math.floor(Math.random() * 0x3fff);
  
  // Convert timestamp to 100-nanosecond intervals since 1582-10-15
  const gregorianOffset = 122192928000000000n;
  const time100ns = BigInt(timestamp) * 10000n + gregorianOffset;
  
  const timeLow = Number(time100ns & 0xffffffffn);
  const timeMid = Number((time100ns >> 32n) & 0xffffn);
  const timeHigh = Number((time100ns >> 48n) & 0x0fffn) | 0x1000; // Version 1
  
  const clockSeqLow = clockSeq & 0xff;
  const clockSeqHigh = ((clockSeq >> 8) & 0x3f) | 0x80; // Variant
  
  return [
    timeLow.toString(16).padStart(8, '0'),
    timeMid.toString(16).padStart(4, '0'),
    timeHigh.toString(16).padStart(4, '0'),
    (clockSeqHigh * 256 + clockSeqLow).toString(16).padStart(4, '0'),
    randomNode.toString(16).padStart(12, '0')
  ].join('-');
}

/**
 * Generate a nil UUID (all zeros)
 * @returns {string} Nil UUID
 */
export function generateNilUuid() {
  return '00000000-0000-0000-0000-000000000000';
}

/**
 * Generate a max UUID (all ones)
 * @returns {string} Max UUID
 */
export function generateMaxUuid() {
  return 'ffffffff-ffff-ffff-ffff-ffffffffffff';
}

/**
 * Validate if a string is a valid UUID
 * @param {string} uuid - String to validate
 * @returns {boolean} True if valid UUID
 */
export function isValidUuid(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Get UUID version from a UUID string
 * @param {string} uuid - UUID string
 * @returns {number} Version number (1-5) or 0 if invalid
 */
export function getUuidVersion(uuid) {
  if (!isValidUuid(uuid)) return 0;
  return parseInt(uuid.charAt(14), 16);
}

/**
 * Format hex string as UUID (with dashes)
 * @param {string} hex - 32-character hex string
 * @returns {string} Formatted UUID
 */
export function formatUuid(hex) {
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32)
  ].join('-');
}

/**
 * Helper: Convert hex string to bytes
 */
function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Helper: Format bytes as UUID
 */
function formatUuidFromBytes(bytes) {
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return formatUuid(hex);
}

// Predefined namespace UUIDs for v5
export const NAMESPACE_DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
export const NAMESPACE_URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
export const NAMESPACE_OID = '6ba7b812-9dad-11d1-80b4-00c04fd430c8';
export const NAMESPACE_X500 = '6ba7b814-9dad-11d1-80b4-00c04fd430c8';

// Default export
export default {
  generateUuidV4,
  generateUuidV1,
  generateUuidV5,
  generateNilUuid,
  generateMaxUuid,
  isValidUuid,
  getUuidVersion,
  formatUuid,
  NAMESPACE_DNS,
  NAMESPACE_URL,
  NAMESPACE_OID,
  NAMESPACE_X500
};
