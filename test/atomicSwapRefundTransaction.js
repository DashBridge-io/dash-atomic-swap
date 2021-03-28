import dashcore from '@dashevo/dashcore-lib';
const { Opcode } = dashcore;
import script from '@dashevo/dashcore-lib/lib/script/script.js';
const { sha256, sha256ripemd160 } = dashcore.crypto.Hash;

import chai from 'chai';
const { assert } = chai;
const should = chai.should();
import sinon from 'sinon';

import * as atomicSwap from '../index.js';

describe('AtomicSwapRefundTransaction', function () {
    var pubKeyInitiatorString = '035fea736ab0616ee0f7d6e6457fcf134a8cf4895d68782c97c8478ce7b358be73';
    var privKeyInitiatorString = 'cNhWrx5H7NfiBfQQvNVNSGdUed2tw1hEe8orApZKdXrDzZppnwy9';

    var pubKeyParticipantString = '032467d3b4f250158332c7c56c56380dd49847046b29b08b733902a7f7f5af3242';

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
        var redeemTx = new atomicSwap.RefundTransaction(rs.scriptAddress(), fundingTransactionId, 0, 100, toAddress, rs);
        should.exist(redeemTx, "transaction should be created");
        assert(redeemTx.verify(), "transaction should pass basic validation");
    });

    it("unlocking script should pass with a valid signature if refund time has passed", function () {
        var interpreter = script.Interpreter()
        var refundTX = new atomicSwap.RefundTransaction(rs.scriptAddress(), fundingTransactionId, 0, 100, toAddress, rs);

        let locktime = 23.9 * 60 * 60; //seconds
        locktime = Math.floor(locktime / 512);
        refundTX.inputs[0].sequenceNumber = 0x400000 | locktime;

        refundTX.sign(privKeyInitiatorString);
        var scriptSig = refundTX.inputs[0].script;
        console.log(`locktime: ${refundTX.inputs[0].sequenceNumber.toString(16)}`);
        assert(
            interpreter.verify(scriptSig,
                scriptPubKey,
                refundTX,
                0,
                script.Interpreter.SCRIPT_VERIFY_P2SH | script.Interpreter.SCRIPT_VERIFY_CHECKSEQUENCEVERIFY
            ),
            interpreter.errstr
        );
    });

    it("unlocking script should fails with a valid signature if refund time not passed", function () {
        var interpreter = script.Interpreter()
        var refundTx = new atomicSwap.RefundTransaction(rs.scriptAddress(), fundingTransactionId, 0, 100, toAddress, rs);

        let locktime = 5 * 60 * 60; //seconds
        locktime = Math.floor(locktime / 512);
        refundTx.inputs[0].sequenceNumber = 0x400000 | locktime;

        refundTx.sign(privKeyInitiatorString);
        var scriptSig = refundTx.inputs[0].script;

        assert.isFalse(
            interpreter.verify(scriptSig,
                scriptPubKey,
                refundTx,
                0,
                script.Interpreter.SCRIPT_VERIFY_P2SH | script.Interpreter.SCRIPT_VERIFY_CHECKSEQUENCEVERIFY
            ),
            "Scriptsig should fail if refund time has not passed"
        );
        assert.equal('SCRIPT_ERR_UNSATISFIED_LOCKTIME', interpreter.errstr)
    });

    it("unlocking script should fail with a incorrect private key even if refund time has passed", function () {
        let interpreter = script.Interpreter()
        var refundTx = new atomicSwap.RefundTransaction(rs.scriptAddress(), fundingTransactionId, 0, 100, toAddress, rs);

        let locktime = 35 * 60 * 60; //seconds
        locktime = Math.floor(locktime / 512);
        refundTx.inputs[0].sequenceNumber = 0x400000 | locktime;

        var wrongPrivKey = 'cThhxbQUtBDzHZbZrW6XAR4XkXfaQf4Abo7BQaTK2zVp7sVrHdmv';
        refundTx.sign(wrongPrivKey);

        var scriptSig = refundTx.inputs[0].script;
        assert.isFalse(
            interpreter.verify(
                scriptSig,
                scriptPubKey,
                refundTx,
                0,
                script.Interpreter.SCRIPT_VERIFY_P2SH | script.Interpreter.SCRIPT_VERIFY_CHECKSEQUENCEVERIFY
            ),
            "scriptsig should fail with incorrect private key"
        );
        assert.equal('SCRIPT_ERR_EVAL_FALSE_IN_P2SH_STACK', interpreter.errstr)
    });
});