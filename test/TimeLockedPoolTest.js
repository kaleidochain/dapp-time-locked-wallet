//run:truffle test ./test/TimeLockedPoolTest.js --network test2

//import { ContextReplacementPlugin } from "webpack";

const timelockpool = artifacts.require("TimeLockedPool.sol");
let empty = "0x0000000000000000000000000000000000000000";
let accounts = Array;
contract('TimeLockedPool contract',(account)=>{
    let pool;
    let now = Math.round(new Date() / 1000);
    let creator = account[0];
    accounts = account;

    before(async () => {
        //次数,间隔
        pool = await timelockpool.new(creator,creator,creator,now+20,10,10,{from: creator});
    });

    it("pool unlock test", async () => {
        var now = Now()
        var tpool = await timelockpool.new(creator,creator,creator,now-20,10,10,{from: creator});
        var receipt = await tpool.sendTransaction({from:creator,to:tpool.address,value:1e18});
        //var totalbalance = await web3.eth.getBalance(tpool.address);
        //
        await unlockedTest(tpool);
        //解锁一次
        var receipt = await tpool.unlock({from:creator});
        var unlockmount = 0;
        while(unlockmount==0){
            now = Now()
            unlockmount = await tpool.amountToUnlock(now);
            unlockmount= unlockmount*1;
        }
        //console.log("unlockmount",unlockmount*1)
        await unlockedTest(tpool);
    });
    
    it("pool revoke test", async () => {
        var tpool = await timelockpool.new(creator,creator,creator,now+20,10,10,{from: creator});
        var receipt = await tpool.sendTransaction({from:creator,to:tpool.address,value:1e18});
        var totalbalance = await web3.eth.getBalance(tpool.address);
        var manager = await tpool.manager();
        
        for(var i=0;i<accounts.length;i++){
            var succ = await tpool.revoke.call(totalbalance*1,{from:accounts[i]});
            if(accounts[i] == manager){
                assert.equal(succ,true,"只有manager能转出合约kal");
            } else {
                assert.equal(succ,false,"只有manager能转出合约kal");
            }
        }
    });
    it("pool replaceCreator test", async () => {
        creator = await pool.creator();
        //只能是合约creator 调用
        for(var i = 0; i < accounts.length;i++){
            var succ = await pool.replaceCreator.call(accounts[i],{from:accounts[i]});
            if(accounts[i] == creator){
                assert(succ == true);
            } else {
                assert(succ == false);
            }
        }
        //替换creator 不能为空
        for(var i = 0; i < accounts.length;i++){
            succ = await pool.replaceCreator.call(empty,{from:accounts[i]});
            assert(succ == false,"替换地址不能为空");
        }
    });

    it("pool replaceManager test", async () => {
        var manager = await pool.manager();
        //只能是合约manager 调用
        for(var i = 0; i < accounts.length;i++){
            var succ = await pool.replaceManager.call(accounts[i],{from:accounts[i]});
            if(accounts[i] == manager){
                assert(succ == true);
            } else {
                assert(succ == false);
            }

        }
        //替换manager的可以为空
        for(var i = 0; i < accounts.length;i++){
            succ = await pool.replaceManager.call(empty,{from:accounts[i]});
            if(accounts[i] == manager){
                assert.equal(succ , true,i+"  "+succ+"  "+manager+"  "+accounts[i])
            } else {
                assert.equal(succ , false,i+"  "+succ+"  "+manager+"  "+accounts[i])
            }
        }
    });

    it("pool transferProportion test", async () => {
        now = Math.round(new Date() / 1000);
        tpool = await timelockpool.new(creator,creator,creator,now+20,now+100,10,{from: creator});
        creator = await pool.creator();
        //条件测试
        await transferProportionTest(tpool,creator);
        //转让份额
        var testto = "0x0000000000000000000000000000000000000100";
        var prop1 = await tpool.proportions(creator);
        var prop2 = await tpool.proportions(testto);
        var receipt = await tpool.transferProportion(testto,1,{from:creator});
        //console.log(receipt)
        var prop3 = await tpool.proportions(creator);
        var prop4 = await tpool.proportions(testto);
        //console.log(prop1*1,prop2*1,prop3*1,prop4*1)
        assert.equal(prop1, prop3*1+1,"from份额转让错误");
        assert.equal(prop4, prop2*1+1,"to份额转让错误");
    });

    it("pool timeToInterval test", async () => {
        await timeToIntervalTest(pool);
    });
    it("pool amountToUnlock test", async () => {
        var tpool = await timelockpool.new(creator,creator,creator,now+20,10,10,{from: creator});
        var receipt = await tpool.sendTransaction({from:creator,to:tpool.address,value:1e18});
        await amountToUnlockTest(tpool);
    });
})

async function unlockedTest(tpool){
    var now = Now();
    
    for(var i=0; i<accounts.length;i++){
    
        var prop = await tpool.proportions(accounts[i]);
        var unlockmount = await tpool.amountToUnlock(now);
        var mount = await tpool.unlock.call({from:accounts[i]});
        //console.log(accounts[i],prop*1,mount*1,unlockmount*1);
        if(prop*1 ==0 ){
            assert.equal(mount*1,0,"有份额的用户才能解锁")
        } else {
            assert.equal(mount*1,unlockmount*1,"有份额的用户才能解锁");
        }
    }
    

}
async function amountToUnlockTest(tpool){
        var totalbalance = await web3.eth.getBalance(tpool.address);
        //console.log("totalbalance:",totalbalance*1)
        //开始时间
        var start = await tpool.timeToStartUnlocking()*1;
        //时间间隔
        var interval = await tpool.timeInterval()*1;
        //解锁次数
        var num = await tpool.numInterval()*1;
        //console.log(start,interval,num);
        var unlockednum = 0;
        var unlockedkal = 0;
        //unlockednum=0
        unlockednum = await tpool.timeToInterval(start+interval-1);
        unlockedkal = await tpool.amountToUnlock(start+interval-1);
        assert.equal(unlockedkal, 0,"还没开始解锁");
        //unlockednum=1
        unlockednum = await tpool.timeToInterval(start+interval);
        unlockedkal = await tpool.amountToUnlock(start+interval);
        assert.equal(unlockedkal*1, totalbalance*1/num,"开始解锁");
        //unlockednum=num
        unlockednum = await tpool.timeToInterval(start+interval*num);
        unlockedkal = await tpool.amountToUnlock(start+interval*num);
        //console.log(unlockedkal*1,totalbalance*1);
        assert.equal(unlockedkal*1, totalbalance*1,"全部解锁");
        //unlockednum=num
        unlockednum = await tpool.timeToInterval(start+interval*num+1);
        unlockedkal = await tpool.amountToUnlock(start+interval*num+1);
        //console.log(unlockedkal*1,totalbalance*1);
        assert.equal(unlockedkal*1, totalbalance*1,"最大解锁");
}
async function timeToIntervalTest(tpool){
    //开始时间
    var start = await tpool.timeToStartUnlocking()*1;
    //时间间隔
    var interval = await tpool.timeInterval()*1;
    //解锁次数
    var num = await tpool.numInterval()*1;

    var unlockednum = 0;
    
    unlockednum = await tpool.timeToInterval(start+interval-1);
    assert.equal(unlockednum*1, 0,"还没开始解锁");

    unlockednum = await tpool.timeToInterval(start+interval);
    assert.equal(unlockednum*1, 1,"开始解锁");
    
    unlockednum = await tpool.timeToInterval(start+interval*num);
    assert.equal(unlockednum*1, num,"全部解锁");
    
    unlockednum = await tpool.timeToInterval(start+interval*num+1);
    assert.equal(unlockednum*1, num,"最大解锁");
}



async function transferProportionTest(tpool,sender){
    var prop = await tpool.proportions(sender);
    if(prop == 0){return;}
    //to不能为空
    var succ = await tpool.transferProportion.call(empty,prop-1,{from:sender});
    assert.equal(succ, false,"份额不能转让空地址");
    //不能为自己转让
    for(var i=0;i<accounts.length;i++){
        var succ = await tpool.transferProportion.call(accounts[i],prop-1,{from:sender});
        if(accounts[i] == sender){
            assert.equal(succ, false,"份额不能转让给自己");
        } else {
            assert.equal(succ, true);
        }
    }
    //份额不能为0
    for(var i=0;i<accounts.length;i++){
        var succ = await tpool.transferProportion.call(accounts[i],0,{from:sender});
        assert.equal(succ, false,"份额不能为0");
    }
    //份额不能超过用户拥有的
    for(var i=0;i<accounts.length;i++){
        var succ = await tpool.transferProportion.call(accounts[i],prop+1,{from:sender});
        assert.equal(succ, false,"份额不能为0");
    }
}

function Now(){
    var block = web3.eth.getBlock(web3.eth.blockNumber);
    return block.timestamp;
}