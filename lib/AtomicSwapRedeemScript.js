'use strict';

import dashcore from '@dashevo/dashcore-lib';
const { Opcode, Script, PublicKey } = dashcore;

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

        super()
            .add(Opcode.OP_IF)
            .add(Opcode.OP_SHA256)
            .add(secret_hash)
            .add(Opcode.OP_EQUALVERIFY)
            .add(swapPubKey.toBuffer())
            .add(Opcode.OP_CHECKSIG)
            .add(Opcode.OP_ELSE)
            .add(Buffer.from(
                this.locktimeParam(locktimeHours).toString(16), 'hex')
            )
            .add(Opcode.OP_NOP3) //OP_NOP3 is now OP_CHECKSEQUENCEVERIFY https://github.com/dashevo/dashcore-lib/issues/204
            .add(Opcode.OP_DROP)
            .add(refundPubKey.toBuffer())
            .add(Opcode.OP_CHECKSIG)
            .add(Opcode.OP_ENDIF);
    }

    locktimeParam(hours) {
        let locktime = hours * 60 * 60; //seconds
        locktime = Math.floor(locktime / 512);
        locktime |= 0x400000; // set type flag
        return this.reverseEndian(locktime);
    }

    reverseEndian(x) {
        let buf = Buffer.allocUnsafe(3)
        buf.writeUIntLE(x, 0, 3)
        return buf.readUIntBE(0, 3)
    }

    /**
     * Returns the P2SH address of the Atomic Swap contract
     * @param {Network | String} Network where address is being created e.g. livenet, testnet, regtest 
     * @returns {Address}
     */
    scriptAddress(network = 'regtest') {
        return dashcore.Address.payingTo(this, network);
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