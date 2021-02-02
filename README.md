1 - install node module :  npm install

2 - launch the server : npm start

3-  add new admin in mongodb cmd:
      
      use marocvide19
      db.admins.insertOne({username:"admin", email:"admin@admin.com", passwrod:"123456789", status: 1})
