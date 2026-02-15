// Securely hash a student ID implementation for privacy-preserving on-chain storage
// Maps a string ID -> SHA-256 -> truncated to 248 bits -> BigInt (safe for Midnight Field)

export async function hashStudentId(studentId: string): Promise<bigint> {
  const encoder = new TextEncoder();
  const data = encoder.encode(studentId);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  
  // Convert to hex, then to BigInt
  // We truncate to 31 bytes (248 bits) to safely fit in a Midnight Field (254 bits) without modulo bias
  const hashArray = Array.from(new Uint8Array(hashBuffer)).slice(0, 31); 
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return BigInt('0x' + hashHex);
}
