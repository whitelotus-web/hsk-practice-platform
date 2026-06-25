import crypto from "node:crypto";

const KEY_LENGTH = 64;
const SCRYPT_OPTIONS = { N: 16384, r: 8, p: 1 };

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("base64url");
  const key = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LENGTH, SCRYPT_OPTIONS, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });

  return `scrypt:${salt}:${key.toString("base64url")}`;
}

export async function verifyPassword(password: string, passwordHash: string | null) {
  if (!passwordHash) return false;

  const [algorithm, salt, storedKey] = passwordHash.split(":");
  if (algorithm !== "scrypt" || !salt || !storedKey) return false;

  const expected = Buffer.from(storedKey, "base64url");
  const actual = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, expected.length, SCRYPT_OPTIONS, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });

  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}
