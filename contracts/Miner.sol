contract Miner {

    /// set saves miner info with the interval. The miner will starts mining
    /// from height `start`, and the coinbase will gains the rewards. When
    /// updating, new start must be less than or equals to origin start.
    ///
    /// @return true if success, false if fail.
    function set(uint64 start, uint32 lifespan, address coinbase, bytes32 vrfVerifier, bytes32 voteVerifier) public returns(bool);

    /// setCoinbase updates the miner's coinbase in interval of `number`, fail
    /// if the interval has expired or not exists.
    ///
    /// @param number - any number of the interval to be modified
    ///
    /// @return true if success, false otherwise.
    function setCoinbase(uint256 number, address coinbase) public returns(bool);

    /// get returns the miner info registed for block `number`
    ///
    /// @param number - any number of the interval to be modified
    ///
    /// @return miner info
    function get(uint256 number, address miner) public view returns(uint64, uint32, address, bytes32, bytes32);

    // isMinerOfHeight returns true if addr is a miner of the block number
    function isMinerOfHeight(uint256 number, address addr) public view returns(bool);

    function getNewAddedMinersCount(uint256 number) public view returns(uint);

    function getNewAddedMiner(uint256 number, uint32 index) public view returns(address miner);
}