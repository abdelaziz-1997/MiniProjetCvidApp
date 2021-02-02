const router = require("express").Router();
const Handler = require("./Handler");
var Database = require("./database");
const config = require("./config.json");
const Nexmo = require("nexmo");
const multerHandler = require("multer");
const generateId = require("./getTempId");
const getHandshakePin = require("./getHandshakePin");
const uplodToken = require("./getUploadToken");
const uuid = require("uuid");
/**************  Configuration      ***************/
const storageParams = multerHandler.memoryStorage();
const uploadMiddleWare = multerHandler({ storage: storageParams });
const nexmo = new Nexmo({
  apiKey: config.nexmoService.apiKey,
  apiSecret: config.nexmoService.apiSecret,
});
/**************** Send SMS To User  ********/
router.post("/verify/sendsms", (req, res) => {
  new Handler().authUser(
    nexmo,
    config.nexmoService.optiones,
    req.body,
    (result) => {
      res.json(result);
    }
  );
});

/******** Check SMS Code  And Insert User Into Mongodb **************/

router.post("/verify/check", (req, res) => {
  var database = new Database(config.dbcredentials.databasename);
  (async () => {
    status = await database.connection();
    new Handler(database, config.dbcredentials.usertablename).checkAuthUser(
      nexmo,
      req.body,
      generateId,
      (result) => {
        res.json(result);
      }
    );
  })();
});

/******************* Get Generate Ids List Each 24h+  ************/

router.post("/getGenerateIds", (req, res) => {
  var database = new Database(config.dbcredentials.databasename);
  (async () => {
    status = await database.connection();
    new Handler(database, config.dbcredentials.usertablename).generateTempIds(
      req.body,
      generateId,
      (result) => {
        res.send(result);
      }
    );
  })();
});
/******************* Get Handshake Pin   ************/

router.get("/getHandshakePin", (req, res) => {
  try {
    (async () => {
      var result = await getHandshakePin(uuid.v4());
      await uplodToken.functions.storeUploadCodes(result.pin.trim());
      res.send(result);
    })();
  } catch (err) {
    res.send({
      status: false,
      message: "Error get Handshake try again !!",
    });
  }
});

/*********************** Get Token ********************************* */
router.post("/getUploadToken", (req, res) => {
  (async () => {
    try {
      var decryptId = new Handler().DecryptId(req.body, generateId);
      var result = await uplodToken.functions.getUploadToken(
        decryptId.user.uid,
        req.body.pin.trim()
      );
      res.send(result);
    } catch (error) {
      res.send({
        status: false,
        message: "Ops !! , Try Again May Be Missing Param . ",
      });
      console.log(error);
    }
  })();
});
/*************************** Upload Logs File To Server ***********/
router.post("/upload", uploadMiddleWare.single("File"), (req, res) => {
  (async () => {
    var database = new Database(config.dbcredentials.databasename);
    status = await database.connection();
    new Handler(database, config.dbcredentials.contactsTablename).uploadFile(
      req.file,
      req.body,
      (result) => {
        res.json(result);
      }
    );
  })();
});

module.exports = router;
