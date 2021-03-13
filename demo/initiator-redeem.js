import * as atomicSwap from '../index.js';
var Buffer = require('buffer/').Buffer;
import RpcClient from '@dashevo/dashd-rpc/promise';
import Hash from '@dashevo/dashcore-lib/lib/crypto/hash';

$(function () {

    var config = {
        protocol: 'http',
        user: 'dashUser',
        pass: 'dashPass',
        host: 'localhost',
        port: 8080
    };

    const rpc = new RpcClient(config);
    let redeemScript = null;
    let utxoInfo = null

    $('#check-for-funds').on('click', async function(e) {
        e.preventDefault();
        let initiatorPublicKeyString = $('#initiator-public-key').val();
        let participantPublicKeyString = $('#participant-public-key').val();
        let secret = $('#secret').val();
        let secretHash = Hash.sha256(
            Buffer.from(secret)
        );
        redeemScript = new atomicSwap.RedeemScript(secretHash, initiatorPublicKeyString, participantPublicKeyString, 24);
        
        redeemScript.getFundingUTXOs(rpc).then(function(utxos) {
            if(utxos.length > 0) {
                utxoInfo = utxos[0];
                $('#funding-check').hide();
                $('#redeem').show();
                $('#funded-amount').html(utxoInfo.satoshis / 100000000);
            } else {
                alert('No Funds Yet.');
            }
        });
    });

    $('#redeem-button').on('click', async function (e) {
        e.preventDefault();
        await createTransaction();
    });

    async function createTransaction() {

        const toAddress = $('#pay-to-address').val();
        const privKey = $('#priv-key').val();
        let secret = $('#secret').val();

        let rt = new atomicSwap.RedeemTransaction(
            redeemScript.scriptAddress(),
            utxoInfo.txid,
            utxoInfo.outputIndex,
            utxoInfo.satoshis - 1000,
            toAddress,
            redeemScript
        ).setSecret(secret).sign(privKey); 
        
       await rt.submitViaRPC(rpc);
    }
});