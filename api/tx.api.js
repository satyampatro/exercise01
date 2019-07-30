const transactionsModule = require("../modules/user_tx")

module.exports = function (router) {
    // Construct an API to retrieve the user transactions, given the user address.
    router.post("/user_txs", async function (req, res) {
        try {
            let userAddress = req.body.address;
            let pageSize = req.body.pageSize;
            let pageNumber = req.body.pageNumber;
            let pageOptions = {
                page: parseInt(pageNumber),
                limit: parseInt(pageSize),
                count: 10000
            }

            let transactions = await transactionsModule.getUserTransactions(userAddress, pageOptions);
            res.json({
                success: true,
                data: transactions,
                pagination: pageOptions
            })
        } catch (e) {
            console.error(e.stack);
            res.status(500).send(e.stack)
        }
    });


    // Util api to store recent blocks
    router.post("/save_recent_blocks", async function (req, res) {
        transactionsModule.storeRecentBlocks().catch((e) => {
            console.error(e);
        })
        res.end()
    });

    return router;
}