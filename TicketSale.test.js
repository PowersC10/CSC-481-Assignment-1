const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());
const {abi, bytecode} = require ('../compile');



//const fs = require("fs");
//const abi = JSON.parse(fs.readFileSync("ABI.json", "utf8"));
//const bytecode = fs.readFileSync("Bytecode.txt", "utf8").trim();

let accounts, contract;
let TicketSale;

beforeEach(async () => {
	accounts = await web3.eth.getAccounts();
	
	TicketSale = await new web3.eth.Contract(abi).deploy({
			data: bytecode,
			arguments: [10, web3.utils.toWei("1", "ether")],
		})
		.send({ from: accounts[0], gas: 5000000});
	
	
	
	
	
	
	
	//console.log("Contract deployed at:", contract.options.address);
});

describe("TicketSale Contract", () => {
	
	it("Should allow a user to buy a ticket", async () => {
		console.log("test 1");
		const ticketId = 1;
		await TicketSale.methods.buyTicket(ticketId)
		.send({ from:accounts[1], value: web3.utils.toWei("1", "ether") });
		const owner = await TicketSale.methods.getTicketOf(accounts[1]).call();
		assert.equal(owner, ticketId, "Ticket ownership does not match");
		
		
	});
	
	it("Should allow a user to offer a swap", async () => {
		console.log("test 2");
		const ticketId = 2;
		await TicketSale.methods.buyTicket(ticketId)
		.send({ from: accounts[2], value: web3.utils.toWei("1", "ether"), gas:500000});
		
		const tic = await TicketSale.methods.offerSwap(ticketId)
		.send({ from: accounts[2], gas: 500000 });
		const event = tic.events.SwapOffered;
		assert(event, "Swap offer event not emmitted");
		assert.equal(event.returnValues.ticketId, ticketId, "Ticker ID in swap offer even does not match");
		assert.equal(event.returnValues.sender, accounts[2], "Sender in swap offer does not match");
		//await TicketSale.methods.offerSwap(ticketId).send({ from: accounts[2], gas: 500000});
		//const offeredTicket = await TicketSale.methods.getSwapOffer(accounts[2]).call();
		//assert.equal(offeredTicket, ticketId, "Swap offer not recorded correctly");
	});
	
	it("Should allow a swap to be accepted", async () => {
		console.log("test 3");
		
		await TicketSale.methods.buyTicket(1).send({
		from: accounts[2],value: web3.utils.toWei("1", "ether"),gas: 500000,});
		
		await TicketSale.methods.offerSwap(1).send({ from: accounts[2], gas: 500000, });
		
		await TicketSale.methods.buyTicket(2).send({
		from: accounts[1],value: web3.utils.toWei("1", "ether"),gas: 500000,});
		
		await TicketSale.methods.acceptSwap(1).send({ from: accounts[1], gas: 500000, });
		
		
		const owner1 = await TicketSale.methods.getTicketOf(accounts[1]).call();
		const owner2 = await TicketSale.methods.getTicketOf(accounts[2]).call();
		//console.log("Owner1 after swap:", owner1);
		//console.log("Owner2 after swap:", owner2);
		assert.equal(owner1, 1, "Ticket not swapped correctly for accounts[1]");
		assert.equal(owner2, 2, "Ticket not swapped correctly for accounts[2]");
	});
	
	it("Should allow a ticket to be resold", async () => {
		console.log("test 4");
		const resalePrice = web3.utils.toWei("8", "gwei");
		await TicketSale.methods.buyTicket(2).send({ from: accounts[1],
		value: web3.utils.toWei("1", "ether"), gas: 500000, });
		await TicketSale.methods.resaleTicket(resalePrice)
		.send({ from: accounts[1], gas:500000});
		const resaleTickets = await TicketSale.methods.checkResale().call();
		assert.equal(resaleTickets[0], 2, "Ticket not added to resale list");
	});
	
	it("Should allow a resale ticket to be bought", async () => {
		console.log("test 5");
		const resalePrice = web3.utils.toWei("8.8", "gwei");
		const ticketId = 2;
		await TicketSale.methods.buyTicket(2).send({ from: accounts[1],
		value: web3.utils.toWei("1", "ether"), gas: 500000, });
		await TicketSale.methods.resaleTicket(resalePrice)
		.send({ from: accounts[1], gas: 500000});
		await TicketSale.methods.acceptResale(ticketId).send({ from: accounts[3], value: resalePrice,
		gas: 500000, });
		const owner = await TicketSale.methods.getTicketOf(accounts[3]).call();
		assert.equal(owner, ticketId, "Resale ticket not transferred correctly");
		const managerBalance = await web3.eth.getBalance(accounts[0]);
		//console.log("Manager balance after resale fee:", managerBalance);
	});
	
});

