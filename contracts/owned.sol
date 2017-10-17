pragma solidity ^0.4.0;

contract owned {
    address owner;

    modifier onlyowner() {
        require(msg.sender == owner);
        _;
    }

    function owned() {
        owner = msg.sender;
    }
}