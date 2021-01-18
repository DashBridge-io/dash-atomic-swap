'use strict';

const dashcore = require('@dashevo/dashcore-lib');
const BufferUtil = require('@dashevo/dashcore-lib/lib/util/buffer');
const Opcode = dashcore.Opcode;
const Script = dashcore.Script;
const Signature = dashcore.crypto.Signature;

class AtomicSwapUnlockingScript extends Script {

    /**
     * Create an unlocking script to spend from an Atomic Swap contract
     * @param {Buffer} secret Secret needed to unlock Atomic Swap contract  
     * @param {Script} redeemScript used to create Atomic Swap contract 
     * @param {TransactionSignature} signature Signature from spending transaction 
     */
    constructor(secret, redeemScript, signature) {

            var sigBuffer = BufferUtil.concat([
                signature.signature.toDER(), 
                BufferUtil.integerAsSingleByteBuffer(Signature.SIGHASH_ALL)
            ]);

        var unlockingScript = Script()
                                .add(sigBuffer)
                                .add(Buffer.from(secret, 'hex'))
                                .add(Opcode.OP_TRUE)
                                .add(Buffer.from(redeemScript.toHex(), 'hex'));
        return unlockingScript;
    }

}

module.exports = AtomicSwapUnlockingScript