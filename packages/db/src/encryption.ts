import sodium from "libsodium-wrappers-sumo";

let sodiumInstance: typeof sodium | null = null;

async function getSodium() {
  if (!sodiumInstance) {
    await sodium.ready;
    sodiumInstance = sodium;
  }
  return sodiumInstance;
}

async function getKey(): Promise<Uint8Array> {
  const keyB64 = process.env.ENCRYPTION_KEY;
  const lib = await getSodium();

  if (!keyB64) {
    throw new Error("ENCRYPTION_KEY must be set to a base64-encoded 32 byte value");
  }

  const key = Buffer.from(keyB64, "base64");
  if (key.length !== lib.crypto_secretbox_KEYBYTES) {
    throw new Error(`ENCRYPTION_KEY must decode to ${lib.crypto_secretbox_KEYBYTES} bytes`);
  }

  return new Uint8Array(key);
}

export interface EncryptedPayload {
  ciphertext: string;
  nonce: string;
}

export async function encryptSecret(plaintext: string): Promise<EncryptedPayload> {
  const lib = await getSodium();
  const key = await getKey();
  const nonce = lib.randombytes_buf(lib.crypto_secretbox_NONCEBYTES);
  const cipher = lib.crypto_secretbox_easy(plaintext, nonce, key);
  return {
    ciphertext: Buffer.from(cipher).toString("base64"),
    nonce: Buffer.from(nonce).toString("base64")
  };
}

export async function decryptSecret(payload: EncryptedPayload): Promise<string> {
  const lib = await getSodium();
  const key = await getKey();
  const nonce = Buffer.from(payload.nonce, "base64");
  const ciphertext = Buffer.from(payload.ciphertext, "base64");
  const decrypted = lib.crypto_secretbox_open_easy(new Uint8Array(ciphertext), new Uint8Array(nonce), key);
  return Buffer.from(decrypted).toString("utf-8");
}
