router = require("express").Router();
path = require("path");
const { check, validationResult } = require("express-validator");
const objectId = require("mongodb").ObjectId;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../model/admins");
const Contact = require("../model/contacts");
const Account = require("../model/account");
const SearchContact = require("../middleware/searchContact");
const auth = require("../middleware/auth");
const initialiseDatabase = require("../config/database");
initialiseDatabase();

/*********** Home Page MiddleWare *********/

function handleIndexPage(req, res, next) {
  if (req.cookies.access_token) {
    res.redirect("/dashboard");
    return;
  }
  next();
}
/********** Home Page ***********/

router.get("/", handleIndexPage, (req, res) => {
  const pageTitle = "Covid 19 - MA";
  res.render("login/login", {
    pageTitle : pageTitle
  });
});
/************ Dashboard *************** */
router.get("/dashboard", auth, async (req, res) => {
  /********************* About Account***************** */
  await User.findById(req.userId, { password: 0 })
    .then(async (user) => {
      if (user) {
        let contacts = await Contact.find({ deletedAt: null }, { _id: 0 });
        var newInfected = 0;
        let listOfUserIds = contacts.map((ct) => {
          if (ct.status == 0) {
            newInfected++;
          }
          return objectId(ct.uid);
        });
        infectedUsers = await Account.find({
          _id: { $in: listOfUserIds },
        });
        /************* Merge Contact With Her/His Info***************/
        for (let c = 0; c < contacts.length; c++) {
          for (let u = 0; u < infectedUsers.length; u++) {
            if (contacts[c].uid == infectedUsers[u]._id) {
              contacts[c].phone = infectedUsers[u].phoneNumber;
            }
          }
        }

        /******************************************** */
        res.render("dashboard", {
          user,
          news: newInfected,
          contacts,
          path : '/dashboard'
        });
        return;
      }
      res.clearCookie("access_token").redirect("/");
    })
    .catch((err) => {
      res.sendStatus(500);
    });
});

/************ covidTrack *************** */
router.get("/covid_track", auth, async (req, res) => {
  /********************* About Account***************** */
  await User.findById(req.userId, { password: 0 })
    .then(async (user) => {
      if (user) {
        let contacts = await Contact.find({ deletedAt: null }, { _id: 0 });
        var newInfected = 0;
        let listOfUserIds = contacts.map((ct) => {
          if (ct.status == 0) {
            newInfected++;
          }
          return objectId(ct.uid);
        });
        infectedUsers = await Account.find({
          _id: { $in: listOfUserIds },
        });
        /************* Merge Contact With Her/His Info***************/
        for (let c = 0; c < contacts.length; c++) {
          for (let u = 0; u < infectedUsers.length; u++) {
            if (contacts[c].uid == infectedUsers[u]._id) {
              contacts[c].phone = infectedUsers[u].phoneNumber;
            }
          }
        }

        /******************************************** */
        res.render("covidTrack", {
          user,
          news: newInfected,
          contacts,
          path: '/covid_track'
        });
        return;
      }
      res.clearCookie("access_token").redirect("/");
    })
    .catch((err) => {
      res.sendStatus(500);
    });
});


/************** Profile  *****************/
router.get("/profile/:username", auth, async (req, res) => {
  await User.findById(req.userId)
    .then((userAccount) => {
      res.render("profile", { user: userAccount });
    })
    .catch((err) => {
      res.sendStatus(500);
    });
});
/************** Profile Simple User Update Data*****************/
router.put("/user/update", auth, async (req, res) => {
  if (!req.body) {
    res.send({ status: false, message: "Data to update can not be empty!" });
  }
  var accountToUpdate = {};
  const id = req.userId;
  const salt = await bcrypt.genSalt(10);
  if (req.body.password.length > 0 && req.body.password.length < 8) {
    res.send({
      status: false,
      message: "Insuffisant Password Length !!",
    });
    return;
  }
  if (req.body.password.length > 8) {
    accountToUpdate.password = await bcrypt.hash(req.body.password, salt);
  }
  accountToUpdate.username = req.body.username;
  accountToUpdate.email = req.body.email;
  User.findByIdAndUpdate(id, accountToUpdate)
    .then((data) => {
      if (!data) {
        res.send({
          status: false,
          message: `Cannot update user with id=${id}. Maybe user not found!`,
        });
      } else {
        res.send({ status: true, message: "User updated successfully." });
      }
    })
    .catch((err) => {
      res.send({ status: false, message: "Error updating User with id=" + id });
    });
});
/************ Mark Contact As Tracking ****/

router.post("/user/tracking", auth, async (req, res) => {
  // Check If Your Admin
  User.findById(req.userId)
    .then(async (cred) => {
      if (cred.status) {
        let userId = req.body.id;
        if (userId == "") {
          res.send({
            status: false,
            message: "Empty Data Sending Try Again !!",
          });
          return;
        }
        await Contact.findOneAndUpdate({ uid: userId }, { status: 1 })
          .then((reslt) => {
            if (reslt) {
              res.send({ status: true });
            } else {
              res.send({ status: false });
            }
          })
          .catch((err) => {
            res.send({ status: false, message: "Ops !!, Error Try Again" });
          });
        return;
      }
      res.json({
        status: false,
        message: "Your Are Not Allowed For This Action !",
      });
    })
    .catch((err) => {
      res.json({ status: false, message: "Error Make A Tracking Accounts !" });
    });
});

/************ Delete Contact ****************/

router.post("/user/delete", auth, async (req, res) => {
  // Check If Your Admin
  User.findById(req.userId)
    .then(async (cred) => {
      if (cred.status) {
        let userId = req.body.id;
        if (userId == "") {
          res.send({
            status: false,
            message: "Empty Data Sending Try Again !!",
          });
          return;
        }
        await Contact.findOneAndUpdate(
          { uid: userId },
          { deletedAt: new Date() }
        )
          .then((reslt) => {
            if (reslt) {
              res.send({ status: true });
            } else {
              res.send({ status: false });
            }
          })
          .catch((err) => {
            res.send({ status: false, message: "Ops !!, Error Try Again" });
          });
        return;
      }
      res.json({
        status: false,
        message: "Your Are Not Allowed For This Action !",
      });
    })
    .catch((err) => {
      res.json({ status: false, message: "Error Deleted Accounts !" });
    });
});

/************* Get All Account ***************/
router.get("/accounts/all", auth, function (req, res) {
  // Check If Your Admin
  User.findById(req.userId)
    .then((cred) => {
      if (cred.status) {
        User.find(
          { _id: { $ne: req.userId } },
          { __v: 0, password: 0 },
          function (err, result) {
            if (err) {
              res.json({ status: false, message: "Error Retrieve Accounts !" });
            } else {
              res.json({ status: true, message: result });
            }
          }
        );
        return;
      }
      res.json({
        status: false,
        message: "Your Are Not Allowed For This Action !",
      });
    })
    .catch((err) => {
      res.json({ status: false, message: "Error Retrieve Accounts !" });
    });
});

/************** Delete Account **************/
router.delete("/account/delete", auth, async (req, res) => {
  let userId = req.body.id;
  if (userId == "") {
    res.send({ status: false, message: "Empty Data Sending Try Again !!" });
    return;
  }
  await User.findByIdAndDelete(userId)
    .then((reslt) => {
      if (reslt) {
        res.send({ status: true });
      } else {
        res.send({ status: false });
      }
    })
    .catch((err) => {
      res.send({ status: false, message: "Ops !!, Error Try Again" });
    });
});

/************** Edit Account ***************/
router.put("/account/edit/:id", auth, async (req, res) => {
  if (!req.body) {
    res.send({ status: false, message: "Data to update can not be empty!" });
  }
  var accountToUpdate = {};
  const id = req.params.id;
  const salt = await bcrypt.genSalt(10);
  if (req.body.password.length > 0 && req.body.password.length < 8) {
    res.send({
      status: false,
      message: "Insuffisant Password Length !!",
    });
    return;
  }
  if (req.body.password.length > 8) {
    accountToUpdate.password = await bcrypt.hash(req.body.password, salt);
  }
  accountToUpdate.username = req.body.username;
  accountToUpdate.email = req.body.email;
  accountToUpdate.status = req.body.role;
  User.findByIdAndUpdate(id, accountToUpdate)
    .then((data) => {
      if (!data) {
        res.send({
          status: false,
          message: `Cannot update user with id=${id}. Maybe user not found!`,
        });
      } else {
        res.send({ status: true, message: "User updated successfully." });
      }
    })
    .catch((err) => {
      res.send({ status: false, message: "Error updating User with id=" + id });
    });
});
/****************** Add Account *****************/

router.post(
  "/user/regitser",
  [
    check("username", "Please entre a valid username").not().isEmpty(),
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Please enter a valid password").isLength({
      min: 8,
    }),
  ],
  async (req, res) => {
    try {
      // Validate User Input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.json({ status: 2, message: errors.array() });
        return;
      }
      /********************************************/
      var { username, email, password } = req.body;
      /**************************************/
      // Find User In Database
      let result = await User.findOne({ email });
      if (result) {
        res.json({ status: 0, message: "Account Already Exists" });
        return;
      }
      /*******************************/
      // Hash Password
      let salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);
      var user = null;
      if ("role" in req.body) {
        var status = req.body.role;
        user = new User({ username, email, password, status });
      } else {
        user = new User({ username, email, password });
      }
      /******************************/
      // Save User In Database
      await user
        .save()
        .then((doc) => {
          /********************************* */
          res.send({ status: 1, message: "Account Added Successfully " });
          /******************************* */
        })
        .catch((err) => {
          res.send({
            status: 0,
            message: "Ops !! , Error Saving  Account Try Again.",
          });
        });
      /************************/
    } catch (err) {
      console.log(err);
      res.send({
        status: 0,
        message: "Ops !! ,SomeThing Wrong Try Again.",
      });
    }
  }
);
/****************** Login Account****************** */
const invalidData = "Merci de vérifier que tous les champs sont bien renseignés !";
const worngData = "Votre email ou mot de passe est incorrect veuillez le vérifier !"

router.post(
  "/user/login",
  [
    check("email", invalidData).isEmail(),
    check("password", invalidData).isLength({
      min: 8,
    }),
  ],
  async (req, res) => {
    try {
      /************************************/

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.json({ status: 2, message: errors.array() });
        return;
      }
      /************************************/
      const { email, password } = req.body;
      await User.findOne({ email })
        .then(async (doc) => {
          if (!doc) {
            res.json({ status: 0, message: worngData });
            return;
          }
          /**********************************************/
          /*const isMatch = await bcrypt.compare(password, doc.password);
          if (!isMatch) {
            res.json({ status: 0, message: worngData });
            return;
          }*/
          let payload = {
            userId: doc._id,
          };
          jwt.sign(
            payload,
            "randomString",
            { expiresIn: "1d" },
            (err, token) => {
              if (err) throw err;
              res
                .cookie("access_token", token, {
                  path: "/",
                  httpOnly: true,
                })
                .send({ status: 1, message: "/dashboard" });
            }
          );
        })
        .catch((err) => {
          res.json({
            status: 0,
            message: "Ops !!, Error Login Try Again.",
          });
        });
    } catch (e) {
      res.json({ status: 0, message: "Server Error" });
    }
  }
);

/**************************** Api Used On Front End Which Mean With Page WEB ****************/
router.get("/contacts/getContactNumbers", auth, (req, res) => {
  let searchContact = new SearchContact(Contact, Account);
  searchContact.getPhoneNumbers(req.query.id, (contacts) => {
    // Create Excel File And Add Data To It
    const fs = require("fs");
    const path = require("path");
    const excel = require("node-excel-export");
    let FilePath = path.join(__dirname, `Report.xlsx`);
    bufferData = addRowToFile(contacts, excel);
    fs.writeFileSync(FilePath, bufferData);
    res.download(FilePath, (result) => {
      fs.unlinkSync(FilePath);
    });
  });
});

function addRowToFile(contacts, excel) {
  const styles = {
    headerDark: {
      fill: {
        fgColor: {
          rgb: "FF000000",
        },
      },
      font: {
        color: {
          rgb: "FFFFFFFF",
        },
        sz: 14,
        bold: true,
        underline: false,
      },
    },
    cellPink: {
      fill: {
        fgColor: {
          rgb: "FFFFCCFF",
        },
      },
    },
    cellGreen: {
      fill: {
        fgColor: {
          rgb: "FF000000",
        },
      },
      font: {
        color: {
          rgb: "FFFFFFFF",
        },
        sz: 16,
        bold: true,
        underline: false,
      },
      alignment: {
        horizontal: "center",
      },
    },
  };

  const specification = {
    phoneNumber: {
      displayName: "phone Number",
      headerStyle: styles.cellGreen,
      width: 180,
    },
    Device: {
      displayName: "Device Name",
      headerStyle: styles.cellGreen,
      width: 150,
    },
    MacAdd: {
      displayName: "Mac Address",
      headerStyle: styles.cellGreen,
      width: 150,
    },
    Distance: {
      displayName: "Distance",
      headerStyle: styles.cellGreen,
      width: 150,
    },
    Location: {
      displayName: "Coordination ",
      headerStyle: styles.cellGreen,
      width: 150,
    },
    Power: {
      displayName: "Force Of Signal ",
      headerStyle: styles.cellGreen,
      width: 150,
    },
    SignalForce: {
      displayName: "Signal strength ",
      headerStyle: styles.cellGreen,
      width: 150,
    },
    Time: {
      displayName: "Handshake Date",
      headerStyle: styles.cellGreen,
      width: 150,
    },
  };
  const report = excel.buildExport([
    {
      name: "User Contacts",
      specification: specification,
      data: contacts,
    },
  ]);
  return report;
}

/*********** Refresh Data  **************************/
router.get("/contacts/refresh", auth, async (req, res) => {
  var contacts = await Contact.find(
    { deletedAt: null },
    {
      _id: 0,
      "tracking.ContactsNearby": 0,
      "tracking.Contacts": 0,
      "tracking.Profile": 0,
      deletedAt: 0,
    }
  );
  var userPermission = await User.findById(req.userId, { password: 0 });
  var newInfected = 0;
  contacts.forEach((ct) => {
    if (ct.status == 0) {
      newInfected++;
    }
  });

  /************* Merge Contact With Her/His Info***************/

  res.json({
    contacts,
    infected: newInfected,
    role: userPermission.status,
  });
});
/************** Logout Account *****************/
router.get("/logout", (req, res) => {
  res.clearCookie("access_token", { path: "/" }).redirect("/");
});
/************** Handle Other Request */
router.all("*", (req, res) => {
  res.status(404).send("OPs!! , Page Not Found");
});
module.exports = router;
