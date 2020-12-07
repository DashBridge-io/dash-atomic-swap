const dashcore = require('@dashevo/dashcore-lib');
const Address = require('@dashevo/dashcore-lib/lib/address');
const Script = require('@dashevo/dashcore-lib/lib/script');
const { sha256 } = require('@dashevo/dashcore-lib/lib/crypto/hash');
const Opcode = require('@dashevo/dashcore-lib/lib/opcode');

function scriptAddress(script) {
    return dashcore.Address.payingTo(script, 'testnet');
}

function swapUnlockingScript(secret, redeemScript) {
    var unlockingScript = Script().add(Opcode.OP_0)
        .add(Buffer.from(secret, 'hex'))
        .add(Opcode.OP_TRUE)
        .add(Buffer.from(redeemScript.toHex(), 'hex'));
    return unlockingScript;
}

function redeemScript(secret_hash, swapPubKey, refundPubKey, locktimeHours) {
    var locktime = Math.floor(Date.now() / 1000 + locktimeHours * 60 * 60);
    var script = Script()
        .add(Opcode.OP_IF)
        .add(Opcode.OP_SHA256)
        .add(Buffer.from(secret_hash, 'hex'))
        .add(Opcode.OP_EQUALVERIFY)
        .add(swapPubKey.toBuffer())
        .add(Opcode.OP_CHECKSIG)
        .add(Opcode.OP_ELSE)
        .add(Buffer.from(locktime.toString(16), 'hex'))
        .add(Opcode.OP_NOP3) //OP_NOP3 is now OP_CHECKSEQUENCEVERIFY
        .add(Opcode.OP_DROP)
        .add(refundPubKey.toBuffer())
        .add(Opcode.OP_CHECKSIG)
        .add(Opcode.OP_ENDIF);
    return script;
}

function swapRedeemTranaction(swap_address, fundingTxId, fundingTxOutputIndex, unlockingScript, amount, toAddress) {
    var output = {
        address: swap_address,
        prevTxId: fundingTxId,
        outputIndex: fundingTxOutputIndex,
        script: unlockingScript,
        satoshis: amount
    };

    var input = dashcore.Transaction.Input(output);

    var transaction = new dashcore.Transaction()
        .uncheckedAddInput(input)
        .to(toAddress, amount); //TODO calculate fee
    return transaction
}

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
    var privKey = await question("Participant private key? ");
    var initiatorPubKeyString = await question('Initiator Public Key? ');
    var initiatorPubKey = PublicKey(initiatorPubKeyString);
    
    var secret = getSecret();
    var redeemScr = redeemScript(secret.hash, participantPubKey, initiatorPubKey, 24);

    var swapAddress = scriptAddress(redeemScr);
    console.log("\n\nScript Address: " + swapAddress);
    
    var fundingTxId = await question("\n\nFunding Transaction ID? ");
    var fundingTxOutputIdx = await question("Funding Transaction Index? ");

    var unlockingScript = swapUnlockingScript(secret.secret, redeemScr);  

    var redeemTx = swapRedeemTranaction(
        swapAddress, fundingTxId, fundingTxOutputIdx, unlockingScript, 10000, toAddress
    )

    console.log(redeemTx);

    var sig = redeemTx.getSignatures(privKey);
    console.log(sig);

    console.log("Redeem TX: " + redeemTx);
    
    cl.close();
})();


// var pubKeyParticipant = '032a90617b3d14645bb0db5acc83037ff4953ea7ecb2403430dd81375a2d69aeac';
// // var pubKeyInitiator = '0315a66994d646c76278b2c4731448cfbe85c4b09d7fdc7f073246b4985409f1ce';


