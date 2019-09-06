//run:truffle test ./test/FactoryTest.js --network test2
const Factory = artifacts.require("./ManageableTimeLockedWalletFactory.sol");
let factory;
let creator;

contract('Factory contract',(accounts)=>{
    before(async () => {
        creator = accounts[0];
        factory = await Factory.new({from: creator});
    });
    
    it("Factory created contract is working well", async () => {
        let now = Now();
        //create(address _manager,address _owner,uint64 s,uint64 i,uint n,uint64 e)
        let manager = accounts[1];
        let owner = accounts[2];
        let s = now;
        let i = 10;
        let n = web3.toWei(1500);
        let e = s+i*10;
//success
        var succ = await factory.create.call(manager,owner,s,i,n,e);
        assert(succ);
        var receipt = await factory.create(manager,owner,s,i,n,e);
//require(i>0)
        i = 0;succ = false;        
        try{
            succ = await factory.create.call(manager,owner,s,i,n,e);
        }catch(e){}
        assert(succ == false);
//empty mananger
        manager = accounts[1];owner = accounts[2];s = now;i = 10;n = web3.toWei(1500);e = s+i*10;succ = false;
        manager = "";
        try{
            succ = await factory.create.call(manager,owner,s,i,n,e);
        }catch(e){}
        assert(succ);
//error manager
        manager = accounts[1];owner = accounts[2];s = now;i = 10;n = web3.toWei(1500);e = s+i*10;succ = false;
        manager = "ab";
        try{
            succ = await factory.create.call(manager,owner,s,i,n,e);
        }catch(e){}
        assert(succ == false);
//empty owner
        manager = accounts[1];owner = accounts[2];s = now;i = 10;n = web3.toWei(1500);e = s+i*10;succ = false;
        owner = "";
        try{
            succ = await factory.create.call(manager,owner,s,i,n,e);
        }catch(e){}
        assert(succ == false);
//require(e>s)
        manager = accounts[1];owner = accounts[2];s = now;i = 10;n = web3.toWei(1500);e = s+i*10;succ = false;
        e = s;
        try{
            succ = await factory.create.call(manager,owner,s,i,n,e);
        }catch(e){}
        assert(succ == false);
//require((n*(e-s))/(e-s) == n); // check overflow
        manager = accounts[1];owner = accounts[2];s = now;i = 10;n = web3.toWei(1500);e = s+i*10;succ = false;
        n=0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
        e = s + 0xfffffff
        try{
            succ = await factory.create.call(manager,owner,s,i,n,e);
        }catch(e){}
        assert(succ == false);
    });
});

function Now(){
    var block = web3.eth.getBlock(web3.eth.blockNumber);
    //console.log(block.timestamp)
    return block.timestamp;
}