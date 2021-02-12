const config = require("./config.json");
const CustomEncrypter = require("./utiles/CustomEncrypter");
const formatTimestamp = require("./utiles/formatTimestamp");
const Database = require("./database");

/**
 * Get upload token by passing in a secret string as `data`
 */
const getUploadToken = async (uid, data) => {
  let valid = false;
  if (data) {
    var uploadCodes = await retrieveUploadCodes(data);

    if (uploadCodes.status) {
      valid = uploadCodes.codes.find((x) => x === data) !== undefined;
    }
  } else {
    return {
      status: false,
      message: "Error Retrieve Pin Code !!",
    };
  }

  if (valid) {
    const payload = Buffer.from(
      JSON.stringify({
        uid,
        createdAt: Date.now() / 1000,
        upload: data,
      })
    );
    // Prepare encrypter
    const encryptionKey = Buffer.from(
      config.tempIdConfig.tempID.EncryptedKey.toString(),
      "base64"
    );
    const customEncrypter = new CustomEncrypter(encryptionKey);

    // Encode payload
    const payloadData = customEncrypter.encryptAndEncode(payload);
    // Delete Pin From DB Asynchronous
    DeletePin(uploadCodes.encCodes);
    // Return Token
    return {
      status: true,
      token: payloadData.toString("base64"),
    };
  } else {
    return {
      status: false,
      message: "getUploadToken : Invalid Code",
    };
  }
};

async function storeUploadCodes(uploadCodes) {
  // Prepare encrypter
  const encryptionKey = Buffer.from(
    config.tempIdConfig.tempID.EncryptedKey.toString(),
    "base64"
  );
  const customEncrypter = new CustomEncrypter(encryptionKey);
  const payload = Buffer.from(JSON.stringify(uploadCodes));
  // Encode payload
  const payloadData = customEncrypter.encryptAndEncode(payload);
  var database = new Database(config.dbcredentials.databasename);
  var status = await database.connection();
  await database
    .insertAsync(config.dbcredentials.uploadCodeCol, {
      uploadCode: payloadData.toString("base64"),
    })
    .then((res) => {
      ///
    })
    .catch((err) => {
      console.log(err);
    });
}
async function retrieveUploadCodes(data) {
  // Prepare encrypter
  const encryptionKey = Buffer.from(
    config.tempIdConfig.tempID.EncryptedKey.toString(),
    "base64"
  );
  const customEncrypter = new CustomEncrypter(encryptionKey);
  var database = new Database(config.dbcredentials.databasename);
  var status = await database.connection();
  var uploadCodes = [];
  var encPin = null;
  await database
    .selectAsync(config.dbcredentials.uploadCodeCol, {})
    .then((docs) => {
      docs.forEach((doc) => {
        let payloadData = Buffer.from(doc.uploadCode, "base64");
        let decryptedData = customEncrypter.decodeAndDecrypt(payloadData, [
          payloadData.length - 32,
          16,
          16,
        ]);
        let decyPin = JSON.parse(
          Buffer.from(decryptedData, "base64").toString()
        );
        uploadCodes.push(decyPin);
        if (decyPin === data) {
          encPin = doc.uploadCode;
        }
      });
    })
    .catch((err) => {
      console.log("Errorr Retrieve Pin Code !!");
    });
  return {
    status: true,
    codes: uploadCodes,
    encCodes: encPin,
  };
}

function validateToken(token, validateTokenTimestamp = true) {
  const payloadData = Buffer.from(token, "base64");
  const encryptionKey = Buffer.from(
    config.tempIdConfig.tempID.EncryptedKey.toString(),
    "base64"
  );

  // Prepare encrypter
  const customEncrypter = new CustomEncrypter(encryptionKey);
  // Decrypt UUID
  const decryptedData = customEncrypter.decodeAndDecrypt(payloadData, [
    payloadData.length - 32,
    16,
    16,
  ]);
  const { uid, createdAt, upload } = JSON.parse(
    Buffer.from(decryptedData, "base64").toString()
  );

  if (
    validateTokenTimestamp &&
    Date.now() / 1000 - createdAt > config.upload.tokenValidityPeriod * 3600
  ) {
    return {
      status: false,
      message: "Upload token has expired , Try to generate new token",
    };
  }

  if (upload.length !== 6) {
    return {
      status: false,
      message: "validateToken: Upload code is invalid.",
    };
  }

  // Note: Cannot validate uid as file metadata does not contain uid

  return { status: true, uid: uid, uploadCode: upload };
}

async function DeletePin(data) {
  var database = new Database(config.dbcredentials.databasename);
  var status = await database.connection();
  database.delete(
    config.dbcredentials.uploadCodeCol,
    { uploadCode: data },
    (result) => {
      // if (result.n > 0) console.log();
      //delete Pin SuccessFully.
      // else console.log("Ops ! Error Delete Pin From Database .");
    }
  );
}
module.exports.functions = {
  getUploadToken,
  storeUploadCodes,
  validateToken,
};
