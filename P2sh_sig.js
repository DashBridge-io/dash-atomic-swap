const Opcode = require('@dashevo/dashcore-lib/lib/opcode');
const dashcore = require('@dashevo/dashcore-lib');

var publicKey = dashcore.PublicKey('032a90617b3d14645bb0db5acc83037ff4953ea7ecb2403430dd81375a2d69aeac');                            

var redeemScript = dashcore.Script()
                        .add(Opcode.OP_5)
                        .add(Opcode.OP_EQUAL)
                        .add(publicKey.toBuffer()) 
                        .add(Opcode.OP_CHECKSIG) 

var address = dashcore.Address.payingTo(redeemScript, 'testnet');
console.log(address.toString());
console.log("sc: " + redeemScript.toHex());

var unlockingScript = dashcore.Script()
                            .add(Opcode.OP_0)
                            .add(Opcode.OP_5)
                            .add(Buffer.from(redeemScript.toHex(), 'hex'));
                            
                            
var output = {
        address: address,
        prevTxId: 'e3057a11450cdb354a3a7c6ba2ac8876af85c17e2e2dff1805091f1b9e441886',
        outputIndex: 0,
        script: unlockingScript,
        satoshis: 1000000000
      };

var input = dashcore.Transaction.Input(output);
var transaction = new dashcore.Transaction()
      .uncheckedAddInput(input)
      .to('yiAsS8X9xBx8oGm7vgwca9ve5nLh3rMH3e', 999999000);
console.log(transaction);

// transaction.getSignatures('cUstHm2KaHLXsqcVmq3eKkSs4258WCaHByvqMMmNVjrcFWCWWkCb')

// tx = dashcore.Transaction('03000000018618449e1b1f090518ff2d2e7ec185af7688aca26b7c3a4a35db0c45117a05e30000000028005525558721032a90617b3d14645bb0db5acc83037ff4953ea7ecb2403430dd81375a2d69aeacacffffffff0118c69a3b000000001976a914efb38bcb860f3704cadab10947be89b7b24de70a88ac00000000')
// tx.getSignatures('cUstHm2KaHLXsqcVmq3eKkSs4258WCaHByvqMMmNVjrcFWCWWkCb')

