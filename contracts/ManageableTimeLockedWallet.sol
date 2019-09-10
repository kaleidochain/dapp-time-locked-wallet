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

    constructor(address _owner, address _creator, address _manager, uint64 start, uint64 interval, uint64 _numInterval) TimeLockedWallet(_owner,_creator, start, interval, _numInterval) public {
        manager = _manager; // if 0x0, disable revoke function
    }

    function revoke(uint _value) onlyManager public returns(bool){
        if (msg.sender == 0x0) {
            return false;
        }

        require(_value <= address(this).balance);
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
