const express = require('express');
const app = express();
let PORT = process.env.PORT || 3245;

// Attaching body parser in api route calls
app.use(bodyParser.json({ limit: deployConfig.get('maxRequestSize') }));
app.use(bodyParser.urlencoded({
    extended: false,
    limit: deployConfig.get("maxRequestSize")
}));

// Inititalize api routes
require("./routes")(app);

// initialize express server
app.listen(PORT);