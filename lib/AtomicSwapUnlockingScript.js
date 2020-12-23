'use strict';

const dashcore = require('@dashevo/dashcore-lib');
const Opcode = dashcore.Opcode;
const Script = dashcore.Script;

class AtomicSwapUnlockingScript extends Script {

    constructor(secret, redeemScript, signature) {
        var unlockingScript = Script()
            .add(signature.toBuffer())
            .add(Buffer.from(secret, 'hex'))
            .add(Opcode.OP_TRUE)
            .add(Buffer.from(redeemScript.toHex(), 'hex'));
        return unlockingScript;
    }

}

module.exports = AtomicSwapUnlockingScript