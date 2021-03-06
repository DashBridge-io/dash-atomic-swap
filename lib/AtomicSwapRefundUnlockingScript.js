'use strict';

import dashcore from '@dashevo/dashcore-lib';
const { script } = dashcore;
import BufferUtil from '@dashevo/dashcore-lib/lib/util/buffer.js';
const Opcode = dashcore.Opcode;
const Script = dashcore.Script;
const Signature = dashcore.crypto.Signature;

class AtomicSwapRefundUnlockingScript extends Script {

    /**
     * Create an unlocking script to refund from an Atomic Swap contract 
     * @param {Script} redeemScript used to create Atomic Swap contract 
     * @param {TransactionSignature} signature Signature from spending transaction 
     */
    constructor(redeemScript, signature) {

        var sigBuffer = BufferUtil.concat([
            signature.signature.toDER(),
            BufferUtil.integerAsSingleByteBuffer(Signature.SIGHASH_ALL)
        ]);

        var unlockingScript = super()
            .add(sigBuffer)
            .add(Opcode.OP_FALSE)
            .add(Buffer.from(redeemScript.toHex(), 'hex'));
        return unlockingScript;
    }

    /**
     * Returns the secret used to unlock the transaction
     * @returns {String} The secret as a hex string
     */
    getSecret() {
        return this.chunks[1].buf;
    }

    /**
     * Deserialize an atomic swap unlocking script from hex
     * @param {String} hex Hex encoded string    
     */
    static fromHex(hex) {
        let script = super.fromHex(hex);
        Object.setPrototypeOf(script, AtomicSwapRefundUnlockingScript.prototype);
        return script;
    }

}

export { AtomicSwapRefundUnlockingScript }