pragma solidity ^0.4.18;

import "./Miner.sol";
import "./Factory.sol";

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

    constructor(address _owner, uint64 s, uint64 i, uint64 n, uint64 e) public {
        require(_owner != address(0x0));
        require(e > s);
        require(i > 0);
        require((n*(e-s))/(e-s) == n);
        factory = msg.sender;
        owner = _owner;
        timeToStartUnlocking = s;
        timeInterval = i;
        amountOfEachUnlock = n;
        timeToUnlockAll = e;
    }

    function replaceOwner(address _newOwner) onlyOwner public returns(bool){
        require(Factory(factory).replaceOwner(owner,_newOwner));
        emit OwnerReplaced(owner,_newOwner);
        owner = _newOwner;
        return true;
    }

    function unlocked() public view returns(uint256 released){
        uint64 t = uint64(now);
        if (t < timeToStartUnlocking+timeInterval) {
            return 0;
        }
        uint totalBalance = address(this).balance+totalWithdrawals;
        if (t >= timeToUnlockAll){
            return totalBalance;
        }
        uint times = (t-timeToStartUnlocking)/timeInterval;
        released = amountOfEachUnlock*times;
        if(released > totalBalance){
            released = totalBalance;
        }
        return released;
    }

    function withdraw(uint _value) public onlyOwner returns(bool){
        require(_value <= (unlocked()-totalWithdrawals));
        totalWithdrawals += _value;
        msg.sender.transfer(_value);
        emit Withdrew(msg.sender, _value);
        return true;
    }

    function registerMiner(uint64 start,uint32 lifespan,bytes32 vrfVerifier,bytes32 voteVerifier) public onlyOwner returns(bool suc){
        suc = Miner(0x100000000000000000000000000002).set(start, lifespan, address(this), vrfVerifier,voteVerifier);
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
