'use strict';

import dashcore from '@dashevo/dashcore-lib';
const { Opcode, Script, PublicKey, Networks } = dashcore;

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
    constructor(secret_hash, swapPubKey, refundPubKey, locktimeHours, network=Networks.livenet) {
        super();
        refundPubKey = PublicKey(refundPubKey);
        swapPubKey = PublicKey(swapPubKey);
        secret_hash = Buffer.from(secret_hash, 'hex');
        this.locktimeHours = locktimeHours;
        this.network = network;

        this
            .add(Opcode.OP_IF)
            .add(Opcode.OP_SHA256)
            .add(secret_hash)
            .add(Opcode.OP_EQUALVERIFY)
            .add(swapPubKey.toBuffer())
            .add(Opcode.OP_CHECKSIG)
            .add(Opcode.OP_ELSE)
            .add(this.locktimeBuffer())
            .add(Opcode.OP_CHECKSEQUENCEVERIFY) 
            .add(Opcode.OP_DROP)
            .add(refundPubKey.toBuffer())
            .add(Opcode.OP_CHECKSIG)
            .add(Opcode.OP_ENDIF);
    }

    locktime() {
        let locktime = this.locktimeHours * 60 * 60; //seconds
        locktime = Math.floor(locktime / 512);
        locktime |= 0x400000; // set type flag
        return locktime;
    }

    locktimeBuffer() {
        let buf = Buffer.allocUnsafe(3)
        buf.writeUIntLE(this.locktime(), 0, 3)
        return buf
    }

    /**
     * Returns the P2SH address of the Atomic Swap contract
     * @param {Network | String} Network where address is being created e.g. livenet, testnet, regtest 
     * @returns {Address}
     */
    scriptAddress() {
        return dashcore.Address.payingTo(this, this.network);
    }

    async getFundingUTXOs(rpcClient) {
        let response = await rpcClient.getaddressutxos(
            {
                addresses: [this.scriptAddress().toString()]
            }
        );
        return response.result;
    }
}

export { AtomicSwapRedeemScript }