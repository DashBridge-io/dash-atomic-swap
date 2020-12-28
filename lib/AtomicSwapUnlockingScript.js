'use strict';

const dashcore = require('@dashevo/dashcore-lib');
const BufferUtil = require('@dashevo/dashcore-lib/lib/util/buffer');
const Opcode = dashcore.Opcode;
const Script = dashcore.Script;
const Signature = dashcore.crypto.Signature;

class AtomicSwapUnlockingScript extends Script {

    constructor(secret, redeemScript, signature) {

            var sigBuffer = BufferUtil.concat([
                signature.toDER(), 
                BufferUtil.integerAsSingleByteBuffer(Signature.SIGHASH_ALL)
            ]
            );


        var unlockingScript = Script()
            .add(sigBuffer)
            .add(Buffer.from(secret, 'hex'))
            .add(Opcode.OP_TRUE)
            .add(Buffer.from(redeemScript.toHex(), 'hex'));
        return unlockingScript;
    }

}

module.exports = AtomicSwapUnlockingScript