import dashcore from '@dashevo/dashcore-lib';
const { Signature } = dashcore.crypto;

import chai from 'chai';
const { assert } = 'chai';
const should = chai.should();
import sinon from 'sinon';

import * as atomicSwap from '../index.js';

describe('AtomicSwapUnlockingScript', function () {

    var pubKeyParticipant = '02a98cbc445d9294c658d0dac9d82deb7c0137d2558eb89c30e17922824d8ef88f';
    var pubKeyInitiator = '02575698ffde94eba8c6a76dad836433ee7d48fe218ed854e534b340a223128fc6';
    var secret = 'fd8803030646ef899f562c9c5ad496951111c462c13627bc94066dfa4531bac1';
    var secretHash = '7c6aa9bad89bc4f81fac83266d1f8e2232cec9d7910a58db216d943edd256df2'
    const redeemScript = new atomicSwap.RedeemScript(secretHash, pubKeyInitiator, pubKeyParticipant, 12);
    const signatureString = "304402207b8982379aeffd92b6441fdec6920be26b85d02b2a5a2dd48ed282010f8e1bdb02204949f365f012a1820ffe25abc4d437e3cab42ad1d7a255893768849ae0e4dc83"
    const signature = new Signature.fromString(signatureString);

    it("should create a script with valid arguments", function () {
        var unlockingScript = new atomicSwap.UnlockingScript(secret, redeemScript, { signature: signature });
        should.exist(unlockingScript, "unlocking script should be created");
        unlockingScript.toString().should.contain(Buffer.from(secret).toString('hex'), "unlocking script should include the secret");
        unlockingScript.toString().should.contain(redeemScript.toHex(), "unlocking script should include redeem script");
        unlockingScript.toString().should.contain(signatureString, "unlocking script should contain the signature");
    });

    it("should return the secret", function() {
        let unlockingScript = new atomicSwap.UnlockingScript(secret, redeemScript, { signature: signature });
        unlockingScript.getSecret().toString().should.equal(secret, "should return the secret");
    });

    it("should return the secret when constructed from hex", function() {
        let unlockingScript = atomicSwap.UnlockingScript.fromHex(
            '47304402207b8982379aeffd92b6441fdec6920be26b85d02b2a5a2dd48ed282010f8e1bdb02204949f365f012a1820ffe25abc4d437e3cab42ad1d7a255893768849ae0e4dc83014066643838303330333036343665663839396635363263396335616434393639353131313163343632633133363237626339343036366466613435333162616331514c7263a8207c6aa9bad89bc4f81fac83266d1f8e2232cec9d7910a58db216d943edd256df2882102575698ffde94eba8c6a76dad836433ee7d48fe218ed854e534b340a223128fc6ac6703540040b2752102a98cbc445d9294c658d0dac9d82deb7c0137d2558eb89c30e17922824d8ef88fac68'
            );
        unlockingScript.getSecret().toString().should.equal(secret, "Should return the secret");
    })
});