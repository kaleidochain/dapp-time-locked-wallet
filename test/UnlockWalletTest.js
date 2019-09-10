//run:truffle test ./test/FactoryTest.js --network test2
const Factory = artifacts.require("./ManageableTimeLockedWalletFactory.sol");
const Wallet = artifacts.require("./ManageableTimeLockedWallet.sol");
let creator;


contract('Wallet contract',(accounts)=>{
    before(async () => {
        creator = accounts[0];
    });
    
    it("Wallet contract replace test", async () => {
        let factory = await Factory.new({from: creator});
        let now = Now();
        //create(address _manager,address _owner,uint64 s,uint64 i,uint n,uint64 e)
        let manager = accounts[1];
        let owner = accounts[2];
        let s = now;
        let i = 10;
        let n = web3.toWei(1500);
        let e = s+i*10;
//create wallet
        var succ = await factory.create.call(manager,owner,s,i,n,e);
        assert(succ);
        var receipt = await factory.create(manager,owner,s,i,n,e);
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
    });


    it("Wallet contract unlocked test",async ()=>{
        //console.log(web3)
        let now = Now();
        let s = now;
        let i = 10;
        let n = web3.toWei(1);
        let e = s+i*10;
        let balance = 15;
        await unlockedTest(s,i,n,e,balance,accounts);
        
    });
    it("Wallet contract unlocked 1 test",async ()=>{
        let now = Now();
        let s = now;
        let i = 10;
        let n = web3.toWei(1);
        let e = s+i*10;
        let balance = 15;

        s = now + 5;
        balance = 8;
        await unlockedTest(s,i,n,e,balance,accounts);
    });
    it("Wallet contract unlocked 2 test",async ()=>{
        let now = Now();
        let s = now;
        let i = 10;
        let n = web3.toWei(1);
        let e = s+i*10;
        let balance = 15;

        n = web3.toWei(1500);
        balance = 20000;
        await unlockedTest(s,i,n,e,balance,accounts);

    });
    it("Wallet contract unlocked 3 test",async ()=>{
        let now = Now();
        let s = now;
        let i = 10;
        let n = web3.toWei(1);
        let e = s+i*10;
        let balance = 15;

        s = now-30;
        e = s+i*10;
        await unlockedTest(s,i,n,e,balance,accounts);

    });

    it("Wallet contract revoke test",async () =>{
        let now = Now();
        let s = now;
        let i = 10;
        let n = web3.toWei(1);
        let e = s+i*10;
        let balance = 15;
        await revokeTest(s,i,n,e,balance,accounts);
    })
    it("Wallet contract revoke 1 test",async () =>{
        let now = Now();
        let s = now;
        let i = 10;
        let n = web3.toWei(1);
        let e = s+i*10;
        let balance = 15;

        s = now + 5;
        balance = 8;
        await revokeTest(s,i,n,e,balance,accounts);
    })
    it("Wallet contract revoke 2 test",async () =>{
        let now = Now();
        let s = now;
        let i = 10;
        let n = web3.toWei(1);
        let e = s+i*10;
        let balance = 15;

        n = web3.toWei(1500);
        balance = 20000;
        await revokeTest(s,i,n,e,balance,accounts);
    })
    it("Wallet contract revoke 3 test",async () =>{
        let now = Now();
        let s = now;
        let i = 10;
        let n = web3.toWei(1);
        let e = s+i*10;
        let balance = 15;

        s = now-30;
        e = s+i*10;
        await revokeTest(s,i,n,e,balance,accounts);
    })

    it("Wallet contract withdraw test",async () =>{
        let now = Now();
        let s = now;
        let i = 10;
        let n = web3.toWei(1);
        let e = s+i*10;
        let balance = 15;
        await withdrawTest(s,i,n,e,balance,accounts);
    })
    it("Wallet contract withdraw 1 test",async () =>{
        let now = Now();
        let s = now;
        let i = 10;
        let n = web3.toWei(1);
        let e = s+i*10;
        let balance = 15;

        s = now + 5;
        balance = 8;
        await withdrawTest(s,i,n,e,balance,accounts);
    })
    it("Wallet contract withdraw 2 test",async () =>{
        let now = Now();
        let s = now;
        let i = 10;
        let n = web3.toWei(1);
        let e = s+i*10;
        let balance = 15;

        n = web3.toWei(1500);
        balance = 20000;
        await withdrawTest(s,i,n,e,balance,accounts);
    })
    it("Wallet contract withdraw 3 test",async () =>{
        let now = Now();
        let s = now;
        let i = 10;
        let n = web3.toWei(1);
        let e = s+i*10;
        let balance = 15;
    
        s = now-30;
        e = s+i*10;
        await withdrawTest(s,i,n,e,balance,accounts);
    })





});

function Now(){
    var block = web3.eth.getBlock(web3.eth.blockNumber);
    return block.timestamp;
}

async function unlockedTest(s,i,n,e,balance,accounts){
    n = web3.toBigNumber(n)
     let factory = await Factory.new({from: creator});
     let now;
     //create(address _manager,address _owner,uint64 s,uint64 i,uint n,uint64 e)
     let manager = accounts[1];
     let owner = accounts[2];
//create wallet
     var succ = await factory.create.call(manager,owner,s,i,n,e);
     assert(succ);
     var receipt = await factory.create(manager,owner,s,i,n,e);
     assert(receipt.receipt.status*1 == 1);
//instance wallet
     let wallets = await factory.getOwnedWallets(owner);
     assert(wallets.length > 0);
     var wallet = await Wallet.at(wallets[wallets.length-1]);
     
     var tx = await web3.eth.sendTransaction({from:accounts[0],to:wallet.address,value:web3.toWei(balance)});
     var tempreceipt = web3.eth.getTransactionReceipt(tx);
     while(tempreceipt == null){
        try{
            tempreceipt = web3.eth.getTransactionReceipt(tx);
        }catch(e){}
     }
     var pretotalUnlocked = await wallet.totalUnlocked.call();
     var prenow = Now();
     var totalUnlocked;
     while(true){
         try{
          now = Now();
          totalUnlocked = await wallet.totalUnlocked.call();
          balance = web3.eth.getBalance(wallet.address);
        }catch(e){continue;}
         if(now != prenow){
             if (now < s+i){
                 assert(totalUnlocked);
             } else if(now >= e){
                 //console.log(balance,totalUnlocked);
                 assert(balance+"" == totalUnlocked+"");
             } else {
                 //console.log(now,balance+"")
                 //console.log(n.mul(Math.floor((now-s)/i)) , totalUnlocked);
                 assert(n.mul(Math.floor((now-s)/i)).eq(totalUnlocked) || balance.eq(totalUnlocked));
             }
             prenow = now;
             pretotalUnlocked = totalUnlocked;
             //console.log(web3.eth.blockNumber,now,totalUnlocked*1);
         }
         if(now > await wallet.timeToUnlockAll.call()){
             break;
         }
     }
}

async function revokeTest(s,i,n,e,balance,accounts){
    let factory = await Factory.new({from: creator});
    let now;
    //create(address _manager,address _owner,uint64 s,uint64 i,uint n,uint64 e)
    let manager = accounts[1];
    let owner = accounts[2];

//create wallet
    var succ = await factory.create.call(manager,owner,s,i,n,e);
    assert(succ);
    var receipt = await factory.create(manager,owner,s,i,n,e);
    assert(receipt.receipt.status*1 == 1);
//instance wallet
    let wallets = await factory.getOwnedWallets(owner);
    assert(wallets.length > 0);
    var wallet = await Wallet.at(wallets[wallets.length-1]);
    var tx = web3.eth.sendTransaction({from:accounts[0],to:wallet.address,value:web3.toWei(balance)});
    var tempreceipt = web3.eth.getTransactionReceipt(tx);
    while(tempreceipt == null){
        try{
            tempreceipt = web3.eth.getTransactionReceipt(tx);
        }catch(e){}
    }
    //console.log(web3.eth.getBalance(wallet.address))
    //var pretotalUnlocked = await wallet.totalUnlocked.call();
    var prenow = Now();
    var totalUnlocked;
    var succ = false;
    var unlocked;
    while(true){
        try{
         now = Now();
         totalUnlocked = await wallet.totalUnlocked.call();
         unlocked = await wallet.unlocked.call()
         balance = web3.eth.getBalance(wallet.address);
        }catch(e){continue;}
        if(now != prenow){
            if (now < s+i){
                succ = false;
                try{
                    succ = await wallet.revoke.call(balance,{from:manager});
                }catch(e){}
                assert(succ);
            } else if(now >= e){
                succ = false;
                try{
                    succ = await wallet.revoke.call(1,{from:manager});
                }catch(e){}
                assert(succ == false);
            } else {
                var revoke = balance.sub(totalUnlocked)
                succ = await wallet.revoke.call(revoke,{from:manager});
                //console.log(balance*1,totalUnlocked*1,unlocked*1,revoke+1   );
                assert(succ);
                succ = false;
                try{
                    succ = await wallet.revoke.call(revoke.add(1),{from:manager});
                }catch(e){
                    try{
                        succ = await wallet.revoke.call(revoke,{from:eth.accounts[4]});
                    }catch(e){}
                }
                assert(succ == false);
            }
            prenow = now;
            pretotalUnlocked = totalUnlocked;
        }
        if(now > await wallet.timeToUnlockAll.call()){
            break;
        }
    }
}

async function withdrawTest(s,i,n,e,balance,accounts){
        let factory = await Factory.new({from: creator});
        let now;
        //create(address _manager,address _owner,uint64 s,uint64 i,uint n,uint64 e)
        let manager = accounts[1];
        let owner = accounts[2];

//create wallet
        var succ = await factory.create.call(manager,owner,s,i,n,e);
        assert(succ);
        var receipt = await factory.create(manager,owner,s,i,n,e);
        assert(receipt.receipt.status*1 == 1);
//instance wallet
        let wallets = await factory.getOwnedWallets(owner);
        assert(wallets.length > 0);
        var wallet = await Wallet.at(wallets[wallets.length-1]);
        var tx = await web3.eth.sendTransaction({from:accounts[0],to:wallet.address,value:web3.toWei(balance)});
        var tempreceipt = web3.eth.getTransactionReceipt(tx);
        while(tempreceipt == null){
            try{
                tempreceipt = web3.eth.getTransactionReceipt(tx);
            }catch(e){}
        }
        //console.log(web3.eth.getBalance(wallet.address))
        //var pretotalUnlocked = await wallet.totalUnlocked.call();
        var prenow = Now();
        var totalUnlocked;
        var succ = false;
        var unlocked;
        var totalWithdrawals;
        while(true){
            try{
             now = Now();
             totalUnlocked = await wallet.totalUnlocked.call();
             unlocked = await wallet.unlocked.call()
             balance = web3.eth.getBalance(wallet.address);
             totalWithdrawals = await wallet.totalWithdrawals.call();
            }catch(e){continue;}
            if(now != prenow){
                if (now < s+i){
                    assert(unlocked == 0);
                    succ = false;
                    try{
                        succ = await wallet.withdraw.call(1,{from:owner});
                    }catch(e){}
                    assert(succ == false);
                } else if(now >= e){
                    assert(unlocked.eq(balance));
                    succ = false;
                    succ = await wallet.withdraw.call(unlocked,{from:owner});
                    assert(succ);
                    succ = false;
                    try{
                        succ = await wallet.withdraw.call(unlocke,{from:accounts[4]})
                    }catch(e){}
                    assert(succ == false)
                } else {
                    assert(  totalUnlocked+"" == totalWithdrawals.add(unlocked)+"");
                    succ = await wallet.withdraw.call(unlocked,{from:owner});
                    assert(succ);
                    succ = false;
                    try{
                        succ = await wallet.withdraw.call(unlocked.add(1),{from:owner});
                    }catch(e){}
                    assert(succ == false);

                    succ = false;
                    try{
                        succ = await wallet.withdraw.call(unlocke,{from:accounts[4]})
                    }catch(e){}
                    assert(succ == false)

                    if(unlocked > 0){
                        var receipt = await wallet.withdraw(unlocked,{from:owner});
                        assert(receipt.receipt.status*1 == 1);
                        //console.log(await wallet.unlocked.call())
                    }
                }
                prenow = now;
                pretotalUnlocked = totalUnlocked;
            }
            if(now > await wallet.timeToUnlockAll.call()){
                break;
            }
        }
}