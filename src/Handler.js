const ObjectId = require("mongodb").ObjectId;
const uploadToken = require("./getUploadToken");
module.exports = class Handler {
  /******************* *****************/
  constructor(dtbsinstance = null, usertablename = null) {
    this.dbinstance = dtbsinstance;
    this.tablename = usertablename;
  }
  /************* Sens Sms to user  *******************/
  authUser(nexmo, options, data, callback) {
    if (!data.phoneNumber) {
      callback({
        status: false,
        message: "Please Insert Phone Number !",
      });
      return;
    }

    let params = {
      number: Number.parseInt(data.phoneNumber),
      brand: options.brandName,
      code_length: options.codeLength,
      sender_id: options.senderId,
      country: options.country,
      lg: options.language,
      workflow_id: options.workflowId,
      next_event_wait: options.nextEventWait,
    };
    nexmo.verify.request(params, function (err, response) {
      if (err) {
        callback({
          status: false,
          message: "Error Send SMS To Specific Phone Number Try Again !",
        });
      } else {
        /*  We Have To Handle unsufficient Credit Card */
        if (response.status == 0) {
          callback({
            status: true,
            message: response.request_id,
          });
        } else {
          callback({
            status: false,
            message: "Please Charge Your Account",
          });
        }
      }
    });
  }
  /**************** Check Validatation Code That Sent Via SMS Or Voice Call ********/
  checkAuthUser(nexmo, data, generateId, callback) {
    if (!data.request_id || !data.code) {
      callback({
        status: false,
        message: "Empty Request Credentials !",
      });

      return;
    }
    let params = {
      request_id: data.request_id,
      code: data.code,
    };
    nexmo.verify.check(params, (err, response) => {
      if (err) {
        callback({
          status: false,
          message: "Error Verfiy Phone Number May Be Already Used Before !",
        });
      } else {
        if (response.status == 0) {
          // Add User Into MongoDB
          this.addUser(data, generateId, (result) => {
            callback(result);
          });
        } else {
          callback({
            status: false,
            message: response.error_text,
          });
        }
      }
    });
  }
  /********** Add User To Database *********************/
  addUser(data, generateId, callback) {
    if (!data.phoneNumber) {
      callback({ status: false, message: "Missing Phone Number !!" });
      return;
    }
    this.dbinstance.select(
      this.tablename,
      { phoneNumber: data.phoneNumber.trim() },
      (res) => {
        if (res) {
          (async () => {
            let result = await generateId.getTempId(res._id.toString());
            callback(result);
          })();
        } else {
          this.dbinstance.insert(
            this.tablename,
            { phoneNumber: data.phoneNumber.trim() },
            (usId) => {
              (async () => {
                let result = await generateId.getTempId(usId.toString());
                callback(result);
              })();
            }
          );
        }
      }
    );
  }
  /***************** Generate Temp Ids ************************/
  generateTempIds(data, generateId, callback) {
    if (!data.tempId) {
      callback({
        status: false,
        message: "Please Send The Temporary Id With The Body Request !!",
      });
      return;
    }
    try {
      var userId = generateId.decryptTempId(data.tempId).uid;
    } catch (err) {
      callback({
        status: false,
        message: "Wrong Temp Id  Or Lenght Of Bytes incorrect !!",
      });
      return;
    }
    /*****  Check If This Used Id Assined To An User ******/
    this.dbinstance.select(
      this.tablename,
      { _id: ObjectId(userId) },
      (user) => {
        if (!user) {
          callback({
            status: false,
            message: "This Id Not Linked To Any User !!",
          });
          return;
        }
        (async () => {
          let newGenerateIds = await generateId.getTempId(userId.toString());
          callback(newGenerateIds);
        })();
      }
    );
  }
  /****************** Decrypt Temp Id ********************* */
  DecryptId(data, generateId) {
    if (!data.tempId) {
      return {
        status: false,
        message: "Please Send The Temporary Id With The Body Request !!",
      };
    }
    try {
      return {
        status: true,
        user: generateId.decryptTempId(data.tempId),
      };
    } catch (err) {
      return {
        status: false,
        message: "Wrong Temp Id  Or Lenght Of Bytes incorrect !! ",
      };
    }
  }

  /********* Verification Token Before Insert File Into Database */
  verificationToken(token) {
    if (!token) {
      return {
        status: false,
        message: "Missing Token Value",
      };
    }
    return uploadToken.functions.validateToken(token, true);
  }
  /******************Upload File ****************************/
  uploadFile(file, data, callback) {
    try {
      var res = this.verificationToken(data.token);
      if (res.status) {
        if (!file) {
          callback({
            status: false,
            message: "No file uploaded Yet  !",
          });
        } else if (!file.mimetype.match("application/json")) {
          callback({
            status: false,
            message: "This Kind Of File Not Allowed !",
          });
        } else {
          let tracking = JSON.parse(file.buffer.toString("utf8"));
          this.dbinstance.insert(
            this.tablename,
            {
              tracking,
              uid: res.uid,
              status: 0,
              createdAt: new Date(),
              deletedAt: null,
            },
            (result) => {
              callback({
                status: true,
                message: "File is uploaded SuccessFully ",
              });
            }
          );
        }
      } else {
        callback(res);
      }
    } catch (err) {
      callback({
        status: false,
        message: "Some Error Happened During Upload File",
      });
    }
  }
};
