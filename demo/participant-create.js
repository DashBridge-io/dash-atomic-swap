import * as atomicSwap from '../index.js';
import RpcClient from '@dashevo/dashd-rpc/promise';
import Transaction from '@dashevo/dashcore-lib/lib/transaction';
var Buffer = require('buffer/').Buffer;

$(document).ready(function () {

    var config = {
        protocol: 'http',
        user: 'dashUser',
        pass: 'dashPass',
        host: 'localhost',
        port: 8080
    };

    var rpc = new RpcClient(config);

    let redeemScript;

    $('#create-participant-contract').on('click', function (e) {
        e.preventDefault();
        let initiatorPublicKeyString = $('#initiator-public-key').val();
        let participantPublicKeyString = $('#participant-public-key').val();
        let secretHash = $('#secret-hash').val();
        redeemScript = new atomicSwap.RedeemScript(secretHash, initiatorPublicKeyString, participantPublicKeyString, 24);
        console.log('address: ' + redeemScript.scriptAddress('regtest'));
        $('#p2sh-address').html(redeemScript.scriptAddress('regtest').toString());
        $('#creation-message').fadeIn();
        $('#step-one').fadeOut();
    });

    $('#swap-funded').on('click', function (e) {
        e.preventDefault();
        $('#creation-message').hide();
        $('#tx-inspection').show();
    });

    $('#tx-inspection').on('click', async function (e) {
        e.preventDefault();
        const txns = await getRawTxnsForAddress(redeemScript.scriptAddress('regtest'));
        const spendingTx = findSpendingTxn(txns);
        if(spendingTx === undefined) {
            alert('Funds have not yet been withdrawn');
        } else {
            const redeemTx = atomicSwap.RedeemTransaction.fromHex(spendingTx.hex);
            const secret = redeemTx.extractSecret();
            $('#secret-reveal').show();
            $('#secret').html(secret.toString());
        }
    });

    async function getTxnIDsForAddress(address) {
        const resp = await rpc.getaddresstxids({ addresses: [address.toString()] });
        return resp.result;
    }

    async function getRawTxnsForAddress(address) {
        const txIDs = await getTxnIDsForAddress(address);
        const txns = txIDs.map(async function (txID) {
            return await getRawTransaction(txID)
        });
        return await Promise.all(txns);
    }

    async function getRawTransaction(txid) {
        const res = await rpc.getrawtransaction(txid, 1);
        return res.result;
    }

    function findSpendingTxn(txns) {
        return txns.filter(
            txn => !isFundingTxn(txn)
        )[0];
    }

    function isFundingTxn(txn) {
        const fundingOutput = txn.vout.find(
            output => output.scriptPubKey.addresses.includes(
                redeemScript.scriptAddress('regtest').toString()
            )
        );
        return fundingOutput != undefined;
    }

});   