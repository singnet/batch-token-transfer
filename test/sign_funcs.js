var ethereumjsabi  = require('ethereumjs-abi');
var ethereumjsutil = require('ethereumjs-util');


function sleep(ms) 
{
  return new Promise(resolve => setTimeout(resolve, ms));
}


function signMessage(authorizerAccount, message, callback) 
{
    web3.eth.sign("0x" + message.toString("hex"),authorizerAccount,callback);
}


function signMessageFromAuthorizer(authorizerAccount, amount, tokenHolder, blockNumber, contractAddress, sourceAddress, callback)
{
    var sigPrefix = "__conversion";
    var message = ethereumjsabi.soliditySHA3(
        ["string", "uint256", "address", "uint256", "address", "bytes"],
        [sigPrefix, amount, tokenHolder, blockNumber, contractAddress, sourceAddress]);

    signMessage(authorizerAccount, message, callback);    

}


// this mimics the prefixing behavior of the ethSign JSON-RPC method.
function prefixed(hash) {
    return ethereumjsabi.soliditySHA3(
        ["string", "bytes32"],
        ["\x19Ethereum Signed Message:\n32", hash]
    );
}

function recoverSigner(message, signature) {
    var split = ethereumjsutil.fromRpcSig(signature);
    var publicKey = ethereumjsutil.ecrecover(message, split.v, split.r, split.s);

    var signer = ethereumjsutil.pubToAddress(publicKey).toString("hex");
    return signer;
}

function isValidSignatureClaim(contractAddress, channelId, nonce, amount, signature, expectedSigner) {
    var message = prefixed(composeClaimMessage(contractAddress, channelId, nonce, amount));
    var signer  = recoverSigner(message, signature);
    return signer.toLowerCase() ==
        ethereumjsutil.stripHexPrefix(expectedSigner).toLowerCase();
}

function getVRSFromSignature(signature) {
    signature = signature.substr(2); //remove 0x
    const r = '0x' + signature.slice(0, 64);
    const s = '0x' + signature.slice(64, 128);
    const v = '0x' + signature.slice(128, 130);    // Should be either 27 or 28
    const v_decimal =  web3.utils.toDecimal(v);
    const v_compute = (web3.utils.toDecimal(v) < 27 ) ? v_decimal + 27 : v_decimal ;

    return {
        v: v_compute,
        r: r,
        s: s
    };

}

async function waitSignedMessage(authorizerAccount, amount, tokenHolder, blockNumber, contractAddress, sourceAddress)
{
    let detWait = true;
    let rezSign;
    signMessageFromAuthorizer(authorizerAccount, amount, tokenHolder, blockNumber, contractAddress, sourceAddress, function(err,sgn)
        {   
            detWait = false;
            rezSign = sgn
        });
    while(detWait)
    {
        await sleep(1)
    }
    return rezSign;
} 

module.exports.waitSignedMessage   = waitSignedMessage;
module.exports.isValidSignatureClaim    = isValidSignatureClaim;
module.exports.getVRSFromSignature      = getVRSFromSignature; 
