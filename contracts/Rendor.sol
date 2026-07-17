// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title RenderLock - Decentralized P2P Compute Rental Escrow
/// @notice Lets hardware providers list machines and renters lock funds in escrow.
///         Includes a 10-minute self-reported verification window with instant refund.
contract RenderLock {
    address public owner;
    uint256 public constant VERIFICATION_WINDOW = 10 minutes;
    uint256 public constant PLATFORM_FEE_PERCENT = 2;

    enum RentalStatus { Active, Refunded, Completed }

    struct Machine {
        uint256 id;
        address provider;
        string specs;
        uint256 hourlyRate;
        bool isListed;
    }

    struct Rental {
        uint256 id;
        uint256 machineId;
        address renter;
        address provider;
        uint256 amountLocked;
        uint256 startTime;
        uint256 hoursRented;
        RentalStatus status;
    }

    uint256 private machineCounter;
    uint256 private rentalCounter;

    mapping(uint256 => Machine) public machines;
    mapping(uint256 => Rental) public rentals;

    event MachineListed(uint256 indexed machineId, address indexed provider, string specs, uint256 hourlyRate);
    event RentalStarted(uint256 indexed rentalId, uint256 indexed machineId, address indexed renter, uint256 amountLocked, uint256 startTime);
    event RentalRefunded(uint256 indexed rentalId, address indexed renter, uint256 amount);
    event RentalCompleted(uint256 indexed rentalId, address indexed provider, uint256 providerAmount, uint256 platformFee);

    constructor() {
        owner = msg.sender;
    }

    function listMachine(string calldata specs, uint256 hourlyRate) external returns (uint256) {
        require(hourlyRate > 0, "Rate must be > 0");
        machineCounter++;
        machines[machineCounter] = Machine(machineCounter, msg.sender, specs, hourlyRate, true);
        emit MachineListed(machineCounter, msg.sender, specs, hourlyRate);
        return machineCounter;
    }
    function unlistMachine(uint256 machineId) external {
        Machine storage m = machines[machineId];
        require(msg.sender == m.provider, "Only provider can unlist");
        require(m.isListed == true, "Machine is already unlisted");
        
        // This removes it from the active marketplace pool
        m.isListed = false; 
    }

    function rentMachine(uint256 machineId, uint256 hoursRented) external payable returns (uint256) {
        Machine memory m = machines[machineId];
        require(m.isListed, "Machine not listed");
        require(hoursRented > 0, "Must rent at least 1 hour");
        uint256 totalCost = m.hourlyRate * hoursRented;
        require(msg.value == totalCost, "Incorrect payment amount");
        require(msg.sender != m.provider, "Cannot rent your own machine");

        rentalCounter++;
        rentals[rentalCounter] = Rental(
            rentalCounter, machineId, msg.sender, m.provider,
            msg.value, block.timestamp, hoursRented, RentalStatus.Active
        );

        emit RentalStarted(rentalCounter, machineId, msg.sender, msg.value, block.timestamp);
        return rentalCounter;
    }

    function rejectAndRefund(uint256 rentalId) external {
        Rental storage r = rentals[rentalId];
        require(r.status == RentalStatus.Active, "Rental not active");
        require(msg.sender == r.renter, "Only renter can reject");
        require(block.timestamp <= r.startTime + VERIFICATION_WINDOW, "Verification window expired");

        r.status = RentalStatus.Refunded;
        uint256 refundAmount = r.amountLocked;
        r.amountLocked = 0;

        (bool sent, ) = payable(r.renter).call{value: refundAmount}("");
        require(sent, "Refund transfer failed");

        emit RentalRefunded(rentalId, r.renter, refundAmount);
    }

    function releaseFunds(uint256 rentalId) external {
        Rental storage r = rentals[rentalId];
        require(r.status == RentalStatus.Active, "Rental not active");
        require(
            msg.sender == r.renter || block.timestamp > r.startTime + VERIFICATION_WINDOW,
            "Only renter can confirm within verification window"
        );

        r.status = RentalStatus.Completed;
        uint256 total = r.amountLocked;
        r.amountLocked = 0;

        uint256 platformFee = (total * PLATFORM_FEE_PERCENT) / 100;
        uint256 providerAmount = total - platformFee;

        (bool sentProvider, ) = payable(r.provider).call{value: providerAmount}("");
        require(sentProvider, "Provider transfer failed");
        (bool sentOwner, ) = payable(owner).call{value: platformFee}("");
        require(sentOwner, "Platform fee transfer failed");

        emit RentalCompleted(rentalId, r.provider, providerAmount, platformFee);
    }

    function timeLeftToVerify(uint256 rentalId) external view returns (uint256) {
        Rental memory r = rentals[rentalId];
        uint256 deadline = r.startTime + VERIFICATION_WINDOW;
        if (block.timestamp >= deadline) return 0;
        return deadline - block.timestamp;
    }

    function getMachine(uint256 machineId) external view returns (Machine memory) {
        return machines[machineId];
    }

    function getRental(uint256 rentalId) external view returns (Rental memory) {
        return rentals[rentalId];
    }
}
