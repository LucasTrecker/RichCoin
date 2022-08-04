const express = require('expressconst app');
const app = express();
const port = 30005;

    const path = require("path");
    const fs = require("fs");
    const solc = require("solc");

    const coinPath = path.resolve(__dirname, "contracts", "RichCoin.sol");
    const source = fs.readFileSync(coinPath, "utf8");

    module.exports = solc.compile(source, 1).contracts[":RichCoin"];

    res.send(module.exports);


