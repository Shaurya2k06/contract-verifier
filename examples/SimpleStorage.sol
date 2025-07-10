// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SimpleStorage
 * @dev A simple contract for testing contract verification
 */
contract SimpleStorage {
    uint256 private storedData;
    address public owner;
    
    event DataStored(uint256 indexed value, address indexed setter);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    constructor(uint256 _initialValue) {
        storedData = _initialValue;
        owner = msg.sender;
    }
    
    /**
     * @dev Store a value
     * @param _value The value to store
     */
    function store(uint256 _value) public onlyOwner {
        storedData = _value;
        emit DataStored(_value, msg.sender);
    }
    
    /**
     * @dev Retrieve the stored value
     * @return The stored value
     */
    function retrieve() public view returns (uint256) {
        return storedData;
    }
    
    /**
     * @dev Get contract info
     * @return owner address and stored value
     */
    function getInfo() public view returns (address, uint256) {
        return (owner, storedData);
    }
}
