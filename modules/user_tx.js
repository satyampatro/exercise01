const Web3 = require('web3');
const rpcURL = process.env.KOVAN_TESTNET_ENDPOINT;
const web3 = new Web3(new Web3.providers.HttpProvider(rpcURL))
const ObjectId = require("mongodb").ObjectID;

exports.getUserTransactions = async function (address, pageOptions) {
    // Get user transactions
    const db = mongo.db(process.env.DB_NAME);
    let result = await db.collection('transactions')
        .find({
            "$or": [
                { "from": address },
                { "to": address },
            ]
        })
        .sort({ 'blockNumber': -1 })
        .skip(pageOptions.limit * (pageOptions.page - 1))
        .limit(pageOptions.limit)
        .toArray();


    return result;
}

let saveTransactions = function (db, blockNumber) {
    return new Promise(async (resolve, reject) => {
        try {
            // get block from block number
            let block = await web3.eth.getBlock(blockNumber);

            // create an entry of block
            if (!block) {
                resolve(false);
                return
            }
            let blockId = (await db.collection('blocks').insertOne(block, { safe: true })).insertedId;

            // save transactions of that block
            block.transactions.forEach(async tx => {
                try {
                    let txData = await web3.eth.getTransactionReceipt(tx);
                    let objToSave = {
                        blockId: ObjectId(blockId),
                        from: txData.from,
                        to: txData.to,
                        blockNumber: txData.blockNumber,
                        transactionHash: txData.transactionHash
                    }

                    // creating an entry of transaction
                    await db.collection('transactions').insertOne(objToSave, { safe: true })
                } catch (e) {
                    console.error(e)
                    reject(e);
                    return;
                }
            });
            resolve(true);
        } catch (e) {
            console.error("Save transaction", blockNumber, e)
            reject(e);
        }
    })
}

let deleteOldRecords = function () {
    return new Promise(async (resolve, reject) => {
        try {
            // Db instance
            const db = mongo.db(process.env.DB_NAME);

            // Push ids of block to remove
            let result = await db.collection('blocks').find({}, { _id: 1 })
                .sort({ number: -1 })
                .skip(10000)
                .toArray()

            let removeBlockIdsArray = result.map(function (doc) { return doc._id; });

            // Remove blocks
            await db.collection('blocks').deleteMany({ "_id": { "$in": removeBlockIdsArray } });

            // Remove transactions of those blocks
            removeBlockIdsArray.forEach((blockId) => {
                db.collection('transactions').deleteOne({ blockId: blockId }).catch((e) => {
                    console.error(e);
                })
            })

            resolve();
        } catch (e) {
            reject(e);
        }
    })
}


exports.storeRecentBlocks = async function () {
    try {
        console.debug("Storing blocks...");
        let latest = await web3.eth.getBlockNumber();
        // create mongo db instance
        const db = mongo.db(process.env.DB_NAME);

        //get last stored block number from mongodb
        let result = await db.collection('blocks').find({}).sort({ "number": -1 }).limit(1).toArray();
        let lastStoredBlock = result.length > 0 ? result[0].number : 0;


        // let saveTxPromises = [];
        let chunkPromises = [];
        for (let i = 0; i < 10000; i++) {
            let block = latest - i;
            if (block > lastStoredBlock) {
                if (chunkPromises.length > 100) {
                    await Promise.all(chunkPromises);
                    chunkPromises = [];
                }
                chunkPromises.push(saveTransactions(db, block));
            }
        }

        // Clean up old records to maintain 10,000 recent blocks
        deleteOldRecords().catch((e) => { console.error(e) });
        return;
    } catch (e) {
        console.error(e)
        throw e;
    }
}