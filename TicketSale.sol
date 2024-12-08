// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.17;

contract TicketSale {


	address public manager;
	uint public ticketPrice;
	uint public totalTickets;
	mapping(uint => address) public ticketOwners;
	mapping(address => uint) public userTickets;
	mapping(uint => uint) public resalePrices;
	mapping(uint => address) public resaleOffers;
	mapping(uint => address) public swapOffers;
	
	event TicketBought(address indexed buyer, uint ticketId);
	event SwapOffered(uint ticketId, address indexed sender);
	event SwapAccepted(address indexed from, address indexed to, uint ticketId1, uint ticketId2);
	event TicketResaleOffered(address indexed seller, uint ticketId, uint price);
	event TicketResaleAccepted(address indexed buyer, address indexed seller, uint ticketId, uint price);
	
	constructor(uint numTickets, uint price) public {
		manager = msg.sender;
		totalTickets = numTickets;
		ticketPrice = price;
	}
	
	function buyTicket(uint ticketId) public payable {
		require(ticketId > 0 && ticketId <= totalTickets, "Invalid ticket ID");
		require(msg.value == ticketPrice, "Incorrect payment amount");
		require(ticketOwners[ticketId] == address(0), "Ticket already sold");
		require(userTickets[msg.sender] == 0, "User already owns a ticket");
		ticketOwners[ticketId] = msg.sender;
		userTickets[msg.sender] = ticketId;
		emit TicketBought(msg.sender, ticketId);
	}
	
	function getTicketOf(address person) public view returns (uint) {
		return userTickets[person];
	}
	
	function offerSwap(uint ticketId) public {
		require(ticketOwners[ticketId] == msg.sender, "You aren't Authized");
		swapOffers[ticketId] = msg.sender;
		emit SwapOffered(ticketId, msg.sender);
	}
	
	function acceptSwap(uint ticketId) public {
		address partner = swapOffers[ticketId];
		require(partner != address(0), "No Swap Offer");
		require(ticketOwners[ticketId] == partner, "Partner does not own this ticket");
		uint myTicket = userTickets[msg.sender];
		require(myTicket != 0, "You do not own a ticket");
		
		ticketOwners[myTicket] = partner;
		ticketOwners[ticketId] = msg.sender;
		userTickets[msg.sender] = ticketId;
		userTickets[partner] = myTicket;
		swapOffers[ticketId] = address(0);
		
		emit SwapAccepted(partner, msg.sender, myTicket, ticketId);
	}
	
	function resaleTicket(uint price) public {
		uint ticketId = userTickets[msg.sender];
		require(ticketId != 0, "You do not own a ticket");
		resalePrices[ticketId] = price;
		resaleOffers[ticketId] = msg.sender;
		
		emit TicketResaleOffered(msg.sender, ticketId, price);
	}
	
	function acceptResale(uint ticketId) public payable {
		address seller = resaleOffers[ticketId];
		uint price = resalePrices[ticketId];
		require(seller != address(0), "Ticket not available for resale");
		require(msg.value == price, "Incorrect payment amount");
		require(userTickets[msg.sender] == 0, "You already own a ticket");
		
		uint managerFee = price /10;
		uint sellerPayment = price - managerFee;
		resaleOffers[ticketId] = address(0);
		resalePrices[ticketId] = 0;
		
		ticketOwners[ticketId] = msg.sender;
		userTickets[msg.sender] = ticketId;
		payable(manager).transfer(managerFee);
		payable(seller).transfer(sellerPayment);
		
		emit TicketResaleAccepted(msg.sender, seller, ticketId, price);
	}
	
	function checkResale() public view returns (uint[] memory) {
		uint[] memory ticketsOnResale = new uint[](totalTickets);
		uint count = 0;
		
		for (uint i = 1; i <= totalTickets; i++){
			if(resaleOffers[i] != address(0)) {
				ticketsOnResale[count] = i;
				count++;
			}
		}
		
		uint[] memory trimmedArray = new uint[](count);
		for (uint i = 0; i < count; i++) {
			trimmedArray[i] = ticketsOnResale[i];
		}
		return trimmedArray;
	}
}
