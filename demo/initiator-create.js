$(function () {

    var contract;
    try {
        ethereum.enable();
    } catch (e) { console.log("FAILED TO ACTIVATE ETHEREUM"); }

    try {
        web3 = new Web3(web3.currentProvider);
    } catch (e) { console.log("FAILED TO ACTIVATE WEB3"); return; }

    var adr = "0xF0a80f8174E7c6283A64ea55153b8851B843eea0";
    var abi =[
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_secret",
                    "type": "string"
                },
                {
                    "name": "_hashedSecret",
                    "type": "bytes32"
                }
            ],
            "name": "redeem",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_hashedSecret",
                    "type": "bytes32"
                }
            ],
            "name": "status",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                },
                {
                    "name": "",
                    "type": "int256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_hashedSecret",
                    "type": "bytes32"
                }
            ],
            "name": "refund",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_refundTime",
                    "type": "uint256"
                },
                {
                    "name": "_hashedSecret",
                    "type": "bytes32"
                },
                {
                    "name": "_participant",
                    "type": "address"
                }
            ],
            "name": "initiate",
            "outputs": [],
            "payable": true,
            "stateMutability": "payable",
            "type": "function"
        }
    ]

    contract = new web3.eth.Contract(abi, adr);
    var _refundTime; // did this so the error messages can debug information.
    var _secret;
    var _participant;
    var _givenValue;
    var _hashedSecret;

    $('#initiate').click(function (e) {
        e.preventDefault();
        web3.eth.getAccounts().then(function (accounts) {
            console.log(accounts);
            _refundTime = $('#refund-time').val();
            const hours = $('#refund-time-hours').val();
            const minutes = $('#refund-time-minutes').val();
            _refundTime = (hours * 60 * 60) + (minutes * 60); 
            _secret = $('#secret').val();
            _participant = $('#participant-address').val();
            _givenValue = $('#swap-amount').val();
            _givenValue = web3.utils.toWei(_givenValue, "ether"); // Convert the value of Ether entered to Wei for the transaction
            console.log(`sending ${_givenValue} Wei to contract`);
            _hashedSecret = sha256(_secret);
            $('#secret-hash').html(_hashedSecret);
            console.log("The Hashed Secret is: " + _hashedSecret);
            $('#status-div').show();
            return contract.methods.initiate(_refundTime, "0x" + _hashedSecret, _participant).send({ from: accounts[0], value: _givenValue });
        }).then(function (tx) {
            $('#status-div').hide();
            $('#completion-div').show();
            console.log(tx);
        }).catch(function (tx) {
            $('#error-div').show();
            if (_secret == null) {
                _secret = "Not Given";
            }
            if (_hashedSecret == null) {
                _hashedSecret = "Failed to be calculated";
            }
            if (_refundTime == null) {
                _refundTime = "Failed to be calculated";
            }
            if (_givenValue == null) {
                _givenValue = "Failed to be calculated";
            }
            if (_participant == null) {
                _participant = "Not Given";
            }
            console.log("Initiator error log : The secret was: " + _secret + " The hash was: " + "0x" + _hashedSecret + " The refund time in seconds is: " + _refundTime + " The value wanted to send (in Wei) is: " + _givenValue + " The participant is: " + _participant);
            console.log(tx);
        });
    });

    $('#refund').click(function (e) {
        e.preventDefault();
        web3.eth.getAccounts().then(function (accounts) {
            console.log(accounts);
            _secret = $("#secret").val();
            _hashedSecret = sha256(_secret);
            return contract.methods.status("0x" + _hashedSecret).call({}).then( function(result) {
                const [value, timeUntilRefundable] = [result[0], result[1]] 
                if(timeUntilRefundable > 0) {
                    alert(`Contract cannot be refunded for ${timeUntilRefundable} seconds.`);
                    return;
                } else {
                    contract.methods.refund("0x" + _hashedSecret).send({ from: accounts[0] }).then(function(tx){
                        console.log(`Refund transaction ${tx} `);
                        alert("refund transaction submitteed successfully");
                    }).catch(function(error){
                        console.log(`Refund error: ${error}`);
                    })
                }
            });
        });
    });
});