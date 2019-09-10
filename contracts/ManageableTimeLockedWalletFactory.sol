pragma solidity ^0.4.18;

import "./ManageableTimeLockedWallet.sol";
import "./TimeLockedWalletFactory.sol";

contract ManageableTimeLockedWalletFactory is TimeLockedWalletFactory{
    mapping(address => address[]) public walletsOfManager;

    function create(address _owner, address _manager, uint64 start, uint64 interval, uint64 _numInterval) public returns(bool) {
        address wallet = new ManageableTimeLockedWallet(_owner, msg.sender, _manager, start, interval, _numInterval);

        walletsOfCreator[msg.sender].push(wallet);
        walletsOfOwner[_owner].push(wallet);

        if(_manager != 0) {
            walletsOfManager[_manager].push(wallet);
        }

        emit Instantiation(msg.sender, wallet);
        return true;
    }

    function replaceManager(address _manager, address _newManager) public returns(bool){
        uint n = remove(walletsOfManager[_manager],msg.sender);
        require(n != 0);

        if(_manager != 0) {
            walletsOfManager[_newManager].push(msg.sender);
        }
        return true;
    }

    function getManagedCount(address _manager) public view returns(uint){
        return walletsOfManager[_manager].length;
    }

    function getManagedWallets(address _manager) public view returns(address[]){
        return walletsOfManager[_manager];
    }
}
