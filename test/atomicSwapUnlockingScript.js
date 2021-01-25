const dashcore = require('@dashevo/dashcore-lib');
const Signature = dashcore.crypto.Signature;

const should = require('chai').should();
const assert = require('chai').assert;
const sinon = require('sinon');

const atomicSwap = require('../index.js');

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
        unlockingScript.toString().should.contain(secret, "unlocking script should include the secret");
        unlockingScript.toString().should.contain(redeemScript.toHex(), "unlocking script should include redeem script");
        unlockingScript.toString().should.contain(signatureString, "unlocking script should contain the signature");
    });

    it("should return the secret", function() {
        let unlockingScript = new atomicSwap.UnlockingScript(secret, redeemScript, { signature: signature });
        unlockingScript.getSecret().should.equal(secret, "should return the secret");
    });

    it("should return the secret when constructed from hex", function() {
        let unlockingScript = atomicSwap.UnlockingScript.fromHex(
            '473044022039d660abc0c54afaf4e74067f863af70f018c5bc76f2ad9a7a82c4c1fc46aeac022052b38fbe872e815070efc794ce5387a4f10fb35e73229cc56c3db40997bdc25c012015df4318d14d4a42af3ec46f7d8aecd651b643f971968682194f69b99d8fb55a514c7363a820a3c9608a9e3fa42738e79d389d846118487d9e20b7ed25b513d082bf8b55d199882102c19818c96856bb3957a424120d441c2273744b60dbb213def1cbb35cdcca8d56ac6704600648b0b2752102ae786f9b1b5c363bb3b40902b2001fc3283965c735cdc68e55e11aabfb3ab53fac68'
            );
        unlockingScript.getSecret().should.equal('15df4318d14d4a42af3ec46f7d8aecd651b643f971968682194f69b99d8fb55a', "Should return the secret");
    })
});