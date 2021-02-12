const MongoClient = require("mongodb").MongoClient;
class Database {
  /*************** Constructor **************/

  constructor(dbname) {
    this.url = "mongodb://localhost:27017/";
    this.options = {
      useUnifiedTopology: true,
    };
    this.name = dbname;
  }
  /**************** Connection  *************/
  connection() {
    return MongoClient.connect(this.url, this.options)
      .then((client) => {
        this.db = client.db(this.name);
        return "Connection To Mongodb  Successfully. ";
      })
      .catch((err) => {
        return "Error Connection To Mongodb. " + err;
      });
  }
  /**************** Insert  ****************/
  insert(tablename, document, callback) {
    this.db
      .collection(tablename)
      .insertOne(document)
      .then((res) => {
        callback(res.insertedId);
      })
      .catch((err) => {
        callback("Error Insert Data : ", err);
      });
  }
  /**************** Insert With Promise ****************/
  async insertAsync(tablename, document) {
    return await this.db
      .collection(tablename)
      .insertOne(document)
      .then((res) => res.insertedId)
      .catch((error) => "Error Insert Data : " + error);
  }

  /**************** Select  ****************/
  select(tablename, document, callback) {
    this.db
      .collection(tablename)
      .findOne(document)
      .then((res) => {
        callback(res);
      })
      .catch((err) => {
        console.log("Error Retrieve Document : ", err);
      });
  }
  /**************** Select  ****************/
  async selectAsync(tablename, document) {
    return await this.db
      .collection(tablename)
      .find(document)
      .toArray()
      .then((res) => res)
      .catch((err) => "Error Retrieve Document : " + err);
  }
  /**************** Update  ****************/
  update(tablename, condition, document, callback) {
    this.db
      .collection(tablename)
      .updateOne(condition, { $set: document })
      .then((res) => {
        callback(res.result); // { n: 1, nModified: 0/n, ok: 1/0 }
      })
      .catch((err) => {
        console.log("Error Update Document : ", err);
      });
  }
  /**************** Delete  ****************/
  delete(tablename, condition, callback) {
    this.db
      .collection(tablename)
      .deleteOne(condition)
      .then((res) => {
        callback(res.result); // { n: 0, ok: 1/0 }
      })
      .catch((err) => {
        console.log("Error Delete Document : ", err);
      });
  }
  /******************* ************************/
  selectUsers(tablename, contactsId, callback) {
    this.db
      .collection(tablename)
      .find({
        _id: {
          $in: contactsId,
        },
      })
      .toArray((err, users) => {
        callback(users);
      });
  }

  out() {
    this.db.logout();
  }
}
module.exports = Database;
