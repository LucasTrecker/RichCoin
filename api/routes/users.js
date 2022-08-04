var express = require('express');
var router = express.Router();
const mysql = require('mysql');
const app = require('../app');
const bodyParser = require("body-parser");
const ethjs = require("ethereumjs-util");

const db = mysql.createPool(
    {
        host: 'db5009657844.hosting-data.io',
        user: 'dbu2814476',
        password: 'SpOnGeBoB12345!',
        database: 'dbs8186685'
    }
)

router.get(bodyParser.urlencoded({ extended: true }));


/* GET home page. */
router.post('/', function (req, res, next) {

    var clearData = req.body.data;
    var jsonData = JSON.parse(req.body.data);
    var signature = req.body.signature;
    var encodedImage = req.body.image;
    var userName = jsonData.userName;
    var userAddress = jsonData.userAddress;
    var encodedImageHash = jsonData.profileImage;
    var profilePictureNFTAddress = jsonData.profilePictureNFTAddress;
    var profilePictureIsNFT = false;

    var hashedData = ethjs.hashPersonalMessage(ethjs.toBuffer(clearData));

    var { v, r, s } = ethjs.fromRpcSig(signature);
    var addr = ethjs.bufferToHex(ethjs.pubToAddress(ethjs.ecrecover(hashedData, v, r, s))); //Validation of sent message from signature variables v r s

    addr = ethjs.toChecksumAddress(addr);

    if (addr == userAddress) {

        checkProfilePictureNFT().then(updateUser);

                    async function checkProfilePictureNFT() {
                        return new Promise((resolve, reject) => {
                            if(encodedImage){
                                var hash = require('hash.js');
                                var encodedImageHashGenerated = hash.sha256().update(encodedImage).digest('hex');
                                if (encodedImageHashGenerated != encodedImageHash) {
                                    reject();
                                    console.log("Image hashes not equal");
                                }
                                if (profilePictureNFTAddress) {
                                    const sqlImageSelect = "SELECT replace(TO_BASE64(auctions.nftImage), '\n', '') AS nftImage FROM auctionbuyers INNER JOIN auctions ON auctionbuyers.auctionAddress = auctions.nftAddress  WHERE auctions.nftAddress = ? AND auctionbuyers.buyerAddress = ? AND auctions.auctionClosed = 1 AND auctionbuyers.orderNumber = (SELECT MAX(orderNumber) FROM auctionbuyers WHERE auctionAddress = auctions.nftAddress) AND auctions.creatorAddress != ?;";
        
                                    db.query(sqlImageSelect, [profilePictureNFTAddress, userAddress, userAddress], (err, result) => {
                                        if (!err) {
                                            if (result.length == 1) {
                                                console.log("length = 1")
                                                result[0].nftImage = detectMimeType(result[0].nftImage) + result[0].nftImage;
        
                                                if (hash.sha256().update(result[0].nftImage).digest('hex') == encodedImageHashGenerated) {
                                                    console.log("Ist true");
                                                    profilePictureIsNFT = true;
                                                    resolve();
                                                }else{
                                                    reject();
                                                    res.send("Not your NFT");
                                                }
        
                                            } else {
                                                reject();
                                            }
                                        } else {
                                            reject();
                                        }
                                    });
                                    }else{
                                        resolve();
                                    }
                            }

                            
                        });
                    }
                    async function updateUser() {
                        var encodedImageValid = false;
                        if (encodedImage) {
                            var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
                            if (['image/jpeg', 'image/png', 'image/gif'].includes(encodedImage.split(":")[1].split(";")[0])) {
                                encodedImage = encodedImage.replace(/^data:image\/[a-z]+;base64,/, "");
                                if (base64Regex.test(encodedImage)) {
                                    var sizeInBytes = 4 * Math.ceil((encodedImage.length / 3)) * 0.5624896334383812
                                    if (sizeInBytes < 3e6) {
                                        encodedImageValid = true;
                                        console.log("Image valid true");
                                    }
                                }
                            }
                        }
                        if (encodedImage && !encodedImageValid) {
                            encodedImage = "";
                        }
                        console.log("vor update");
                        console.log([userName, profilePictureIsNFT, userAddress]);
                        const sqlInsert = "INSERT INTO users (userAddress, userImage, userName, userImageIsNFT) VALUES (?,COALESCE(NULLIF(FROM_BASE64(?), ''), userImage), ?, ?)";
                        db.query(sqlInsert, [userAddress, encodedImage, userName, profilePictureIsNFT], (err, result) => {
                            if(err){
                                res.send(err);
                            }else{
                                res.send(result);
                            }
                        });
                    }
    } else {
        res.send("Given address is not authorized!");
    }
});

router.put('/', function (req, res, next) {

    execute();

    async function execute() {
        var clearData = req.body.data;
        var jsonData = JSON.parse(req.body.data)

        var signature = req.body.signature;
        var encodedImage = req.body.image;
        var userName = jsonData.userName;
        var userAddress = jsonData.userAddress;
        var encodedImageHash = jsonData.profileImage;
        var profilePictureNFTAddress = jsonData.profilePictureNFTAddress;
        var profilePictureIsNFT = false;

        var hashedData = ethjs.hashPersonalMessage(ethjs.toBuffer(clearData));

        var { v, r, s } = ethjs.fromRpcSig(signature);
        var addr = ethjs.bufferToHex(ethjs.pubToAddress(ethjs.ecrecover(hashedData, v, r, s))); //Validation of sent message from signature variables v r s

        addr = ethjs.toChecksumAddress(addr);

        if (addr == userAddress) {
            checkProfilePictureNFT().then(updateUser);

                    

                    async function checkProfilePictureNFT() {
                        return new Promise((resolve, reject) => {
                            if(encodedImage){
                                var hash = require('hash.js');
                                var encodedImageHashGenerated = hash.sha256().update(encodedImage).digest('hex');
                                if (encodedImageHashGenerated != encodedImageHash) {
                                    reject();
                                    console.log("Image hashes not equal");
                                }
                                if (profilePictureNFTAddress) {
                                    const sqlImageSelect = "SELECT replace(TO_BASE64(auctions.nftImage), '\n', '') AS nftImage FROM auctionbuyers INNER JOIN auctions ON auctionbuyers.auctionAddress = auctions.nftAddress  WHERE auctions.nftAddress = ? AND auctionbuyers.buyerAddress = ? AND auctions.auctionClosed = 1 AND auctionbuyers.orderNumber = (SELECT MAX(orderNumber) FROM auctionbuyers WHERE auctionAddress = auctions.nftAddress) AND auctions.creatorAddress != ?;";
        
                                    db.query(sqlImageSelect, [profilePictureNFTAddress, userAddress, userAddress], (err, result) => {
                                        if (!err) {
                                            if (result.length == 1) {
                                                console.log("length = 1")
                                                result[0].nftImage = detectMimeType(result[0].nftImage) + result[0].nftImage;
        
                                                if (hash.sha256().update(result[0].nftImage).digest('hex') == encodedImageHashGenerated) {
                                                    console.log("Ist true");
                                                    profilePictureIsNFT = true;
                                                    resolve();
                                                }else{
                                                    reject();
                                                    res.send("Not your NFT");
                                                }
        
                                            } else {
                                                reject();
                                            }
                                        } else {
                                            reject();
                                        }
                                    });
                                    }else{
                                        resolve();
                                    }
                            }

                            
                        });
                    }
                    async function updateUser() {
                        var encodedImageValid = false;
                        if (encodedImage) {
                            var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
                            if (['image/jpeg', 'image/png', 'image/gif'].includes(encodedImage.split(":")[1].split(";")[0])) {
                                encodedImage = encodedImage.replace(/^data:image\/[a-z]+;base64,/, "");
                                if (base64Regex.test(encodedImage)) {
                                    var sizeInBytes = 4 * Math.ceil((encodedImage.length / 3)) * 0.5624896334383812
                                    if (sizeInBytes < 3e6) {
                                        encodedImageValid = true;
                                        console.log("Image valid true");
                                    }
                                }
                            }
                        }
                        if (encodedImage && !encodedImageValid) {
                            encodedImage = "";
                        }
                        console.log("vor update");
                        console.log([userName, profilePictureIsNFT, userAddress]);
                        const sqlUpdate = "UPDATE users SET userName = COALESCE(NULLIF(?, ''), userName), userImage = COALESCE(NULLIF(FROM_BASE64(?), ''), userImage), userImageIsNFT = ? WHERE userAddress = ?";
                        db.query(sqlUpdate, [userName, encodedImage, profilePictureIsNFT, userAddress], (err, result) => {
                            if (err) {
                                res.send(err);
                            } else {
                                res.send(result);
                            }
            
                        });
                    }
            
        } else {
            res.send("Given address is not authorized!");
        }

        
    }
});

router.get('/', function (req, res) {

    var query = req.query.query;
    var limitClause;
    var queryParams = [query, query, query, query];
    if (query) {
        query = query.replace(/%/g, "");
    }
    var limit = req.query.limit;
    if (!limit) {
        limitClause = "";
    } else {
        limitClause = "LIMIT ?";
        limit = parseInt(limit);
        queryParams.push(limit);
    }

    const sqlSelect = "SELECT userAddress, userName, replace(TO_BASE64(userImage), '\n', '') AS userImage FROM users WHERE userAddress LIKE CONCAT('%', ?, '%') OR userName LIKE CONCAT('%', ?, '%') ORDER BY CASE WHEN userAddress LIKE CONCAT('%', ?, '%') THEN 1 WHEN userName LIKE CONCAT('%', ?, '%') THEN 2 ELSE 3 END " + limitClause + ";";

    db.query(sqlSelect, queryParams, (err, result) => {
        if (!err) {
            if (result.length > 0) {
                for (var ob in result) {
                    if (result[ob].userImage) {
                        result[ob].userImage = detectMimeType(result[ob].userImage) + result[ob].userImage;
                    }
                }
            }
            res.send(result);
        } else {
            res.send(err);
        }
    });
});

var signatures = {
    R0lGODdh: "data:image/gif;base64,",
    R0lGODlh: "data:image/gif;base64,",
    iVBORw0KGgo: "data:image/png;base64,",
    "/9j/2w": "data:image/jpg;base64,",
    "/9j/4A": "data:image/jpg;base64,",
    "/9j/7g": "data:image/jpg;base64,",
    "/9j/4Q": "data:image/jpg;base64,",
    "/9j/": "data:image/jpg;base64,"
};

function detectMimeType(b64) {
    for (var s in signatures) {
        if (b64.indexOf(s) === 0) {
            return signatures[s];
        }
    }
}

router.get('/:userAddress', function (req, res, next) {

    var userAddress = req.params.userAddress;
    console.log(userAddress);
    const sqlSelect = "SELECT userAddress, userName, replace(TO_BASE64(userImage), '\n', '') AS userImage, userImageIsNFT FROM users WHERE userAddress = ?;";

    db.query(sqlSelect, [userAddress], (err, result) => {
        if (!err) {
            if (result.length == 1) {
                if (result[0].userImage) {
                    result[0].userImage = detectMimeType(result[0].userImage) + result[0].userImage;
                }
                res.send(result);
            } else {
                res.send([])
            }
        } else {
            res.send(err);
        }
    });
    //res.send(userAddress);
});

router.get('/:userAddress/participatedAuctions', function (req, res, next) {
    var userAddress = req.params.userAddress;
    var now = Date.now() / 1000;
    const sqlSelect = "SELECT *, TO_BASE64(users.userImage) AS userImage, TO_BASE64(auctions.nftImage) AS nftImage FROM auctionbuyers INNER JOIN auctions ON auctionbuyers.auctionAddress = auctions.nftAddress LEFT JOIN users ON auctionbuyers.buyerAddress = users.userAddress  WHERE auctionbuyers.buyerAddress = ? AND auctions.creatorAddress != ?;";

    db.query(sqlSelect, [userAddress, userAddress], (err, result) => {
        if (!err) {
            if (result) {
                for (var ob in result) {
                    //Hier könnte man checken ob er wirklich gewonnen hat
                    if (result[ob].userImage) {
                        result[ob].userImage = detectMimeType(result[ob].userImage) + result[ob].userImage;
                    }
                    result[ob].nftImage = detectMimeType(result[ob].nftImage) + result[ob].nftImage;
                }
                res.send(result);
            }
        } else {
            res.send(err);
        }
    });
    //res.send(userAddress);
});

router.get('/:userAddress/participatedAuctions/runningAuctions', function (req, res, next) {
    var userAddress = req.params.userAddress;
    var now = Date.now() / 1000;
    const sqlSelect = "SELECT *, TO_BASE64(users.userImage) AS userImage, TO_BASE64(auctions.nftImage) AS nftImage FROM auctionbuyers INNER JOIN auctions ON auctionbuyers.auctionAddress = auctions.nftAddress LEFT JOIN users ON auctionbuyers.buyerAddress = users.userAddress  WHERE auctionbuyers.buyerAddress = ? AND ? >= auctions.auctionStart AND ? <= auctions.auctionDeadline AND auctions.auctionClosed = 0 AND auctions.creatorAddress != ?;";

    db.query(sqlSelect, [userAddress, now, now, userAddress], (err, result) => {
        if (!err) {
            if (result) {
                for (var ob in result) {
                    //Hier könnte man checken ob er wirklich gewonnen hat
                    if (result[ob].userImage) {
                        result[ob].userImage = detectMimeType(result[ob].userImage) + result[ob].userImage;
                    }
                    result[ob].nftImage = detectMimeType(result[ob].nftImage) + result[ob].nftImage;
                }
                res.send(result);
            }
        } else {
            res.send(err);
        }
    });
    //res.send(userAddress);
});

router.get('/:userAddress/participatedAuctions/closableAuctions', function (req, res, next) {
    var userAddress = req.params.userAddress;
    var now = Date.now() / 1000;
    const sqlSelect = "SELECT *, TO_BASE64(users.userImage) AS userImage, TO_BASE64(auctions.nftImage) AS nftImage FROM auctionbuyers INNER JOIN auctions ON auctionbuyers.auctionAddress = auctions.nftAddress LEFT JOIN users ON auctionbuyers.buyerAddress = users.userAddress  WHERE auctionbuyers.buyerAddress = ? AND ? >= auctions.auctionStart AND ? >= auctions.auctionDeadline AND auctions.auctionClosed = 0 AND auctionbuyers.orderNumber = (SELECT MAX(orderNumber) FROM auctionbuyers WHERE auctionAddress = auctions.nftAddress) AND auctions.creatorAddress != ?;";

    db.query(sqlSelect, [userAddress, now, now, userAddress], (err, result) => {
        if (!err) {
            if (result) {
                for (var ob in result) {
                    //Hier könnte man checken ob er wirklich gewonnen hat
                    if (result[ob].userImage) {
                        result[ob].userImage = detectMimeType(result[ob].userImage) + result[ob].userImage;
                    }
                    result[ob].nftImage = detectMimeType(result[ob].nftImage) + result[ob].nftImage;
                }
                res.send(result);
            }
        } else {
            res.send(err);
        }
    });
    //res.send(userAddress);
});

router.get('/:userAddress/participatedAuctions/closedAuctions', function (req, res, next) {
    var userAddress = req.params.userAddress;
    const sqlSelect = "SELECT *, TO_BASE64(users.userImage) AS userImage, TO_BASE64(auctions.nftImage) AS nftImage FROM auctionbuyers INNER JOIN auctions ON auctionbuyers.auctionAddress = auctions.nftAddress LEFT JOIN users ON auctionbuyers.buyerAddress = users.userAddress  WHERE auctionbuyers.buyerAddress = ? AND auctions.creatorAddress != ? AND auctions.auctionClosed = 1;";

    db.query(sqlSelect, [userAddress, userAddress], (err, result) => {
        if (!err) {
            if (result) {
                for (var ob in result) {
                    //Hier könnte man checken ob er wirklich gewonnen hat
                    if (result[ob].userImage) {
                        result[ob].userImage = detectMimeType(result[ob].userImage) + result[ob].userImage;
                    }
                    result[ob].nftImage = detectMimeType(result[ob].nftImage) + result[ob].nftImage;
                }
                res.send(result);
            }
        } else {
            res.send(err);
        }
    });
    //res.send(userAddress);
});

router.get('/:userAddress/participatedAuctions/wonAuctions', function (req, res, next) {
    var userAddress = req.params.userAddress;
    const sqlSelect = "SELECT *, TO_BASE64(users.userImage) AS userImage, replace(TO_BASE64(auctions.nftImage), '\n', '') AS nftImage FROM auctionbuyers INNER JOIN auctions ON auctionbuyers.auctionAddress = auctions.nftAddress LEFT JOIN users ON auctionbuyers.buyerAddress = users.userAddress  WHERE auctionbuyers.buyerAddress = ? AND auctions.auctionClosed = 1 AND auctionbuyers.orderNumber = (SELECT MAX(orderNumber) FROM auctionbuyers WHERE auctionAddress = auctions.nftAddress) AND auctions.creatorAddress != ?;";

    db.query(sqlSelect, [userAddress, userAddress], (err, result) => {
        if (!err) {
            if (result) {
                for (var ob in result) {
                    //Hier könnte man checken ob er wirklich gewonnen hat
                    if (result[ob].userImage) {
                        result[ob].userImage = detectMimeType(result[ob].userImage) + result[ob].userImage;
                    }
                    result[ob].nftImage = detectMimeType(result[ob].nftImage) + result[ob].nftImage;
                }
                res.send(result);
            }
        } else {
            res.send(err);
        }
    });
    //res.send(userAddress);
});

router.get('/:userAddress/createdAuctions', function (req, res, next) {

    var userAddress = req.params.userAddress;
    console.log(userAddress);
    const sqlSelect = "SELECT *, TO_BASE64(auctions.nftImage) AS nftImage FROM auctions WHERE creatorAddress = ? ORDER BY auctionStart DESC;";

    db.query(sqlSelect, [userAddress], (err, result) => {
        if (!err) {
            if (result) {
                for (var ob in result) {
                    result[ob].nftImage = detectMimeType(result[ob].nftImage) + result[ob].nftImage;
                }
                res.send(result);
            }
        } else {
            res.send(err);
        }
    });
    //res.send(userAddress);
});

router.get('/:userAddress/createdAuctions/runningAuctions', function (req, res, next) {

    var userAddress = req.params.userAddress;
    console.log(userAddress);
    var now = Date.now() / 1000;
    const sqlSelect = "SELECT *, TO_BASE64(users.userImage) AS userImage, TO_BASE64(auctions.nftImage) AS nftImage FROM auctions INNER JOIN users ON auctions.creatorAddress = users.userAddress WHERE ? >= auctionStart AND ? <= auctionDeadline AND creatorAddress = ?;";

    db.query(sqlSelect, [now, now, userAddress], (err, result) => {
        if (!err) {
            if (result) {
                console.log(result.length);
                for (var ob in result) {
                    if (result[ob].userImage) {
                        result[ob].userImage = detectMimeType(result[ob].userImage) + result[ob].userImage;
                    }
                    result[ob].nftImage = detectMimeType(result[ob].nftImage) + result[ob].nftImage;
                }
                res.send(result);
            }
        } else {
            res.send(err);
        }
    });
});

router.get('/:userAddress/createdAuctions/closableAuctions', function (req, res, next) {

    var userAddress = req.params.userAddress;
    console.log(userAddress);
    var now = Date.now() / 1000;
    const sqlSelect = "SELECT *, TO_BASE64(users.userImage) AS userImage, TO_BASE64(auctions.nftImage) AS nftImage FROM auctions INNER JOIN users ON auctions.creatorAddress = users.userAddress WHERE ? >= auctionStart AND ? >= auctionDeadline AND creatorAddress = ? AND auctionClosed = 0;";

    db.query(sqlSelect, [now, now, userAddress], (err, result) => {
        if (!err) {
            if (result) {
                console.log(result.length);
                for (var ob in result) {
                    if (result[ob].userImage) {
                        result[ob].userImage = detectMimeType(result[ob].userImage) + result[ob].userImage;
                    }
                    result[ob].nftImage = detectMimeType(result[ob].nftImage) + result[ob].nftImage;
                }
                res.send(result);
            }
        } else {
            res.send(err);
        }
    });
});

router.get('/:userAddress/createdAuctions/ownClosableAuctions', function (req, res, next) {

    var userAddress = req.params.userAddress;
    console.log(userAddress);
    var now = Date.now() / 1000;
    const sqlSelect = "SELECT *, TO_BASE64(users.userImage) AS userImage, TO_BASE64(auctions.nftImage) AS nftImage FROM auctions INNER JOIN users ON auctions.creatorAddress = users.userAddress INNER JOIN auctionbuyers ON auctionbuyers.auctionAddress = auctions.nftAddress WHERE ? >= auctions.auctionStart AND ? >= auctions.auctionDeadline AND auctions.creatorAddress = ? AND auctions.auctionClosed = 0 AND auctionbuyers.orderNumber = (SELECT MAX(orderNumber) FROM auctionbuyers WHERE auctionAddress = auctions.nftAddress);";

    db.query(sqlSelect, [now, now, userAddress], (err, result) => {
        if (!err) {
            if (result) {
                console.log(result.length);
                for (var ob in result) {
                    if (result[ob].userImage) {
                        result[ob].userImage = detectMimeType(result[ob].userImage) + result[ob].userImage;
                    }
                    result[ob].nftImage = detectMimeType(result[ob].nftImage) + result[ob].nftImage;
                }
                res.send(result);
            }
        } else {
            res.send(err);
        }
    });
});

router.get('/:userAddress/createdAuctions/ownWonAuctions', function (req, res, next) {

    var userAddress = req.params.userAddress;
    console.log(userAddress);
    var now = Date.now() / 1000;
    const sqlSelect = "SELECT *, TO_BASE64(users.userImage) AS userImage, replace(TO_BASE64(auctions.nftImage), '\n', '') AS nftImage FROM auctions INNER JOIN users ON auctions.creatorAddress = users.userAddress INNER JOIN auctionbuyers ON auctionbuyers.auctionAddress = auctions.nftAddress WHERE auctions.creatorAddress = ? AND auctions.auctionClosed = 1 AND auctionbuyers.orderNumber = (SELECT MAX(orderNumber) FROM auctionbuyers WHERE auctionAddress = auctions.nftAddress);";

    db.query(sqlSelect, [userAddress], (err, result) => {
        if (!err) {
            if (result) {
                console.log(result.length);
                for (var ob in result) {
                    if (result[ob].userImage) {
                        result[ob].userImage = detectMimeType(result[ob].userImage) + result[ob].userImage;
                    }
                    result[ob].nftImage = detectMimeType(result[ob].nftImage) + result[ob].nftImage;
                }
                res.send(result);
            }
        } else {
            res.send(err);
        }
    });
});

router.get('/:userAddress/createdAuctions/startingAuctions', function (req, res, next) {

    var userAddress = req.params.userAddress;
    console.log(userAddress);
    var now = Date.now() / 1000;
    const sqlSelect = "SELECT *, TO_BASE64(users.userImage) AS userImage, TO_BASE64(auctions.nftImage) AS nftImage FROM auctions INNER JOIN users ON auctions.creatorAddress = users.userAddress WHERE ? <= auctionStart AND creatorAddress = ?;";

    db.query(sqlSelect, [now, userAddress], (err, result) => {
        if (!err) {
            if (result) {
                console.log(result.length);
                for (var ob in result) {
                    if (result[ob].userImage) {
                        result[ob].userImage = detectMimeType(result[ob].userImage) + result[ob].userImage;
                    }
                    result[ob].nftImage = detectMimeType(result[ob].nftImage) + result[ob].nftImage;
                }
                res.send(result);
            }
        } else {
            res.send(err);
        }
    });
});

router.get('/:userAddress/createdAuctions/closedAuctions', function (req, res, next) {

    var userAddress = req.params.userAddress;
    console.log(userAddress);
    var now = Date.now() / 1000;
    const sqlSelect = "SELECT *, TO_BASE64(users.userImage) AS userImage, TO_BASE64(auctions.nftImage) AS nftImage FROM auctions INNER JOIN users ON auctions.creatorAddress = users.userAddress WHERE auctionClosed = 1 AND creatorAddress = ?;";

    db.query(sqlSelect, [userAddress], (err, result) => {
        if (!err) {
            if (result) {
                console.log(result.length);
                for (var ob in result) {
                    if (result[ob].userImage) {
                        result[ob].userImage = detectMimeType(result[ob].userImage) + result[ob].userImage;
                    }
                    result[ob].nftImage = detectMimeType(result[ob].nftImage) + result[ob].nftImage;
                }
                res.send(result);
            }
        } else {
            res.send(err);
        }
    });
});

module.exports = router;