const express = require("express");
const app = express();
const router = require("./src/router");
const webRouter = require("./src/web/routes/webRouter");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const cookiesParser = require("cookie-parser");
require("pug");
const port = 3000;
const hostname = "localhost";
/*******************       ********/
// Set Template Engine Settings
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "src/web/views"));
app.use(express.static(path.join(__dirname, "src/web/assets")));
app.use(cors());
app.use(cookiesParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api", router);
app.use(webRouter);

/******************* ******************/
app.listen(port, hostname, () => {
  let fs = require("fs");
  let path = require("path");
  let FilePath = path.join(__dirname, "setup.js");
  if (fs.existsSync(FilePath)) {
    fs.unlinkSync(FilePath);
  }
  console.log(`Our Server Running On => http://${hostname}:${port}`);
});
