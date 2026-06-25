import crypto from "node:crypto";

const bytes = Number(process.argv[2]) || 48;

if (!Number.isInteger(bytes) || bytes < 32) {
  throw new Error("Secret length must be at least 32 bytes.");
}

console.log(crypto.randomBytes(bytes).toString("base64url"));
