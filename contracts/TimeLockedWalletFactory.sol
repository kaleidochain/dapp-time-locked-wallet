pragma solidity ^0.4.18;

import "./TimeLockedWallet.sol";

contract TimeLockedWalletFactory {

    mapping(address => address[]) public walletsOfCreator;
    mapping(address => address[]) public walletsOfOwner;

    event Instantiation(address sender, address wallet);

    function create(address owner,uint64 start, uint64 interval, uint64 _numInterval) public returns(bool){
        address wallet = new TimeLockedWallet(owner, msg.sender, start, interval, _numInterval);

        walletsOfCreator[msg.sender].push(wallet);
        walletsOfOwner[owner].push(wallet);
        emit Instantiation(msg.sender, wallet);
        return true;
    }

    function replaceOwner(address _owner, address _newOwner) public returns(bool) {
        uint n = remove(walletsOfOwner[_owner], msg.sender);
        require(n != 0);

        walletsOfOwner[_newOwner].push(msg.sender);

        return true;
    }

    function getOwnedCount(address owner) public view returns(uint){
        return walletsOfOwner[owner].length;
    }

    function getOwnedWallets(address owner) public view returns(address[]){
        return walletsOfOwner[owner];
    }

    function replaceCreator(address _creator, address _newCreator) public returns(bool) {
        uint n = remove(walletsOfOwner[_creator], msg.sender);
        require(n != 0);

        walletsOfOwner[_newCreator].push(msg.sender);

        return true;
    }

    function getCreatedCount(address creator) public view returns(uint){
        return walletsOfCreator[creator].length;
    }

    function getCreatedWallets(address creator) public view returns(address[]){
        return walletsOfCreator[creator];
    }

    /**
     * internal functions
     */

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
