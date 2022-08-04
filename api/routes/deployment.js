var express = require('express');
var router = express.Router();

var output;
/* GET users listing. */
router.get('/', function(req, res, next) {
        
      const path = require("path");
      const fs = require("fs-extra");
      const solc = require("solc");

      const IRichCoin = fs.readFileSync(path.resolve(__dirname, "../contracts", "IRichCoin.sol"), "utf8");
      const IPayToken = fs.readFileSync(path.resolve(__dirname, "../contracts", "IPayToken.sol"), "utf8");
      const IDex = fs.readFileSync(path.resolve(__dirname, "../contracts", "IDex.sol"), "utf8");

      const IERC721 = fs.readFileSync(path.resolve(__dirname, "../contracts/openzeppelin/contracts/token/ERC721", "IERC721.sol"), "utf8");
      const IERC721Receiver = fs.readFileSync(path.resolve(__dirname, "../contracts/openzeppelin/contracts/token/ERC721", "IERC721Receiver.sol"), "utf8");
      const ERC721Holder = fs.readFileSync(path.resolve(__dirname,"../contracts/openzeppelin/contracts/token/ERC721/utils","ERC721Holder.sol"), "utf8");
      const IERC721Metadata = fs.readFileSync(path.resolve(__dirname,"../contracts/openzeppelin/contracts/token/ERC721/extensions","IERC721Metadata.sol"), "utf8");
      const Address = fs.readFileSync(path.resolve(__dirname,"../contracts/openzeppelin/contracts/utils","Address.sol"), "utf8");
      const Context = fs.readFileSync(path.resolve(__dirname,"../contracts/openzeppelin/contracts/utils","Context.sol"), "utf8");
      const Strings = fs.readFileSync(path.resolve(__dirname,"../contracts/openzeppelin/contracts/utils","Strings.sol"), "utf8");
      const ERC165 = fs.readFileSync(path.resolve(__dirname,"../contracts/openzeppelin/contracts/utils/introspection","ERC165.sol"), "utf8");
      const Ownable = fs.readFileSync(path.resolve(__dirname,"../contracts/openzeppelin/contracts/access","Ownable.sol"), "utf8");
      const Dex = fs.readFileSync(path.resolve(__dirname,"../contracts","Dex.sol"));
      const ReentrancyGuard = fs.readFileSync(path.resolve(__dirname, "../contracts/openzeppelin/contracts/security","ReentrancyGuard.sol"), "utf8");
      const IERC165 = fs.readFileSync(path.resolve(__dirname, "../contracts/openzeppelin/contracts/utils/introspection","IERC165.sol"), "utf8");
      const IERC20 = fs.readFileSync(path.resolve(__dirname, "../contracts/openzeppelin/contracts/token/ERC20", "IERC20.sol"), "utf8");

      const buildPath = path.resolve(__dirname, "../build");
      fs.removeSync(buildPath);

      function compileContract(Contract) {
        const contractPath = path.resolve(...Contract);  
        
        const contractSourceCode = fs.readFileSync(contractPath, "utf8");
        
        fs.ensureDirSync(buildPath);
        
        var input = {
            language: "Solidity",
            sources: {
              Contract: {
                content: contractSourceCode
              }
            },
            settings: {
                optimizer: {
                    enabled: true
                },
                outputSelection: {
                    "*": {
                        "*": [ "*" ]
                    }
                }
            }
        };
        
        var dependencyList = [];

        function findImports(lpath) {


            if (lpath.includes("IERC721Metadata") ) {if(!dependencyList.includes("IERC721Metadata")){dependencyList.push("IERC721Metadata"); return { contents: `${IERC721Metadata}` }}}
            if (lpath.includes("IERC721Receiver") ) {if(!dependencyList.includes("IERC721Receiver")){dependencyList.push("IERC721Receiver");return {contents: `${IERC721Receiver}`}}}
            if (lpath.includes("IERC721") ) {if(!dependencyList.includes("IERC721")){dependencyList.push("IERC721");return { contents: `${IERC721}` }}}
            if (lpath.includes("ReentrancyGuard") ) {if(!dependencyList.includes("ReentrancyGuard")){dependencyList.push("ReentrancyGuard");return { contents: `${ReentrancyGuard}` }}}
            if (lpath.includes("Address")){if(!dependencyList.includes("Address")){dependencyList.push("Address");return { contents: `${Address}` }}}
            if (lpath.includes("ERC721Holder")){ if(!dependencyList.includes("ERC721Holder")){dependencyList.push("ERC721Holder");return { contents: `${ERC721Holder}` }}}
            if (lpath.includes("Context")){ if(!dependencyList.includes("Context")){dependencyList.push("Context");return { contents: `${Context}` }}}
            if (lpath.includes("Strings") ){ if(!dependencyList.includes("Strings")){dependencyList.push("Strings");return { contents: `${Strings}` }}}
            if (lpath.includes("ERC165") ){ if(!dependencyList.includes("ERC165")){dependencyList.push("ERC165");return { contents: `${ERC165}` }}}
            if (lpath.includes("Dex") ) {if(!dependencyList.includes("Dex")){dependencyList.push("Dex");return { contents: `${Dex}` }}}
            if (lpath.includes("IRichCoin") ) {if(!dependencyList.includes("IRichCoin")){dependencyList.push("IRichCoin");return { contents: `${IRichCoin}` }}}
            if (lpath.includes("Ownable") ) {if(!dependencyList.includes("Ownable")){dependencyList.push("Ownable");return { contents: `${Ownable}` }}}
            if (lpath.includes("IERC165") ) {if(!dependencyList.includes("IERC165")){dependencyList.push("IERC165");return {contents: `${IERC165}`}}}
            if (lpath.includes("IPayToken") ) {if(!dependencyList.includes("IPayToken")){dependencyList.push("IPayToken");return {contents: `${IPayToken}`}}}
            if (lpath.includes("IERC20") ) {if(!dependencyList.includes("IERC20")){dependencyList.push("IERC20");return {contents: `${IERC20}`}}}
            if (lpath.includes("IDex") ) {if(!dependencyList.includes("IDex")){dependencyList.push("IDex");return {contents: `${IDex}`}}}
            
              return {}
            

          }

        output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
        output = output.contracts.Contract["RichCoin"];
        
           fs.outputJsonSync(
               path.resolve(buildPath, "RichCoin.json"),
                output
            );
 
    }

    compileContract([__dirname,"../contracts/", "RichCoin.sol"]);


    res.send(output);

});



module.exports = router;
