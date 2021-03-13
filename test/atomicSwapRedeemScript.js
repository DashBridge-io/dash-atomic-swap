import dashcore from '@dashevo/dashcore-lib';
const PublicKey = dashcore.PublicKey;
const Address = dashcore.Address;
const { sha256 } = dashcore.crypto.Hash;

import chai from 'chai';
const should = chai.should();
const assert = chai.assert;

import * as atomicSwap from '../index.js';

describe('AtomicSwapRedeemScript', function () {

  var pubKeyParticipantString = '0315a66994d646c76278b2c4731448cfbe85c4b09d7fdc7f073246b4985409f1ce';
  var pubKeyInitiatorString = '0315a66994d646c76278b2c4731448cfbe85c4b09d7fdc7f073246b4985409f1ce';
  var secretHashString = 'b7102915f20ae3d568f3b35633bf078d95f109ef2c9807eac6e1bc24a836710e';

  it('should make a new script with valid arguments', function () {

    const pubKeyParticipant = PublicKey(pubKeyParticipantString);
    const pubKeyInitiator = PublicKey(pubKeyInitiatorString);
    const secretHash = Buffer.from(secretHashString, 'hex');
    
    const redeemScript = new atomicSwap.RedeemScript(secretHash, pubKeyInitiator, pubKeyParticipant, 12);
    
    should.exist(redeemScript, "Redeem Script should be created");
    const p2shAddress = redeemScript.scriptAddress(dashcore.Networks.testnet);
    assert(Address.isValid(p2shAddress), "Script address should be valid");
    assert(p2shAddress.isPayToScriptHash(), "Script address should be a P2SH address");
    p2shAddress.toString().should.eql('8kh7bDnTjLjRBd9skvMqLcxGyG9ZLqZ1QM', 'Script address should be correct');
  });

  it('should make a new script with valid string arguments', function () {
    
    const redeemScript = new atomicSwap.RedeemScript(secretHashString, pubKeyInitiatorString, pubKeyParticipantString, 12);
    
    should.exist(redeemScript, "Redeem Script should be created");
    const p2shAddress = redeemScript.scriptAddress(dashcore.Networks.testnet);
    assert(Address.isValid(p2shAddress), "Script address should be valid");
    assert(p2shAddress.isPayToScriptHash(), "Script address should be a P2SH address");
    p2shAddress.toString().should.eql('8kh7bDnTjLjRBd9skvMqLcxGyG9ZLqZ1QM', 'Script address should be correct');
  });

});