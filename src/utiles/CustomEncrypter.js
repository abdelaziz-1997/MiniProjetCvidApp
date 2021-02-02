const crypto = require("crypto");
const config = require("../config.json");

class CustomEncrypter {
  constructor(
    key,
    algorithm = config.tempIdConfig.encryption.defaultAlgorithm
  ) {
    this.algorithm = algorithm;
    this.key = key;
  }

  decode(encodedData, lengths) {
    const [cipherData, ivData, authTagData] = lengths.map((e, i) =>
      Buffer.alloc(lengths[i])
    );
    encodedData.copy(cipherData, 0, 0, lengths[0]);
    encodedData.copy(ivData, 0, lengths[0], lengths[0] + lengths[1]);
    encodedData.copy(
      authTagData,
      0,
      lengths[0] + lengths[1],
      lengths[0] + lengths[1] + lengths[2]
    );
    return [
      cipherData.toString("base64"),
      ivData.toString("base64"),
      authTagData.toString("base64"),
    ];
  }

  decrypt(cipherText, iv, authTag) {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(iv, "base64")
    );
    decipher.setAuthTag(Buffer.from(authTag, "base64"));
    let plainText = decipher.update(cipherText, "base64", "base64");
    plainText += decipher.final("base64");
    return plainText;
  }

  encode(cipherText, iv, authTag) {
    const [cipherData, ivData, authTagData] = [
      cipherText,
      iv,
      authTag,
    ].map((e) => Buffer.from(e, "base64"));
    const buffer = Buffer.alloc(
      cipherData.length + ivData.length + authTagData.length
    );
    cipherData.copy(buffer, 0);
    ivData.copy(buffer, cipherData.length);
    authTagData.copy(buffer, cipherData.length + ivData.length);
    return buffer;
  }

  encrypt(data, ivLength = 16, authTagLength = 16) {
    const dataB64 = data.toString("base64");
    const iv = crypto.randomBytes(ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv, {
      authTagLength,
    });
    let cipherText = cipher.update(dataB64, "base64", "base64");
    cipherText += cipher.final("base64");
    return [
      cipherText,
      iv.toString("base64"),
      cipher.getAuthTag().toString("base64"),
    ];
  }

  encryptAndEncode(data, ivLength = 16, authTagLength = 16) {
    const [cipherTextB64, ivB64, authTagB64] = this.encrypt(
      data,
      ivLength,
      authTagLength
    );
    return this.encode(cipherTextB64, ivB64, authTagB64);
  }

  decodeAndDecrypt(encodedData, lengths) {
    const [decodedCipherTextB64, decodedIvB64, decodedAuthTagB64] = this.decode(
      encodedData,
      lengths
    );
    return this.decrypt(decodedCipherTextB64, decodedIvB64, decodedAuthTagB64);
  }
}

module.exports = CustomEncrypter;
