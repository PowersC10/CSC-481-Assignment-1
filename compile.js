const path = require('path');
const fs = require('fs');
const solc = require('solc');


const ticketPath  = path.resolve(__dirname, 'contracts', 'TicketSale.sol');
const source = fs.readFileSync(ticketPath, 'utf8');



let input = {
  language: "Solidity",
  sources: {
    "TicketSale.sol": {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode"],
      },
    },
  },
};
/*
const output = JSON.parse(solc.compile(JSON.stringify(input)));
//const stringInput = JSON.stringify(input);
//const compiledCode = solc.compile(stringInput);
//const output = JSON.parse(compiledCode);


const contract = output.contracts["TicketSale.sol"]["TicketSale"];
const abi = contract.abi;
const bytecode = contract.evm.bytecode.object;

fs.writeFileSync("ABI.json", JSON.stringify(abi, null, 2));
fs.writeFileSync("Bytecode.txt", bytecode);
*/
//console.log("ABI:", JSON.stringify(abi, null, 2));


const stringInput=JSON.stringify(input);

const compiledCode=solc.compile(stringInput);
const output =JSON.parse(compiledCode);
const contractOutput=output.contracts;
const ticketOutput=contractOutput["TicketSale.sol"];
const ticketABI=ticketOutput.TicketSale.abi;
const ticketBytecode=ticketOutput.TicketSale.evm.bytecode;
module.exports= {"abi":ticketABI,"bytecode":ticketBytecode.object};
console.log("ticketABI:", ticketABI);
console.log("ticketBytecode:", ticketBytecode);
