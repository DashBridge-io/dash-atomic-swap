'use strict';

import dashcore from '@dashevo/dashcore-lib';
import { AtomicSwapUnlockingScript } from './AtomicSwapUnlockingScript.js';
import { AtomicSwapRefundUnlockingScript } from './AtomicSwapRefundUnlockingScript.js';
const Sighash = dashcore.Transaction.Sighash;
const Signature = dashcore.crypto.Signature;
const TransactionSignature = dashcore.Transaction.Signature;

class AtomicSwapInput extends dashcore.Transaction.Input {

    constructor(swap_address, fundingTxId, fundingTxOutputIndex, amount, redeemScript) {
        var output = {
            address: swap_address,
            prevTxId: fundingTxId,
            outputIndex: fundingTxOutputIndex,
            script: redeemScript,
            satoshis: amount
        };
        super(output);
        this.redeemScript = redeemScript;
        this.secret = null;
    }

    setSecret(secret) {
        this.secret = secret;
        return this;
    }

    extractSecret() {
        return this.script.getSecret();
    }

    addSignature(transaction, signature) {
        const unlockingScript = this.secret === null ? 
            new AtomicSwapRefundUnlockingScript(this.redeemScript, signature) 
            :
            new AtomicSwapUnlockingScript(this.secret, this.redeemScript, signature);
        this.setScript(unlockingScript);
        return this;
    }

    getSignatures(transaction, privateKey, index) {
        return [new TransactionSignature({
            publicKey: privateKey.publicKey,
            prevTxId: this.prevTxId,
            outputIndex: this.outputIndex,
            inputIndex: index,
            signature: this.getSignature(transaction, privateKey),
            sigtype: Signature.SIGHASH_ALL
          })];
    }

    getSignature(transaction, privateKey) {
        let sig = Sighash.sign(
            transaction,
            privateKey,
            Signature.SIGHASH_ALL,
            0, // only one input to sign
            this.script
        )
        return sig;
    }

}

export { AtomicSwapInput }