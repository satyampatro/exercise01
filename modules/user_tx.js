const Web3 = require('web3');
let rpcURL = process.env.kovanTestnetEndpoint;
const web3 = new Web3(rpcURL)
let ObjectId = require("mongodb").ObjectID;

exports.getUserTransactions = async function (address, pageOptions) {
    // Get user transactions

    // pseudocode -
    // sort by block number -1 and get tx by $or [from, to];
    return result;
}

exports.storeRecentBlocks = async function () {
    try {
        let latest = await web3.eth.getBlockNumber();
        // create mongo db instance
        let db = mongo.db('tx_history');

        //get last stored block number from mongodb
        let result = await db.collection('blocks').find({}).sort({ "number": -1 }).limit(1).toArray();
        let lastStoredBlock = result.length > 0 ? result[0].number : 0;

        console.debug("start", new Date());
        for (let i = 0; i < 10000; i++) {
            let block = latest - i;
            if (block > lastStoredBlock) {
                console.log(block, lastStoredBlock, block > lastStoredBlock)
                saveTransactions(db, block).catch((e) => { throw e });
            }
        }
        console.debug("end", new Date());
        return;
    } catch (e) {
        throw e;
    }
}


let saveTransactions = function (db, blockNumber) {
    return new Promise(async (resolve, reject) => {
        try {
            // get block from block number
            let block = await web3.eth.getBlock(blockNumber);

            // create an entry of block
            let blockId = (await db.collection('blocks').insertOne(block, { safe: true })).insertedId;

            //TODO: Need to add a logic to maintain 10,000 recent blocks 
            // in mongo

            // save transactions of that block
            block.transactions.forEach(async tx => {
                let txData = await web3.eth.getTransactionReceipt(tx);
                let objToSave = {
                    blockId: ObjectId(blockId),
                    from: txData.from,
                    to: txData.to,
                    blockNumber: txData.blockNumber,
                    transactionHash: txData.transactionHash
                }

                // save in mongodb
                db.collection('transactions').insertOne(objToSave, { safe: true })
                    .catch(e => console.error(e))
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    })
}