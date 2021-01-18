const dashcore = require('@dashevo/dashcore-lib');
const PublicKey = dashcore.PublicKey;
const Address = dashcore.Address;
const { sha256 } = dashcore.crypto.Hash;

const should = require('chai').should();
const assert = require('chai').assert;
const sinon = require('sinon');

const atomicSwap = require('../index.js');

describe('AtomicSwapInput', function () {

    var pubKeyParticipantString = '022a6cad869db11d39126705271b62bdbf5c9e056f864c33e27c3e301940045209';
    var privKeyParticipantString = 'cUJBmQh7gHXR3DsbrZjkP6kyXNzWCw7WaH7jP7MrxQqQCiokW9ES';
    
    var pubKeyInitiatorString = '0315a66994d646c76278b2c4731448cfbe85c4b09d7fdc7f073246b4985409f1ce';
    
    var secret = Buffer.from('b7102915f20ae3d568f3b35633bf078d95f109ef2c9807eac6e1bc24a836710e', 'hex')
    var secretHash = sha256(secret);

    var fundingTransactionId = '4addecbebba5b92168ae0ce34bd0507c19e35f755e64412a53d3b496859bf108';
    var toAddress = 'ybiftkenuV8tppJ8VjKv49oG6pmkTRN312';

    var redeemScript = new atomicSwap.RedeemScript(secretHash, pubKeyParticipantString, pubKeyInitiatorString, 24);
    var swapAddress = redeemScript.scriptAddress();

    it('should construct a valid input', function() {
        var input = new atomicSwap.Input(swapAddress, fundingTransactionId, 0, 100, redeemScript);
    }); 


});