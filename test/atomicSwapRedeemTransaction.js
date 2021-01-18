const dashcore = require('@dashevo/dashcore-lib');
const Opcode = dashcore.Opcode;
const { sha256, sha256ripemd160 } = require('@dashevo/dashcore-lib/lib/crypto/hash');

const should = require('chai').should();
const assert = require('chai').assert;
const sinon = require('sinon');

const script = require('@dashevo/dashcore-lib/lib/script');

const atomicSwap = require('../index.js');

describe('AtomicSwapRedeemTransaction', function () {

    

    var pubKeyParticipantString = '035fea736ab0616ee0f7d6e6457fcf134a8cf4895d68782c97c8478ce7b358be73';
    var privKeyParticipantString = 'cNhWrx5H7NfiBfQQvNVNSGdUed2tw1hEe8orApZKdXrDzZppnwy9';

    var pubKeyInitiatorString = '032467d3b4f250158332c7c56c56380dd49847046b29b08b733902a7f7f5af3242';

    var secret = Buffer.from('d101c31d311f8a683f36778548ed95963f542b014d4f9aae9ea84d9721856745', 'hex');
    var secretHash = sha256(secret);

    var fundingTransactionId = 'd918bfe2bb62f1a44cbbbb479dc1371fe3b9dc2148af80be3935bac2d69daf68';
    var toAddress = 'yRjpTRMfuC9BmgAHf7qbKB7JeBZhvrrqWW';

    var rs = new atomicSwap.RedeemScript(secretHash, pubKeyParticipantString, pubKeyInitiatorString, 24);
    var scriptPubKey = dashcore.Script()
        .add(Opcode.OP_HASH160)
        .add(sha256ripemd160(Buffer.from(rs.toHex(), 'hex')))
        .add(Opcode.OP_EQUAL)



    it('should make a valid transaction with valid arguments', function () {
        var redeemTx = new atomicSwap.RedeemTransaction(rs.scriptAddress(), fundingTransactionId, 0, 100, toAddress, rs);
        should.exist(redeemTx, "transaction should be created");
        assert(redeemTx.verify(), "transaction should pass basic validation");
    });

    it("unlocking script should pass with a valid secret and signature", function () {
        var interpreter = script.Interpreter()
        var redeemTx = new atomicSwap.RedeemTransaction(rs.scriptAddress(), fundingTransactionId, 0, 100, toAddress, rs);
        redeemTx.setSecret(secret).sign(privKeyParticipantString);
        var scriptSig = redeemTx.inputs[0].script;

        assert(
            interpreter.verify(scriptSig, scriptPubKey, redeemTx, 0, script.Interpreter.SCRIPT_VERIFY_P2SH),
            interpreter.errstr
        );
    });

    it("unlocking script should fail with a incorrect secret", function() {
        let interpreter = script.Interpreter()
        var redeemTx = new atomicSwap.RedeemTransaction(rs.scriptAddress(), fundingTransactionId, 0, 100, toAddress, rs);
    
        var incorrectSecret = Buffer.from('deadbeef311f8a683f36778548ed95963f542b014d4f9aae9ea84d9721856745', 'hex');
        redeemTx.setSecret(incorrectSecret).sign(privKeyParticipantString);

        var scriptSig = redeemTx.inputs[0].script;
        assert.isFalse(
            interpreter.verify(scriptSig, scriptPubKey, redeemTx, 0, script.Interpreter.SCRIPT_VERIFY_P2SH), 
            "scriptsig should fail with incorrect secret"
        );
        assert.equal('SCRIPT_ERR_EQUALVERIFY', interpreter.errstr)
    });

    it("unlocking script should fail with a incorrect private key", function() {
        let interpreter = script.Interpreter()
        var redeemTx = new atomicSwap.RedeemTransaction(rs.scriptAddress(), fundingTransactionId, 0, 100, toAddress, rs);
        
        var wrongPrivKey = 'cThhxbQUtBDzHZbZrW6XAR4XkXfaQf4Abo7BQaTK2zVp7sVrHdmv';
        redeemTx.setSecret(secret).sign(wrongPrivKey);

        var scriptSig = redeemTx.inputs[0].script;
        assert.isFalse(
            interpreter.verify(scriptSig, scriptPubKey, redeemTx, 0, script.Interpreter.SCRIPT_VERIFY_P2SH), 
            "scriptsig should fail with incorrect private key"
        );
        assert.equal('SCRIPT_ERR_EVAL_FALSE_IN_P2SH_STACK', interpreter.errstr)
    });

});