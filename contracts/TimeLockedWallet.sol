pragma solidity ^0.4.18;

contract Factory {
    function replaceOwner(address _owner,address _newOnwer) public returns(bool);
    function replaceCreator(address _creator, address _newCreator) public returns(bool);
}

contract Miner {
    function set(uint64 start, uint32 lifespan, address coinbase, bytes32 vrfVerifier, bytes32 voteVerifier) public returns(bool);
}

contract TimeLockedWallet {

    address public factory;
    address public owner;
    address public creator;

    uint64 public timeToStartUnlocking;
    uint64 public timeInterval;
    uint64 public numInterval;
    uint64 public lastUnlockTime;

    uint public totalWithdrawals;

    event Deposit(address sender,uint256 value);
    event Withdrew(address owner,uint256 value);
    event OwnerReplaced(address owner,address newOwner);
    event CreatorReplaced(address creator,address newCreator);
    event MinerRegistered(address owner);

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }
    modifier onlyCreator {
        require(msg.sender == creator);
        _;
    }
    modifier notNull(address addr) {
        require(addr != 0);
        _;
    }
    modifier creatorOrOwner {
        require(msg.sender == owner || msg.sender == creator);
        _;
    }

    constructor(address _owner, address _creator, uint64 start, uint64 interval, uint64 _numInterval) public {
        require(numInterval > 0);
        require(interval > 0);

        factory = msg.sender;
        owner = _owner;
        creator = _creator;

        timeToStartUnlocking = start;
        timeInterval = interval;
        numInterval = _numInterval;
        lastUnlockTime = 0;

        totalWithdrawals = 0;
    }

    function replaceOwner(address _newOwner) onlyOwner notNull(_newOwner) public returns(bool){
        Factory(factory).replaceOwner(owner, _newOwner);
        owner = _newOwner;
        emit OwnerReplaced(msg.sender, _newOwner);
        return true;
    }

    function replaceCreator(address _newCreator) onlyCreator notNull(_newCreator) public returns(bool) {
        Factory(factory).replaceCreator(creator, _newCreator);
        creator = _newCreator;
        emit CreatorReplaced(msg.sender, _newCreator);
    }

    function registerMiner(uint64 start,uint32 lifespan,bytes32 vrfVerifier,bytes32 voteVerifier) public onlyOwner returns(bool suc){
        suc = Miner(0x1000000000000000000000000000000000000002).set(start, lifespan, address(this), vrfVerifier,voteVerifier);
        if(suc){
            emit MinerRegistered(owner);
        }
        return suc;
    }

    // [0, numInterval]
    function timeToInterval(uint64 t) internal view returns(uint) {
        if (t < timeToStartUnlocking) {
            return 0;
        }
        uint id = (t - timeToStartUnlocking) / timeInterval;
        if (id > numInterval) {
            id = numInterval;
        }
        return id;
    }

    function amountToUnlock(uint64 currTime) internal view returns(uint) {
        // already unlocked before
        if(currTime <= lastUnlockTime) {
            return 0;
        }

        // already unlocked all
        uint lastInterval = timeToInterval(lastUnlockTime);
        if (lastInterval >= numInterval) {
            return address(this).balance;
        }

        // not start unlocking or already unlocked before
        uint currInterval = timeToInterval(currTime);
        if (currInterval <= lastInterval) {
            return 0;
        }

        uint leftInterval = numInterval - lastInterval;
        uint amount = address(this).balance * (currInterval - lastInterval) / leftInterval;
        return amount;
    }

    function unlock() public creatorOrOwner returns(uint) {
        uint amount = amountToUnlock(uint64(now));
        if (amount == 0) {
            return 0;
        }
        require(amount <= address(this).balance);

        lastUnlockTime = uint64(now); //critical update

        totalWithdrawals += amount;
        owner.transfer(amount);
        emit Withdrew(owner, amount);

        return amount;
    }

    // TODO: test failure
    function() public onlyCreator payable {
        if(msg.value > 0){
            emit Deposit(msg.sender, msg.value);
        }
    }
}
