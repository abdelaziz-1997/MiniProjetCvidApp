const decryptor = require("../../getTempId").decryptTempId;
const objectid = require("mongodb").ObjectId;

class SearchContact {
  constructor(Contact, Account) {
    this.contact = Contact;
    this.account = Account;
  }
  /*********************  **************/
  async getUserContact(uuid, callback) {
    this.contact.find({ uid: uuid }, (err, res) => {
      callback(res);
    });
  }

  decryptListOfIdTemp(listOfContacts) {
    var listOfContactsExtended = [];
    try {
      listOfContacts.forEach((contact) => {
        let userid = decryptor(contact.UserId).uid;
        contact.uuid = userid;
        listOfContactsExtended.push(contact);
      });
    } catch (err) {
      console.log("Error Retrieve User Id !! ");
    }
    return listOfContactsExtended;
  }
  /**********************      **********/
  async getPhoneNumbers(uid, callback) {
    try {
      if (!uid) {
        callback({ status: false, message: "Error Empty  Request !" });
        return;
      }
      /********************************** */
      await this.getUserContact(uid, async (result) => {
        if (!result) {
          callback({
            status: false,
            message: "Not Found Any Contact Has A Relation To This Number",
          });
          return;
        }

        /****************** Get User Id From id Temp */
        var listOfContacts = this.decryptListOfIdTemp(
          result[0].tracking.ContactsNearby
        );
        /************** Slice Users Id  *****************/
        var listOfUsersId = listOfContacts.map((contact) => {
          return objectid(contact.uuid);
        });
        /******************* Select Users Phone Numbers */
        await this.account.find({ _id: { $in: listOfUsersId } }).then(
          (contactsInfo) => {
            for (let i = 0; i < contactsInfo.length; i++) {
              for (let j = 0; j < listOfContacts.length; j++) {
                if (contactsInfo[i]._id == listOfContacts[j].uuid) {
                  contactsInfo[i].Time =
                    listOfContacts[j].MyScanned[0].whenBeenScanned;
                  contactsInfo[i].Distance =
                    listOfContacts[j].MyScanned[0].distance;
                  contactsInfo[i].Location =
                    listOfContacts[j].MyScanned[0].location;
                  contactsInfo[i].MacAdd =
                    result[0].tracking.Contacts[j].UserID;
                  contactsInfo[i].Device = result[0].tracking.Contacts[j].Name;
                  contactsInfo[i].Power =
                    result[0].tracking.Contacts[j].Scans[0].power;
                  contactsInfo[i].SignalForce =
                    result[0].tracking.Contacts[j].Scans[0].Rssi;
                }
              }
            }
            callback(contactsInfo);
          },
          (err) => {
            console.log(err);
          }
        );
      });
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = SearchContact;
