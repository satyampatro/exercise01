module.exports = function (router) {
    // user transaction apis
    require("./api/tx.api")(router);
}