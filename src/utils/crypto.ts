/**
 * Cryptographic utility functions for the Institutional Fortification Platform
 */

// Compute real SHA-256 using Browser Web Crypto API
export async function computeSha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `0x${hashHex}`;
}

// Generate deterministic pseudo-cryptographic hash for mock records
export function generateHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  const hex1 = Math.abs(hash).toString(16).padStart(8, '0');
  const hex2 = Math.abs(hash * 31 + 7).toString(16).padStart(8, '0');
  const hex3 = Math.abs(hash * 127 + 13).toString(16).padStart(8, '0');
  const hex4 = Math.abs(hash * 521 + 19).toString(16).padStart(8, '0');
  return `0x${hex1}${hex2}${hex3}${hex4}`.padEnd(66, 'f');
}

// Truncate hash for clean UI display
export function truncateHash(hash: string, startLength = 6, endLength = 4): string {
  if (!hash) return '';
  if (hash.length <= startLength + endLength) return hash;
  return `${hash.slice(0, startLength)}...${hash.slice(-endLength)}`;
}

// Format date nicely
export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  } catch {
    return isoString;
  }
}

export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date);
  } catch {
    return isoString;
  }
}
