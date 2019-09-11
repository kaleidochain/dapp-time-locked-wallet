//run:truffle test ./test/FactoryTest.js --network test2
const Factory = artifacts.require("./TimeLockedWalletFactory.sol");
const Wallet = artifacts.require("./TimeLockedWallet.sol");
let factory;
let creator;

contract('Factory contract',(accounts)=>{
    before(async () => {
        creator = accounts[0];
        factory = await Factory.new({from: creator});
    });
    
    it("Factory created contract is working well", async () => {
        let now = Now();
        //create(address _owner, address _manager, uint64 start, uint64 interval, uint64 _numInterval)
        let manager = accounts[1];
        let owner = accounts[2];
        let start = now;
        let interval = 10; //时间间隔
        let numInterval = 10; //解锁次数
//success
        var succ = await factory.create.call(owner,manager,start,interval,numInterval,{from:creator});
        assert(succ);
//require(interval>0)
        manager = accounts[1];owner = accounts[2];start = now;interval = 10;numInterval = 10;succ = false;
        
        interval = 0;
        try{
            succ = await factory.create.call(owner,manager,start,interval,numInterval);
        }catch(e){}
        assert(succ == false);
//require(numInterval>0)
        manager = accounts[1];owner = accounts[2];start = now;interval = 10;numInterval = 10;succ = false;
        
        numInterval = 0;  
        try{
            succ = await factory.create.call(owner,manager,start,interval,numInterval);
        }catch(e){}
        assert(succ == false); 
//empty mananger
        manager = accounts[1];owner = accounts[2];start = now;interval = 10;numInterval = 10;succ = false;

        manager = "";
        try{
            succ = await factory.create.call(owner,manager,start,interval,numInterval);
        }catch(e){}
        assert(succ);
//error manager
        manager = accounts[1];owner = accounts[2];start = now;interval = 10;numInterval = 10;succ = false;

        manager = "ab"; 
        try{
            succ = await factory.create.call(owner,manager,start,interval,numInterval);
        }catch(e){}
        assert(succ == false);
//empty owner
        manager = accounts[1];owner = accounts[2];s = now;i = 10;n = web3.toWei(1500);e = s+i*10;succ = false;
        owner = "";
        try{
            succ = await factory.create.call(owner,manager,start,interval,numInterval);
        }catch(e){}
        assert(succ == false);
//send kal
        manager = accounts[1];owner = accounts[2];start = now;interval = 10;numInterval = 10;succ = false;
        
        var ownerCountbf = await factory.getOwnedCount.call(owner);
        var managerCountbf = await factory.getManagedCount.call(manager);
        var creatorCountbf = await factory.getCreatedCount.call(creator);
        
        var receipt = await factory.create(owner,manager,start,interval,numInterval,{from:creator});
        assert(receipt.receipt.status*1 == 1);

        var ownerCountaf = await factory.getOwnedCount.call(owner);
        var managerCountaf = await factory.getManagedCount.call(manager);
        var creatorCountaf = await factory.getCreatedCount.call(creator);
      
        assert( ownerCountaf.eq(ownerCountbf.add(1)) );
        assert( managerCountaf.eq(managerCountbf.add(1)) );
        assert( creatorCountaf.eq(creatorCountbf.add(1)) );

        var wallets = await factory.getCreatedWallets.call(creator);
        var walletAddress = wallets[wallets.length-1];
        var wallet = await Wallet.at(walletAddress);
//creator send kal(success)
        var receipt = await wallet.sendTransaction({from:creator,value:web3.toWei(1),gas:1e7});
        assert(receipt.receipt.status*1 == 1);
//other address send kal(failure)
        var receipt = null;
        try{
            receipt = await wallet.sendTransaction({from:owner,value:1e18,gas:1e7});
        }catch(e){}
        assert(receipt ==  null || receipt.receipt.status*1 == 0);
    });
});

function Now(){
    var block = web3.eth.getBlock(web3.eth.blockNumber);
    //console.log(block.timestamp)
    return block.timestamp;
}