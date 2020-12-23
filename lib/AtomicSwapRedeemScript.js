'use strict';

const dashcore = require('@dashevo/dashcore-lib');
const Opcode = dashcore.Opcode;
const Script = dashcore.Script;

class AtomicSwapRedeemScript extends Script {

    constructor(secret_hash, swapPubKey, refundPubKey, locktimeHours) {

        var locktime = Math.floor(Date.now() / 1000 + locktimeHours * 60 * 60);

        super()
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
    }

    scriptAddress() {
        return dashcore.Address.payingTo(this, 'testnet');
    }
}

module.exports = AtomicSwapRedeemScript