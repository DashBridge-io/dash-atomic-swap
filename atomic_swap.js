'use strict';

const dashcore = require('@dashevo/dashcore-lib');
const Address = dashcore.Address;
const Script = dashcore.Script;
const Opcode = dashcore.Opcode;

const { sha256 } = require('@dashevo/dashcore-lib/lib/crypto/hash');
var RpcClient = require('@dashevo/dashd-rpc/promise');

var config = {
    protocol: 'http',
    user: 'dashUser',
    pass: 'dashPass',
    host: '127.0.0.1',
    port: 19898  
};

function getSecret() {
    const secret = dashcore.crypto.Random.getRandomBuffer(32);
    const hash = sha256(secret);

    return {
      'secret': secret,
      'hash': hash
    }
}

const PublicKey = require('@dashevo/dashcore-lib/lib/publickey');
const AtomicSwapRedeemScript = require('./lib/AtomicSwapRedeemScript');
const AtomicSwapRedeemTransaction = require('./lib/AtomicSwapRedeemTransaction');
const PrivateKey = require('@dashevo/dashcore-lib/lib/privatekey');

(async function main() {
    var participantPubKeyString;
    var participantPubKey;
    var toAddress;
    var privKeyString;
    var privKey;
    var initiatorPubKeyString;
    var initiatorPubKey;
    var initiatorAddress;
    var initiatorPubKeyString;
    var fundingTxId;
    var fundingTxOutputIdx;

    var rpc = new RpcClient(config);

    await rpc.getnewaddress()
    .then(suc, fail);

    function suc(result) {
        console.log("The participant's address is: " + result.result);
        toAddress = result.result;
    }
      
    function fail(error) {
        console.error("Address failed. Is the config settings correct? - " + error);
    }

    //Now get public key

    await rpc.validateaddress(toAddress)
    .then(suc2, fail2);

    function suc2(result) {
        console.log("The participant's public key is: " + result.result.pubkey);
        participantPubKeyString = result.result.pubkey;
        participantPubKey = PublicKey(participantPubKeyString);
    }
      
    function fail2(error) {
        console.error("Public Key failed - " + error.error);
    }

    //Now get private key

    await rpc.dumpprivkey(toAddress)
    .then(suc3, fail3);

    function suc3(result) {
        console.log("The participant's private key is: " + result.result);
        privKeyString = result.result;
        privKey = PrivateKey.fromString(privKeyString);
    }
      
    function fail3(error) {
        console.error("Private Key failed - " + error.error);
    }

    //Now lets get all the information for the initiator

    await rpc.getnewaddress()
    .then(suc4, fail4);

    function suc4(result) {
        console.log("The initiator's address is: " + result.result);
        initiatorAddress = result.result;
    }
      
    function fail4(error) {
        console.error("Address failed. Is the config settings correct? - " + error.error);
    }

    //Now get public key

    await rpc.validateaddress(initiatorAddress)
    .then(suc5, fail5);

    function suc5(result) {
        console.log("The initiator's public key is: " + result.result.pubkey);
        initiatorPubKeyString = result.result.pubkey;
        initiatorPubKey = PublicKey(initiatorPubKeyString);
    }
      
    function fail5(error) {
        console.error("Public Key failed - " + error.error);
    }
    
    var secret = getSecret();
    console.log(secret);
    var redeemScr = new AtomicSwapRedeemScript(secret.hash, participantPubKey, initiatorPubKey, 24);

    var swapAddress = redeemScr.scriptAddress('testnet');
    console.log("\n\nScript Address: " + swapAddress);

    //Will change over to automated for testing

    await rpc.sendtoaddress(swapAddress, 10)
    .then(suc6, fail6);

    function suc6(result) {
        console.log("\n\nThe fundingTxID is: " + result.result);
        fundingTxId = result.result;
    }
      
    function fail6(error) {
        console.error("fundingTxID failed - " + JSON.stringify(error));
    }

    await rpc.getrawtransaction(fundingTxId, 1)
    .then(suc7, fail7);

    function suc7(result) {
        console.log("\n\nThe Index is: " + result.result.vout[0].n);
        fundingTxOutputIdx = result.result.vout[0].n;
    }
      
    function fail7(error) {
        console.error("getrawtransaction failed - " + error.error);
    }

    var redeemTx = new AtomicSwapRedeemTransaction(
        swapAddress, fundingTxId, fundingTxOutputIdx, 1000000000-500, toAddress, redeemScr
    ).setSecret(secret.secret)
     .sign(privKey, secret.secret);   

    console.log("Redeem TX: " + redeemTx);

    //Send the Transaaction
    await rpc.sendrawtransaction(redeemTx)
    .then(suc8, fail8);

    function suc8(result) {
        console.log("\n\nThe returned from the send transaction is: " + result.result);
    }
      
    function fail8(error) {
        console.error("Sendrawtransaction failed - " + JSON.stringify(error));
    }
})();
