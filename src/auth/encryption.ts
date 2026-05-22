import forge from "node-forge";

function normalizePublicKey(publicKey: string) {
  return publicKey.replace(/\\n/g, "\n").trim();
}

export function encryptLoginPayload(
  email: string,
  password: string,
  serverPublicKeyPem: string
) {
  const aesKey = forge.random.getBytesSync(32); // 256-bit AES
  const iv = forge.random.getBytesSync(16);

  const payload = JSON.stringify({ email, password });

  // AES-CBC encryption
  const cipher = forge.cipher.createCipher("AES-CBC", aesKey);
  cipher.start({ iv });
  cipher.update(forge.util.createBuffer(payload, "utf8"));
  cipher.finish();

  const encryptedData = cipher.output.getBytes();

  const publicKey = forge.pki.publicKeyFromPem(
    normalizePublicKey(serverPublicKeyPem)
  );

  // RSA PKCS1 v1.5 encryption
  const encryptedKey = publicKey.encrypt(aesKey, "RSAES-PKCS1-V1_5");

  return {
    encryptedData: forge.util.encode64(encryptedData),
    encryptedKey: forge.util.encode64(encryptedKey),
    iv: forge.util.encode64(iv),
  };
}
