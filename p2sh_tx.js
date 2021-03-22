const { Opcode } = require('@dashevo/dashcore-lib');
const dashcore = require('dashcore-lib');
const { Input } = require('dashcore-lib/lib/transaction');


var script = dashcore.Script.fromString('OP_2 OP_EQUAL');
var scriptLength = script.toBuffer().length;
// var unlockingScript = dashcore.Script.fromString(
//     'OP_3 ' + scriptLength + ' 0x' + script.toHex() 
// );
var unlockingScript = dashcore.Script().add(Opcode.OP_3).add(Buffer.from(script.toHex(), 'hex'));

console.log(unlockingScript.toHex());

var redeemScript = dashcore.Script.buildScriptHashOut(script);
// console.log("RS: " + redeemScript.toHex());

var output = {
    address: '8nrtzFk4y1t9sL15GzbwFK9DYuiEpTtAzA',
    prevTxId: '385bb867e295b80645cad37149982b2b94add3c398da6cde49b05e0759c1980f',
    outputIndex: 0,
    script: unlockingScript,
    satoshis: 1000000000
  };

  var input = dashcore.Transaction.Input(output);

  var transaction = new dashcore.Transaction()
        .uncheckedAddInput(input)
        .to('yiAsS8X9xBx8oGm7vgwca9ve5nLh3rMH3e', 999999000);

  console.log(transaction);