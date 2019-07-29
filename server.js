require('dotenv').config();

const express = require('express');
const app = express();
let PORT = process.env.PORT || 3245;

// Attaching body parser in api route calls
const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: "15Mb" }));
app.use(bodyParser.urlencoded({
    extended: false,
    limit: "15Mb"
}));

// Inititalize mongodb for data store
var url = process.env.MONGO_DB_URL;
require("./db/config")(url);


// Inititalize api routes
require("./routes")(app);

//Error handling
app.use((err, req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(500).send(`Internal error.`);
    }
    res.status(500).send(err.stack);
})

// initialize express server
app.listen(PORT);
console.log("server listening on port ", PORT);