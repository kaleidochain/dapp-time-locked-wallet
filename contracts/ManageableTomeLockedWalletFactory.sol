pragma solidity ^0.4.18;
import "./ManageableTimeLockedWallet.sol";
import "./TimeLockedWalletFactory.sol";
contract ManageableTimeLockedWalletFactory is TimeLockedWalletFactory{
    mapping(address => address[]) public walletsOfManager;

    function create(address _manager,address _owner,uint64 s,uint64 i,uint64 n,uint64 e) public returns(bool) {
        address wallet = new ManageableTimeLockedWallet(_owner,_manager,s,i,n,e);
        walletsOfCreator[msg.sender].push(wallet);
        walletsOfOwner[_owner].push(wallet);
        
        if(_manager != address(0x0)) {
            walletsOfManager[_manager].push(wallet);
        }

        emit Instantiation(msg.sender,wallet);
        return true;
    }


    function replaceManager(address _manager, address _newManager) public returns(bool){
        if (remove(walletsOfManager[_manager],msg.sender) == 0){
            return false;
        }
        if(_manager != address(0x0)) {
            walletsOfManager[_newManager].push(msg.sender);
        }
        return true;
    }

    function getManagedCount(address _manager)public view returns(uint){
        return walletsOfManager[_manager].length;
    }

    function getManagedWallets(address _manager)public view returns(address[]){
        return walletsOfManager[_manager];
    }
    
    function remove(address[] storage list,address item) internal returns(uint affected){
        for(uint i = 0; i < list.length; i++){
            if(list[i] == item){
                list[i] = list[list.length-1];
                list.length--;
                affected++;
                break;
            }
        }
        return affected;
    }
}