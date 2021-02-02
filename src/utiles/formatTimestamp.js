const moment = require("moment");
const config = require("../config.json");

const TIMESTAMP_FORMAT = "DD-MMM-YYYY HH:mm:ss Z";

function formatTimestamp(timestamp) {
  return moment
    .unix(timestamp)
    .utcOffset(config.tempIdConfig.utcOffset)
    .format(TIMESTAMP_FORMAT);
}

module.exports = formatTimestamp;
