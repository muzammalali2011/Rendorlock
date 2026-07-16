export const RENDERLOCK_ADDRESS = "0xE9475816Dc604afFAC89942d93E62CfFd48e0746";

export const RENDERLOCK_ABI = [
    {
        "inputs": [
            { "internalType": "string", "name": "specs", "type": "string" },
            { "internalType": "uint256", "name": "hourlyRate", "type": "uint256" }
        ],
        "name": "listMachine",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "rentalId", "type": "uint256" }],
        "name": "rejectAndRefund",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "machineId", "type": "uint256" },
            { "indexed": true, "internalType": "address", "name": "provider", "type": "address" },
            { "indexed": false, "internalType": "string", "name": "specs", "type": "string" },
            { "indexed": false, "internalType": "uint256", "name": "hourlyRate", "type": "uint256" }
        ],
        "name": "MachineListed",
        "type": "event"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "rentalId", "type": "uint256" }],
        "name": "releaseFunds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "rentalId", "type": "uint256" },
            { "indexed": true, "internalType": "address", "name": "provider", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "providerAmount", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "platformFee", "type": "uint256" }
        ],
        "name": "RentalCompleted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "rentalId", "type": "uint256" },
            { "indexed": true, "internalType": "address", "name": "renter", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "RentalRefunded",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "rentalId", "type": "uint256" },
            { "indexed": true, "internalType": "uint256", "name": "machineId", "type": "uint256" },
            { "indexed": true, "internalType": "address", "name": "renter", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "amountLocked", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "startTime", "type": "uint256" }
        ],
        "name": "RentalStarted",
        "type": "event"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "machineId", "type": "uint256" },
            { "internalType": "uint256", "name": "hoursRented", "type": "uint256" }
        ],
        "name": "rentMachine",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "machineId", "type": "uint256" }],
        "name": "unlistMachine",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "machineId", "type": "uint256" }],
        "name": "getMachine",
        "outputs": [
            {
                "components": [
                    { "internalType": "uint256", "name": "id", "type": "uint256" },
                    { "internalType": "address", "name": "provider", "type": "address" },
                    { "internalType": "string", "name": "specs", "type": "string" },
                    { "internalType": "uint256", "name": "hourlyRate", "type": "uint256" },
                    { "internalType": "bool", "name": "isListed", "type": "bool" }
                ],
                "internalType": "struct RenderLock.Machine",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "rentalId", "type": "uint256" }],
        "name": "getRental",
        "outputs": [
            {
                "components": [
                    { "internalType": "uint256", "name": "id", "type": "uint256" },
                    { "internalType": "uint256", "name": "machineId", "type": "uint256" },
                    { "internalType": "address", "name": "renter", "type": "address" },
                    { "internalType": "address", "name": "provider", "type": "address" },
                    { "internalType": "uint256", "name": "amountLocked", "type": "uint256" },
                    { "internalType": "uint256", "name": "startTime", "type": "uint256" },
                    { "internalType": "uint256", "name": "hoursRented", "type": "uint256" },
                    { "internalType": "enum RenderLock.RentalStatus", "name": "status", "type": "uint8" }
                ],
                "internalType": "struct RenderLock.Rental",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "name": "machines",
        "outputs": [
            { "internalType": "uint256", "name": "id", "type": "uint256" },
            { "internalType": "address", "name": "provider", "type": "address" },
            { "internalType": "string", "name": "specs", "type": "string" },
            { "internalType": "uint256", "name": "hourlyRate", "type": "uint256" },
            { "internalType": "bool", "name": "isListed", "type": "bool" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "PLATFORM_FEE_PERCENT",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "name": "rentals",
        "outputs": [
            { "internalType": "uint256", "name": "id", "type": "uint256" },
            { "internalType": "uint256", "name": "machineId", "type": "uint256" },
            { "internalType": "address", "name": "renter", "type": "address" },
            { "internalType": "address", "name": "provider", "type": "address" },
            { "internalType": "uint256", "name": "amountLocked", "type": "uint256" },
            { "internalType": "uint256", "name": "startTime", "type": "uint256" },
            { "internalType": "uint256", "name": "hoursRented", "type": "uint256" },
            { "internalType": "enum RenderLock.RentalStatus", "name": "status", "type": "uint8" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "rentalId", "type": "uint256" }],
        "name": "timeLeftToVerify",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "VERIFICATION_WINDOW",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }
];