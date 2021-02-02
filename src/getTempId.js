const moment = require("moment");
const config = require("./config.json");
const CustomEncrypter = require("./utiles/CustomEncrypter");

const UID_SIZE = 18;
const TIME_SIZE = 4;
// 18 bytes for UID, 4 bytes each for creation and expiry timestamp
const TEMPID_SIZE = UID_SIZE + TIME_SIZE * 2;
const IV_SIZE = 16;
const AUTHTAG_SIZE = 16;

const getTempIDs = async (uid) => {
  const encryptionKey = Buffer.from(
    config.tempIdConfig.tempID.EncryptedKey.toString(),
    "base64"
  );
  const tempIDs = await Promise.all(
    [...Array(config.tempIdConfig.tempID.batchSize).keys()].map(async (i) =>
      generateTempId(encryptionKey, uid, i)
    )
  );

  return {
    status: true,
    message: tempIDs,
    refreshTime:
      moment().unix() + 3600 * config.tempIdConfig.tempID.refreshInterval,
  };
};

async function generateTempId(encryptionKey, uid, i) {
  // allow the first message to be valid a minute earlier ,  Number Used By Seconds
  const start =
    moment().unix() + 3600 * config.tempIdConfig.tempID.validityPeriod * i - 60;
  const expiry = start + 3600 * config.tempIdConfig.tempID.validityPeriod;

  // Prepare encrypter
  const customEncrypter = new CustomEncrypter(encryptionKey);

  // Encrypt UID, start, expiry and encode payload
  // 18 bytes for UID, 4 bytes each for start and expiry timestamp
  const plainData = Buffer.alloc(TEMPID_SIZE);
  plainData.write(uid, 0, UID_SIZE, "base64");
  plainData.writeInt32BE(start, UID_SIZE);
  plainData.writeInt32BE(expiry, UID_SIZE + TIME_SIZE);

  const encodedData = customEncrypter.encryptAndEncode(plainData);
  const tempID = encodedData.toString("base64");

  return {
    tempID: tempID,
    startTime: start,
    expiryTime: expiry,
  };
}

function decryptTempID(
  tempID,
  encryptionKey = Buffer.from(
    config.tempIdConfig.tempID.EncryptedKey.toString(),
    "base64"
  )
) {
  const payloadData = Buffer.from(tempID, "base64");

  // Prepare encrypter
  const customEncrypter = new CustomEncrypter(encryptionKey);

  // Decrypt UUID
  const decryptedB64 = customEncrypter.decodeAndDecrypt(payloadData, [
    TEMPID_SIZE,
    IV_SIZE,
    AUTHTAG_SIZE,
  ]);
  const decryptedData = Buffer.from(decryptedB64, "base64");

  const uid = decryptedData.toString("base64", 0, UID_SIZE);
  const startTime = decryptedData.readInt32BE(UID_SIZE);
  const expiryTime = decryptedData.readInt32BE(UID_SIZE + TIME_SIZE);

  return {
    uid: uid,
    startTime: startTime,
    expiryTime: expiryTime,
  };
}

module.exports = {
  getTempId: getTempIDs,
  decryptTempId: decryptTempID,
};
