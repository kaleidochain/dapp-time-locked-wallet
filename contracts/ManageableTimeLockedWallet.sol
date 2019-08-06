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
    constructor(address _owner,address _manager,uint64 s,uint64 i,uint64 n,uint64 e) TimeLockedWallet(_owner,s,i,n,e) public {
        require(_owner != address(0x0));
        factory = msg.sender;
        manager = _manager;
    }
    function revoke(uint _value) onlyManager public returns(bool){
        require(_value <= address(this).balance-unlocked());
        msg.sender.transfer(_value);

        emit Revocation(msg.sender,_value);
        return true;
    }
    function replaceManager(address newManager) onlyManager public returns(bool){
        require(ManagerFactory(factory).replaceManager(msg.sender,newManager));
        ManagerReplaced(manager,newManager);
        manager = newManager;
        return true;
    }
}