pragma solidity ^0.4.18;

contract Factory {
    function replaceOwner(address _owner,address _newOnwer) public returns(bool);
}
contract Miner {
    function set(uint64 start, uint32 lifespan, address coinbase, bytes32 vrfVerifier, bytes32 voteVerifier) public returns(bool);
}

contract TimeLockedWallet {

    address public factory;
    address public owner;

    uint64  public timeToStartUnlocking;
    uint64  public timeInterval;
    uint64  public timeToUnlockAll;
    uint    public amountOfEachUnlock;
    uint    public totalWithdrawals;

    event Deposit(address sender,uint256 value);
    event Withdrew(address owner,uint256 value);
    event OwnerReplaced(address owner,address newOwner);
    event MinerRegistered(address owner);

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }
    modifier notNull(address addr) {
        require(addr != 0);
        _;
    }

    constructor(address _owner, uint64 s, uint64 i, uint n, uint64 e) notNull(_owner) public {
        require(e > s);
        require(i > 0);
        require((n*(e-s))/(e-s) == n); // check overflow
        factory = msg.sender;
        owner = _owner;
        timeToStartUnlocking = s;
        timeInterval = i;
        amountOfEachUnlock = n;
        timeToUnlockAll = e;
    }

    function replaceOwner(address _newOwner) onlyOwner notNull(_newOwner) public returns(bool){
        Factory(factory).replaceOwner(owner,_newOwner);
        owner = _newOwner;
        emit OwnerReplaced(msg.sender, _newOwner);
        return true;
    }

    //all the unlocked balance(include withdrawls)
    function totalUnlocked() public view returns(uint){
        uint64 t = uint64(now);
        if (t < timeToStartUnlocking+timeInterval) {
            return 0;
        }
        uint totalBalance = address(this).balance+totalWithdrawals;
        if (t >= timeToUnlockAll){
            return totalBalance;
        }
        uint times = (t-timeToStartUnlocking)/timeInterval;
        uint released = amountOfEachUnlock*times;
        if(released > totalBalance){
            released = totalBalance;
        }
        return released;
    }

    function unlocked() public view returns(uint) {
        uint total = totalUnlocked();
        assert(total >= totalWithdrawals);
        uint available = total - totalWithdrawals;
        assert(available <= address(this).balance);
        return available;
    }

    function withdraw(uint _value) public onlyOwner returns(bool){
        require(_value <= unlocked());
        totalWithdrawals += _value;
        msg.sender.transfer(_value);
        emit Withdrew(msg.sender, _value);
        return true;
    }

    function registerMiner(uint64 start,uint32 lifespan,bytes32 vrfVerifier,bytes32 voteVerifier) public onlyOwner returns(bool suc){
        suc = Miner(0x1000000000000000000000000000000000000002).set(start, lifespan, address(this), vrfVerifier,voteVerifier);
        if(suc){
            emit MinerRegistered(owner);
        }
        return suc;
    }

    function() public payable {
        if(msg.value > 0){
            emit Deposit(msg.sender, msg.value);
        }
    }
}
