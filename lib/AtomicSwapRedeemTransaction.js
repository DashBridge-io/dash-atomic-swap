'use strict';

const dashcore = require('@dashevo/dashcore-lib');
const Opcode = require('@dashevo/dashcore-lib/lib/opcode');
const Transaction = dashcore.Transaction;
const Sighash = Transaction.Sighash;
const Signature = dashcore.crypto.Signature;

class AtomicSwapRedeemTransaction extends Transaction {

    constructor(swap_address, fundingTxId, fundingTxOutputIndex, amount, toAddress) {

        var output = {
            address: swap_address,
            prevTxId: fundingTxId,
            outputIndex: fundingTxOutputIndex,
            script: dashcore.Script(),
            satoshis: amount
        };

        var input = dashcore.Transaction.Input(output);

        super()
            .uncheckedAddInput(input)
            .to(toAddress, amount); //TODO calculate fee
    }

    getSignature(privateKey, tempScriptSig) {
        let sig = Sighash.sign(
            this,
            privateKey,
            Signature.SIGHASH_ALL,
            0, // only one input to sign
            tempScriptSig
        )
        return sig;
    }

}

module.exports = AtomicSwapRedeemTransaction