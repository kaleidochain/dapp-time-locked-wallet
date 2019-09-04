pragma solidity ^0.4.18;
import "./TimeLockedWallet.sol";

contract ManagerFactory{
    function replaceManager(address _manager,address _newManager) public returns(bool);
}

contract ManageableTimeLockedWallet is TimeLockedWallet{
    address public manager;

    event Revocation(address _manager,uint _value);
    event ManagerReplaced(address manager,address newManager);

    modifier onlyManager {
        require(msg.sender == manager);
        _;
    }

    constructor(address _owner,address _manager,uint64 s,uint64 i,uint n,uint64 e) TimeLockedWallet(_owner,s,i,n,e) public {
        factory = msg.sender;
        manager = _manager; // if 0x0, disable revoke function
    }

    //manager revoke locked balance
    function revoke(uint _value) onlyManager public returns(bool){
        require(_value <= address(this).balance-unlocked());
        msg.sender.transfer(_value);

        emit Revocation(msg.sender,_value);
        return true;
    }

    function replaceManager(address newManager) onlyManager public returns(bool){
        ManagerFactory(factory).replaceManager(msg.sender,newManager);
        manager = newManager;
        emit ManagerReplaced(msg.sender, newManager);
        return true;
    }
}
