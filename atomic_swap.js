const dashcore = require('@dashevo/dashcore-lib');
const Address = require('@dashevo/dashcore-lib/lib/address');
const Script = require('@dashevo/dashcore-lib/lib/script');
const { sha256 } = require('@dashevo/dashcore-lib/lib/crypto/hash');
const Opcode = require('@dashevo/dashcore-lib/lib/opcode');
var RpcClient = require('@dashevo/dashd-rpc/promise');

var config = {
    protocol: 'http',
    user: 'dashUser',
    pass: 'dashPass',
    host: '127.0.0.1',
    port: 19898  
};

function getSecret() {
    secret = dashcore.crypto.Random.getRandomBuffer(32);
    const hash = sha256(secret);

    return {
      'secret': secret,
      'hash': hash
    }
}

var readln = require('readline');
const PublicKey = require('@dashevo/dashcore-lib/lib/publickey');
const AtomicSwapRedeemScript = require('./lib/AtomicSwapRedeemScript');
const AtomicSwapRedeemTransaction = require('./lib/AtomicSwapRedeemTransaction');
const PrivateKey = require('@dashevo/dashcore-lib/lib/privatekey');
const AtomicSwapUnlockingScript = require('./lib/AtomicSwapUnlockingScript');

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
    var fundingTxScriptPubKeyString;
    var fundingTxScriptPubKey;


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

    var swapAddress = redeemScr.scriptAddress();
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
        console.log("\n\n The Index is: " + result.result.vout[0].n);
        console.log("\n\n The pubkey script hex is: " + result.result.hex + "\n\n");
        fundingTxOutputIdx = result.result.vout[0].n;
        fundingTxScriptPubKeyString = result.result.hex;
        fundingTxScriptPubKey = Script.fromHex(fundingTxScriptPubKeyString);
    }
      
    function fail7(error) {
        console.error("getrawtransaction failed - " + error.error);
    }

    var redeemTx = new AtomicSwapRedeemTransaction(
        swapAddress, fundingTxId, fundingTxOutputIdx, 1000000000-500, toAddress
    )
    var sig = redeemTx.getSignature(privKey, fundingTxScriptPubKeyString);
    console.log("Signature: " + sig.toString());

    let unlockingScript = new AtomicSwapUnlockingScript(secret.secret, redeemScr, sig);
    redeemTx.inputs[0].setScript(unlockingScript);

    console.log("Redeem TX: " + redeemTx);


    //Send the Transaaction

    await rpc.sendrawtransaction(redeemTx)
    .then(suc8, fail8);

    function suc8(result) {
        console.log("\n\n The returned from the send transaction is: " + result.result);
    }
      
    function fail8(error) {
        console.error("Sendrawtransaction failed - " + JSON.stringify(error));
    }
})();


// var pubKeyParticipant = '032a90617b3d14645bb0db5ac303c87ff4953ea7ecb2403430dd81375a2d69aeac';
// // var pubKeyInitiator = '0315a66994d646c76278b2c4731448cfbe85c4b09d7fdc7f073246b4985409f1ce';


