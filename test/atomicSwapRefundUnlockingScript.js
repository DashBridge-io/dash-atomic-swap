import dashcore from '@dashevo/dashcore-lib';
const { Signature } = dashcore.crypto;

import chai from 'chai';
const { assert } = 'chai';
const should = chai.should();
import sinon from 'sinon';

import * as atomicSwap from '../index.js';

describe('AtomicSwapRefundUnlockingScript', function () {

    var pubKeyParticipant = '02a98cbc445d9294c658d0dac9d82deb7c0137d2558eb89c30e17922824d8ef88f';
    var pubKeyInitiator = '02575698ffde94eba8c6a76dad836433ee7d48fe218ed854e534b340a223128fc6';
    var secret = 'fd8803030646ef899f562c9c5ad496951111c462c13627bc94066dfa4531bac1';
    var secretHash = '7c6aa9bad89bc4f81fac83266d1f8e2232cec9d7910a58db216d943edd256df2'
    const redeemScript = new atomicSwap.RedeemScript(secretHash, pubKeyInitiator, pubKeyParticipant, 12);
    const signatureString = "304402207b8982379aeffd92b6441fdec6920be26b85d02b2a5a2dd48ed282010f8e1bdb02204949f365f012a1820ffe25abc4d437e3cab42ad1d7a255893768849ae0e4dc83"
    const signature = new Signature.fromString(signatureString);

    it("should create a script with valid arguments", function () {
        var unlockingScript = new atomicSwap.RefundUnlockingScript(redeemScript, { signature: signature });
        should.exist(unlockingScript, "unlocking script should be created");
        unlockingScript.toString().should.contain(redeemScript.toHex(), "unlocking script should include redeem script");
        unlockingScript.toString().should.contain(signatureString, "unlocking script should contain the signature");
    });
});