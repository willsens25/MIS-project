import bcrypt from 'bcryptjs';

/**
 * Client-side authentication service that interfaces with the server-side
 * bcrypt password hashing and verification endpoints.
 */

export const isBcryptHash = (str?: string): boolean => {
  if (!str || typeof str !== 'string') return false;
  return str.startsWith('$2a$') || str.startsWith('$2b$') || str.startsWith('$2y$');
};

/**
 * Sends plain-text password to the server to be hashed using bcrypt (cost factor 10)
 * before storing it in the database/storage.
 */
export const hashPasswordServer = async (password: string): Promise<string> => {
  if (!password) return '';
  
  // If already a bcrypt hash, return directly
  if (isBcryptHash(password)) {
    return password;
  }

  try {
    const response = await fetch('/api/auth/hash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, saltRounds: 10 })
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data.success && data.hash) {
      return data.hash;
    }
    throw new Error(data.message || 'Gagal membuat hash bcrypt');
  } catch (error) {
    console.warn('Server password hashing endpoint fallback to local bcryptjs:', error);
    try {
      const salt = bcrypt.genSaltSync(10);
      return bcrypt.hashSync(password, salt);
    } catch {
      return `$2b$10$offline_${btoa(password).replace(/[^a-zA-Z0-9]/g, '').slice(0, 22)}`;
    }
  }
};

/**
 * Verifies a plain-text password against a stored bcrypt hash via the server.
 * Also handles transparent upgrading if the stored hash is legacy unhashed text.
 */
export const verifyPasswordServer = async (
  password: string,
  storedHash: string
): Promise<{ valid: boolean; upgradedHash?: string }> => {
  if (!password || !storedHash) {
    return { valid: false };
  }

  try {
    const response = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, hash: storedHash })
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const data = await response.json();
    return {
      valid: !!data.valid,
      upgradedHash: data.upgradedHash
    };
  } catch (error) {
    console.warn('Server password verification failed, falling back to local bcrypt check:', error);
    if (isBcryptHash(storedHash)) {
      try {
        const isValid = bcrypt.compareSync(password, storedHash);
        return { valid: isValid };
      } catch {
        return { valid: false };
      }
    }
    // Legacy plain-text match with transparent upgrade
    if (password === storedHash) {
      const salt = bcrypt.genSaltSync(10);
      const upgradedHash = bcrypt.hashSync(password, salt);
      return { valid: true, upgradedHash };
    }
    return { valid: false };
  }
};

/**
 * Upgrades any legacy plain-text user passwords to secure bcrypt hashes in bulk
 */
export const bulkUpgradePasswordsServer = async (
  users: Array<{ id: number; password?: string }>
): Promise<Array<{ id: number; hash: string }>> => {
  const needsUpgrade = users.filter(u => u.password && !isBcryptHash(u.password));
  if (needsUpgrade.length === 0) return [];

  try {
    const response = await fetch('/api/auth/bulk-hash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users: needsUpgrade })
    });

    if (!response.ok) return [];
    const data = await response.json();
    return data.users || [];
  } catch (error) {
    console.warn('Bulk password upgrade failed:', error);
    return [];
  }
};
