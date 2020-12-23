const dashcore = require('@dashevo/dashcore-lib');
const PublicKey = dashcore.PublicKey;
const { sha256 } = dashcore.crypto.Hash;
const should = require('chai').should();
const atomicSwap = require('../index.js');
const sinon = require('sinon');


describe('RedeemScript', function () {

  var clock = sinon.useFakeTimers({
    now: 1483228800000
  });

  it('should make a new script', function () {
    let pubKeyParticipant = PublicKey(
      '0315a66994d646c76278b2c4731448cfbe85c4b09d7fdc7f073246b4985409f1ce'
    );

    let pubKeyInitiator = PublicKey(
      '0315a66994d646c76278b2c4731448cfbe85c4b09d7fdc7f073246b4985409f1ce'
    );

    let secret = Buffer.from('18c973fb967991cc3803bb115cdf1c297f3cec46f9c34966385cefb5b400e359', 'hex')
    let secretHash = sha256(secret)

    var script = new atomicSwap.RedeemScript(secretHash, pubKeyInitiator, pubKeyParticipant, 12);
    should.exist(script);
    script.scriptAddress().toString().should.eql('8yAAP3xhr6Q2CYCDbbWSXs2QNmH3KKaVb1');
    verified = dashcore.Script.Interpreter().verify(script);
    verified.should.eql(true);
  });

});