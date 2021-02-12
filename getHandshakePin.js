const PinGenerator = require("./utiles/PinGenerator");
/**
 * Get the handshake pin for a user.
 */

const getHandshakePin = async (uid) => {
  try {
    return {
      status: true,
      pin: await new PinGenerator().generatePin(uid),
    };
  } catch (error) {
    console.error(
      "getHandshakePin: Error while trying to generate handshake pin.",
      error
    );
  }
};
module.exports = getHandshakePin;
