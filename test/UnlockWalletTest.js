//run:truffle test ./test/FactoryTest.js --network test2
const Factory = artifacts.require("./TimeLockedWalletFactory.sol");
const Wallet = artifacts.require("./TimeLockedWallet.sol");
let creator;


contract('Wallet contract',(accounts)=>{
    before(async () => {
        creator = accounts[0];
    });
    
    it("Wallet contract replace test", async () => {
        let factory = await Factory.new({from: creator});
        let now = Now();
        let manager = accounts[1];
        let owner = accounts[2];
        let start = now;
        let interval = 10; //时间间隔
        let numInterval = 10; //解锁次数
//create wallet
        var succ = await factory.create.call(owner,manager,start,interval,numInterval,{from:creator});
        assert(succ);
        var receipt = await factory.create(owner,manager,start,interval,numInterval,{from:creator});
        assert(receipt.receipt.status*1 == 1);
//instance wallet
        let wallets = await factory.getOwnedWallets(owner);
        assert(wallets.length > 0);
        var wallet = await Wallet.at(wallets[wallets.length-1]);
//replace manager
        succ = await wallet.replaceManager.call(accounts[3],{from:manager})
        assert(succ)
        succ = await wallet.replaceManager.call(accounts[3],{from:accounts[5]})
        assert(succ == false)
        await wallet.replaceManager(accounts[3],{from:manager})
        manager = accounts[3];
        wallets = await factory.getManagedWallets.call(manager);
        assert(wallets[wallets.length-1] == wallet.address);
//replace owner
        succ = await wallet.replaceOwner.call(accounts[4],{from:owner})
        assert(succ)
        succ = await wallet.replaceOwner.call(accounts[4],{from:accounts[5]})
        assert(succ == false)
        await wallet.replaceOwner(accounts[4],{from:owner});
        owner = accounts[4];
        wallets = await factory.getOwnedWallets(owner);
        assert(wallets[wallets.length-1] == wallet.address,"replaceOwner failure");
//replace creator
        succ = await wallet.replaceCreator.call(accounts[4],{from:creator})
        assert(succ)
        succ = await wallet.replaceCreator.call(accounts[4],{from:accounts[5]})
        assert(succ == false)
        await wallet.replaceCreator(accounts[4],{from:creator});
        wallets = await factory.getCreatedWallets(accounts[4]);
        assert(wallets[wallets.length-1] == wallet.address,"replaceCreator failure");
    });

    it("Wallet contract unlocked test",async ()=>{
        //console.log(web3)
        let now = Now();
        let start = now;
        let interval = 10; //时间间隔
        let numInterval = 10; //解锁次数
        let balance = 15;
        await unlockedTest(start,interval,numInterval,balance,accounts);
        
    });
    it("Wallet contract unlocked 1 test",async ()=>{
        let now = Now();
        let start = now;
        let interval = 10; //时间间隔
        let numInterval = 10; //解锁次数
        let balance = 15;

        balance = 20000;
        await unlockedTest(start,interval,numInterval,balance,accounts);
    });
    
    it("Wallet contract unlocked 2 test",async ()=>{
        let now = Now();
        let start = now;
        let interval = 10; //时间间隔
        let numInterval = 10; //解锁次数
        let balance = 15;

        start = now-30;
        await unlockedTest(start,interval,numInterval,balance,accounts);
    });

    it("Wallet contract withdraw test",async () =>{
        let now = Now();
        let start = now;
        let interval = 10; //时间间隔
        let numInterval = 10; //解锁次数
        let balance = 15;
        await withdrawTest(start,interval,numInterval,balance,accounts);
    })
 
    it("Wallet contract withdraw 1 test",async () =>{
        let now = Now();
        let start = now;
        let interval = 10; //时间间隔
        let numInterval = 10; //解锁次数
        let balance = 15;

        start = now + 5;
        balance = 8;
        await withdrawTest(start,interval,numInterval,balance,accounts);
    })
    it("Wallet contract withdraw 2 test",async () =>{
        let now = Now();
        let start = now;
        let interval = 10; //时间间隔
        let numInterval = 10; //解锁次数
        let balance = 15;

        balance = 20000;
        await withdrawTest(start,interval,numInterval,balance,accounts);
    })
    
    it("Wallet contract withdraw 3 test",async () =>{
        let now = Now();
        let start = now;
        let interval = 10; //时间间隔
        let numInterval = 10; //解锁次数
        let balance = 15;

        start = now-30;
        await withdrawTest(start,interval,numInterval,balance,accounts);
    })

});

function Now(){
    var block = web3.eth.getBlock(web3.eth.blockNumber);
    return block.timestamp;
}

async function unlockedTest(start,interval,numInterval,amount,accounts){
    let factory = await Factory.new({from: creator});
    let now;
    //create(address _manager,address _owner,uint64 s,uint64 i,uint n,uint64 e)
    let manager = accounts[1];
    let owner = accounts[2];
//create wallet
    var succ = await factory.create.call(owner,manager,start,interval,numInterval,{from:creator});
    assert(succ);
    var receipt = await factory.create(owner,manager,start,interval,numInterval,{from:creator});
    assert(receipt.receipt.status*1 == 1);
//instance wallet
    let wallets = await factory.getOwnedWallets(owner);
    assert(wallets.length > 0);
    var wallet = await Wallet.at(wallets[wallets.length-1]);

    await wallet.sendTransaction({from:creator,to:wallet.address,value:web3.toWei(amount)});

    var unlock;
    var prenow = Now();
    var balance;
    while(true){
        try{
        now = Now();
        unlock = await wallet.unlock.call({from:creator});
        balance = web3.eth.getBalance(wallet.address);
    }catch(e){continue;}
        if(now != prenow){
            if (now < start+interval){
                assert(unlock == 0);
            } else if(now >= start+interval*numInterval){
                //console.log(balance,unlock);
                assert(balance.eq(unlock));
            } else {
                //console.log(now,balance.toString(10),unlock.toString(10));
                assert(balance.mul( Math.floor((now-start)/interval) / numInterval ).eq(unlock));
            }
            if(balance>0){
                var succ = await wallet.revoke.call(balance,{from:manager});
                assert(succ);
                succ = false;
                try{
                    succ = await wallet.revoke.call(balance,{from:accounts[4]});
                }catch(e){}
                assert(succ == false);

                try{
                    succ = await wallet.revoke.call(balance.add(1),{from:manager});
                }catch(e){}
                assert(succ == false);
            }
            if(unlock > 0){
                unlock = await wallet.unlock.call({from:creator});
                assert(unlock > 0)
                unlock = await wallet.unlock.call({from:owner});
                assert(unlock > 0)
                unlock = 0;

                unlock = await wallet.unlock.call({from:manager});
                assert(unlock == 0);
            }
            
            prenow = now;
        }
        if(now > start+interval*numInterval){
            unlock = await wallet.unlock.call({from:owner});
            var balanceOfOwner = await web3.eth.getBalance(owner);

            var receipt = await wallet.unlock({from:creator});
            var unlocked = await wallet.unlock.call({from:creator});
            assert(unlocked.eq(0))
            
            var walletBalance = await web3.eth.getBalance(wallet.address);
            assert(walletBalance.eq(0))
            var balanceOfOwner2 = await web3.eth.getBalance(owner);
            //console.log(unlock.toString(10),balanceOfOwner.toString(10),balanceOfOwner2.toString(10))
            assert(balanceOfOwner.add(unlock).eq(balanceOfOwner2))
            break;
        }
    }
}

async function withdrawTest(start,interval,numInterval,amount,accounts){
    let factory = await Factory.new({from: creator});
    let now;
    //create(address _manager,address _owner,uint64 s,uint64 i,uint n,uint64 e)
    let manager = accounts[1];
    let owner = accounts[2];
//create wallet
    var succ = await factory.create.call(owner,manager,start,interval,numInterval,{from:creator});
    assert(succ);
    var receipt = await factory.create(owner,manager,start,interval,numInterval,{from:creator});
    assert(receipt.receipt.status*1 == 1);
//instance wallet
    let wallets = await factory.getOwnedWallets(owner);
    assert(wallets.length > 0);
    var wallet = await Wallet.at(wallets[wallets.length-1]);

    await wallet.sendTransaction({from:creator,to:wallet.address,value:web3.toWei(amount)});

    var unlock;
    var prenow = Now();
    var balance;
    var lastime
    while(true){
        try{
        now = Now();
        unlock = await wallet.unlock.call({from:creator});
        balance = web3.eth.getBalance(wallet.address);
        lastime = await wallet.lastUnlockTime.call();
    }catch(e){continue;}
        if(now != prenow){
            if (now < start+interval){
                assert(unlock == 0);
            } else if(now >= start+interval*numInterval){
                //console.log(balance,unlock);
                assert(balance.eq(unlock));
            } else {
                //console.log(now,balance.toString(10),unlock.toString(10));
                var withdrew = 0;
                if(lastime > 0){
                    withdrew = Math.floor((lastime-start)/interval);
                }
                var unlocked = Math.floor((now-start)/interval);
                //console.log(now,unlock.toString(10),withdrew,unlocked,(unlocked-withdrew)/numInterval)
                //console.log(balance.mul((unlocked-withdrew)/numInterval).toString(10),unlock.toString(10))
                //console.log(balance.div(numInterval-withdrew).mul(unlocked-withdrew).toString(10),unlock.toString(10))
                assert(balance.div(numInterval-withdrew).mul(unlocked-withdrew).eq(unlock));
            }
            if(balance>0){
                var succ = await wallet.revoke.call(balance,{from:manager});
                assert(succ);

                succ = false;
                try{
                    succ = await wallet.revoke.call(balance,{from:accounts[4]});
                }catch(e){}
                assert(succ == false);

                try{
                    succ = await wallet.revoke.call(balance.add(1),{from:manager});
                }catch(e){}
                assert(succ == false);
            }
            if(unlock > 0){
                //console.log(unlock,"000")
                //unlock = await wallet.unlock.call({from:creator});
                var ret = await wallet.unlock.call({from:creator});
                assert(ret > 0)
                ret = await wallet.unlock.call({from:owner});
                assert(ret > 0)

                ret = 0;
                ret = await wallet.unlock.call({from:manager});
                assert(ret == 0);

                var balanceofOwner = await web3.eth.getBalance(owner);
                var banlanceOfWallet = await web3.eth.getBalance(wallet.address);
                var receipt = await wallet.unlock({from:creator});
                assert(receipt.receipt.status*1 == 1);
                var balanceOfOwner2 = await web3.eth.getBalance(owner);
                var banlanceOfWallet2 = await web3.eth.getBalance(wallet.address);
                //console.log(balanceofOwner.toString(10),unlock.toString(10),balanceOfOwner2.toString(10))
                
                assert(balanceOfOwner2.add(banlanceOfWallet2).eq(balanceofOwner.add(banlanceOfWallet)));
                var unlocked = await wallet.unlock.call({from:creator});
                assert(unlocked.eq(0))
            }
            prenow = now;
        }
        if(now > start+interval*numInterval){
            var unlocked = await wallet.unlock.call({from:creator});
            assert(unlocked.eq(0));
            break;
        }
    }
}