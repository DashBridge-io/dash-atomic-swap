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
        let refundHours = parseInt($('#refund-time-hours').val());
        let refundTimeMinutes = parseInt($('#refund-time-minutes').val());
        refundHours += refundTimeMinutes / 60;
        redeemScript = new atomicSwap.RedeemScript(secretHash, initiatorPublicKeyString, participantPublicKeyString, refundHours);
        console.log('address: ' + redeemScript.scriptAddress('regtest'));
        $('#p2sh-address').html(redeemScript.scriptAddress('regtest').toString());
        $('#creation-message').fadeIn();
        $('#step-one').fadeOut();
    });

    $('#swap-funded').on('click', async function (e) {
        e.preventDefault();
        const txns = await getRawTxnsForAddress(redeemScript.scriptAddress('regtest'));
        const fundingTxn = findFundingTxn(txns);
        if (fundingTxn === undefined) {
            alert('Contract does not appear to have been funded yet.');
        } else {
            $('#creation-message').hide();
            $('#tx-inspection').show();
        }
    });

    $('#inpspect-txn').on('click', async function (e) {
        console.log('inspecting transaction');
        e.preventDefault();
        const txns = await getRawTxnsForAddress(redeemScript.scriptAddress('regtest'));
        const spendingTx = findSpendingTxn(txns);
        if (spendingTx === undefined) {
            alert('Funds have not yet been withdrawn');
        } else {
            const redeemTx = atomicSwap.RedeemTransaction.fromHex(spendingTx.hex);
            const secret = redeemTx.extractSecret();
            $('#secret-reveal').show();
            $('#secret').html(secret.toString());
        }
    });

    $('#refund').on('click', async function (e) {
        e.preventDefault();
        const toAddress = prompt("Address funds should be returned to?");
        const privKey = prompt("Enter your private key?");
        redeemScript.getFundingUTXOs(rpc).then(function (utxos) {
            if (utxos.length > 0) {
                const utxoInfo = utxos[0];
                createRefund(utxoInfo, privKey, toAddress).catch(function (err) {
                    if (err.message == "non-BIP68-final (code 64)") {
                        alert("Transaction is not yet eligible for a refund");
                    } else {
                        alert(`problem with refund ${JSON.stringify(err)}`);
                    }
                });
            } else {
                alert('No Funds Yet.');
            }
        });
    });

    async function createRefund(utxoInfo, privKey, toAddress) {
        console.log(`creating refund txn`);
        let rt = new atomicSwap.RefundTransaction(
            redeemScript.scriptAddress(),
            utxoInfo.txid,
            utxoInfo.outputIndex,
            utxoInfo.satoshis - 1000,
            toAddress,
            redeemScript
        ).sign(privKey);
        console.log(`created refund txn: ${JSON.stringify(rt)}`);
        return await rt.submitViaRPC(rpc);
    }

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

    function findFundingTxn(txns) {
        return txns.filter(
            txn => isFundingTxn(txn)
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