'use strict';

const dashcore = require('@dashevo/dashcore-lib');
const Opcode = require('@dashevo/dashcore-lib/lib/opcode');
const { RedeemScript } = require('..');
const AtomicSwapInput = require('./AtomicSwapInput');
const AtomicSwapUnlockingScript = require('./AtomicSwapUnlockingScript');
const Transaction = dashcore.Transaction;

class AtomicSwapRedeemTransaction extends Transaction {

    constructor(swap_address, fundingTxId, fundingTxOutputIndex, amount, toAddress, redeemScript) {

        let input = new AtomicSwapInput(swap_address, fundingTxId, fundingTxOutputIndex, amount, redeemScript);

        super()
            .uncheckedAddInput(input)
            .to(toAddress, amount); //TODO calculate fee
    }

    setSecret(secret) {
        this.inputs[0].setSecret(secret);
        return this;
    }

    canHaveNoUtxo() {
        return true; //TODO this is a temporary workaround
    }
}

module.exports = AtomicSwapRedeemTransaction