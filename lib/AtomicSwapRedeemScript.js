'use strict';

const dashcore = require('@dashevo/dashcore-lib');
const Opcode = dashcore.Opcode;
const Script = dashcore.Script;
const PublicKey = dashcore.PublicKey;

/**
 * Class representing the redeem script for an atomic swap contract 
 */
class AtomicSwapRedeemScript extends Script {

    /**
     * Create a redeem script for an Atomic Swap contract
     * @param {Buffer | String} secret_hash A buffer or hex string containing secret that will unlock the funds in the contract 
     * @param {PublicKey | String} swapPubKey Public key of the contract payee 
     * @param {PublicKey | String} refundPubKey Public key of the contract funder
     * @param {number} locktimeHours The number of hours before a refund can be initiated
     */
    constructor(secret_hash, swapPubKey, refundPubKey, locktimeHours) {

        refundPubKey = PublicKey(refundPubKey);
        swapPubKey = PublicKey(swapPubKey);
        secret_hash = Buffer.from(secret_hash, 'hex');

        const locktime = Math.floor(Date.now() / 1000 + locktimeHours * 60 * 60);
        super()
            .add(Opcode.OP_IF)
            .add(Opcode.OP_SHA256)
            .add(secret_hash)
            .add(Opcode.OP_EQUALVERIFY)
            .add(swapPubKey.toBuffer())
            .add(Opcode.OP_CHECKSIG)
            .add(Opcode.OP_ELSE)
            .add(Buffer.from(locktime.toString(16), 'hex'))
            .add(Opcode.OP_NOP3) //OP_NOP3 is now OP_CHECKSEQUENCEVERIFY https://github.com/dashevo/dashcore-lib/issues/204
            .add(Opcode.OP_DROP)
            .add(refundPubKey.toBuffer())
            .add(Opcode.OP_CHECKSIG)
            .add(Opcode.OP_ENDIF);
    }

    /**
     * Returns the P2SH address on the Atomic Swap contract
     * @param {Network | String} Network where address is being created e.g. livenet, testnet, regtest 
     * @returns {Address}
     */
    scriptAddress(network) {
        return dashcore.Address.payingTo(this, network);
    }
}

module.exports = AtomicSwapRedeemScript