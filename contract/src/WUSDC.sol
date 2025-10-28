// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title WUSDC – Faucet-style Wrapped USDC (testnet only)
/// @notice Users can mint 100 WUSDC once every 24 hours
contract WUSDC is ERC20 {
    // =============================================================
    //                         CONSTANTS
    // =============================================================

    uint256 public constant FIXED_AMOUNT = 100 ether;     // 100 WUSDC
    uint256 public constant ONE_DAY = 1 days;             // 24 hours

    // =============================================================
    //                         STORAGE
    // =============================================================

    address public owner;
    mapping(address => uint256) public lastMintTime;

    // =============================================================
    //                           EVENTS
    // =============================================================

    event MintRequested(address indexed user, uint256 amount);
    event Minted(address indexed to, uint256 amount);
    event OwnerMinted(address indexed to, uint256 amount);

    // =============================================================
    //                         MODIFIERS
    // =============================================================

    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    function _checkOwner() internal view {
        require(msg.sender == owner, "not owner");
    }

    // =============================================================
    //                         CONSTRUCTOR
    // =============================================================

    constructor() ERC20("Wrapped USDC", "WUSDC") {
        owner = msg.sender;
        // Optional: pre-mint to owner for liquidity
        _mint(msg.sender, 1_000_000 * 1e18);
    }

    // =============================================================
    //                         USER MINT
    // =============================================================

    /// @notice Mint 100 WUSDC once every 24 hours
    /// @param _to Recipient address
    function mint(address _to) external {
        require(_to != address(0), "zero address");

        uint256 last = lastMintTime[msg.sender];
        require(last == 0 || block.timestamp >= last + ONE_DAY, "wait 24h");

        emit MintRequested(msg.sender, FIXED_AMOUNT);

        _mint(_to, FIXED_AMOUNT);
        lastMintTime[msg.sender] = block.timestamp;

        emit Minted(_to, FIXED_AMOUNT);
    }

    // =============================================================
    //                       OWNER FUNCTIONS
    // =============================================================

    /// @notice Owner can mint arbitrary amount (for testing)
    /// @param _to Recipient
    /// @param _amount Amount in WUSDC (with 18 decimals)
    function ownerMint(address _to, uint256 _amount) external onlyOwner {
        require(_to != address(0), "zero address");
        uint256 amount = _amount * 1e18;

        _mint(_to, amount);
        emit OwnerMinted(_to, amount);
    }

    // Optional: Allow contract to receive ETH (for future extensions)
    receive() external payable {}
}