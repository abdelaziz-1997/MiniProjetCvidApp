/**
 * This class uses a plain substring to generate a pin from user uid.
 * It should be subclassed with a secure implementation.
 */
class PinGenerator {
  async generatePin(uid) {
    return uid.substring(0, 6).toUpperCase();
  }
}
module.exports = PinGenerator;
