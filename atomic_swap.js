const dashcore = require('@dashevo/dashcore-lib');
const Address = require('@dashevo/dashcore-lib/lib/address');
const Script = require('@dashevo/dashcore-lib/lib/script');
const { sha256 } = require('@dashevo/dashcore-lib/lib/crypto/hash');
const Opcode = require('@dashevo/dashcore-lib/lib/opcode');

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
var cl = readln.createInterface( process.stdin, process.stdout );

var question = function(q) {
    return new Promise( (res, rej) => {
        cl.question( q, answer => {
            res(answer);
        })
    });
};

(async function main() {
    var participantPubKeyString = await question('\n\nParticipant Public Key? ');
    var participantPubKey = PublicKey(participantPubKeyString);
    var toAddress = await question("Participant Address? ");
    var privKeyString = await question("Participant private key? ");
    let privKey = PrivateKey.fromString(privKeyString);
    var initiatorPubKeyString = await question('Initiator Public Key? ');
    let initiatorPubKey = PublicKey(initiatorPubKeyString);
    
    var secret = getSecret();
    console.log(secret);
    var redeemScr = new AtomicSwapRedeemScript(secret.hash, participantPubKey, initiatorPubKey, 24);

    var swapAddress = redeemScr.scriptAddress();
    console.log("\n\nScript Address: " + swapAddress);
    
    var fundingTxId = await question("\n\nFunding Transaction ID? ");
    var fundingTxOutputIdx = await question("Funding Transaction Index? ");
    var fundingTxScriptPubKeyString = await question("Funding Transaction script pubKey Hex? ");
    let fundingTxScriptPubKey = Script.fromHex(fundingTxScriptPubKeyString);

    var redeemTx = new AtomicSwapRedeemTransaction(
        swapAddress, fundingTxId, fundingTxOutputIdx, 1000000000-500, toAddress
    )
    var sig = redeemTx.getSignature(privKey, fundingTxScriptPubKeyString);
    console.log("Signature: " + sig.toString());

    let unlockingScript = new AtomicSwapUnlockingScript(secret.secret, redeemScr, sig);
    redeemTx.inputs[0].setScript(unlockingScript);

    console.log("Redeem TX: " + redeemTx);
    
    cl.close();
})();


// var pubKeyParticipant = '032a90617b3d14645bb0db5ac303c87ff4953ea7ecb2403430dd81375a2d69aeac';
// // var pubKeyInitiator = '0315a66994d646c76278b2c4731448cfbe85c4b09d7fdc7f073246b4985409f1ce';


