const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.cookies.access_token;
  if (!token) return res.redirect("/");

  try {
    jwt.verify(token, "randomString", function (err, decoded) {
      if (err)
        return res.clearCookie("access_token", { path: "/" }).redirect("/");
      else {
        req.userId = decoded.userId;
        next();
      }
    });
  } catch (e) {
    res.status(500).send({ message: "Ops !! SomeThing Wrong Try Again !" });
  }
};
