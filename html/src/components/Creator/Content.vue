<template>
    <v-content>
      <v-container  grid-list-xs  style="max-width:100%">
        <v-layout row  justify-center>
          <v-flex d-flex xs12 sm12 md12  xl10>
            <v-card >
              <v-toolbar color="blue darken-3" dark>
                <v-toolbar-title>Wallets List</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn :disabled="viewmodel" round color="primaty" outline class="mb-2"  @click="dialog = true">New Wallets</v-btn>
              </v-toolbar>

              <v-card-text class="px-0">
                  <v-data-table
                    :headers="headers"
                    :items="walletlist"
                    hide-actions
                    :pagination.sync="pagination"
                    class="elevation-1"
                  >
                    <template v-slot:items="props">

                      <td class="text-xs-center"><span style="vertical-align: middle;max-width: 80px; display: inline-block; overflow: hidden; text-overflow: ellipsis;">{{ props.item.address }}</span>
                      </td>

                      <td class="text-xs-center"><span style="vertical-align: middle;max-width: 80px; display: inline-block; overflow: hidden; text-overflow: ellipsis;">{{ props.item.owner }}</span>

                      </td>
                      <td class="text-xs-center"><span style="vertical-align: middle;max-width: 80px; display: inline-block; overflow: hidden; text-overflow: ellipsis;">{{ props.item.manager=="0x0000000000000000000000000000000000000000"?"":props.item.manager }}</span>

                      <td class="text-xs-center">
                        <span style="vertical-align: middle;max-width: 80px; display: inline-block; overflow: hidden; text-overflow: ellipsis;">{{ props.item.creator }}</span>

                        <v-btn  :disabled="viewmodel" small outline color="info" style="padding:0;height: 25px;min-width: 40px;" @click="dialog_replaceCreator = true;dialog_item=props.item;">
                            编辑
                        </v-btn>

                      </td>

                      <td class="text-xs-center">
                        {{ todate(props.item.timeToStartUnlocking)}}
                      </td>

                      <td class="text-xs-center">
                        {{ props.item.timeInterval>=86400?Math.floor(props.item.timeInterval/86400)+"d ":""}}
                        {{ props.item.timeInterval>=3600?Math.floor((props.item.timeInterval%86400)/3600)+"h ":""}}
                        {{ props.item.timeInterval>=60?Math.floor((props.item.timeInterval%3600)/60)+"m ":""}}
                        {{ props.item.timeInterval%60+"s"}}
                        * 
                        {{props.item.numInterval}}
                      </td>
                      
                      <td class="text-xs-center">{{ web3.utils.fromWei(props.item.balance) }}
                          <v-btn :disabled="viewmodel" small flat outline color="info" @click="dialog_sendTransaction = true;dialog_item=props.item;" style="height: 25px;min-width: 40px;font-size: 12px;">
                            转入
                          </v-btn>

                      </td>

                      <td class="text-xs-center">{{ web3.utils.fromWei(props.item.unlock) }}
                        <v-btn  :disabled="viewmodel"  small flat  color="info"  outline style="padding:0;height: 25px;min-width: 40px;font-size: 12px;" @click="dialog_withdraw=true;dialog_item=props.item;wallet.withdraw=(web3.utils.fromWei(props.item.unlock))">代提取</v-btn>
                      </td>
                      <td class="text-xs-center">
                          {{ web3.utils.fromWei(props.item.totalWithdrawals) }}
                      </td>
                    </template>
                  </v-data-table>
                  <div class="text-xs-right pt-2">
                    <v-pagination v-model="pagination.page" :length="pages"></v-pagination>
                  </div>
              </v-card-text>


            </v-card>
          </v-flex>
         
        </v-layout>


      </v-container>
      
      <v-dialog v-model="dialog" max-width="450">
        <v-card>
          <v-card-title class="headline">New Wallet</v-card-title>
  
          <v-card-text>
            <v-text-field v-model="wallet.Manager" label="Manager"></v-text-field>  
            <v-text-field v-model="wallet.Owner" label="Owner"></v-text-field>  
            <v-text-field v-model="wallet.TimeToStartUnlocking" label="TimeToStartUnlocking (timestamp)"></v-text-field>  
            <v-text-field v-model="wallet.Interval" label="Interval (secs)"></v-text-field>  
            <v-text-field v-model="wallet.numInterval" label="numInterval "></v-text-field>  
          </v-card-text>
  
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="info" @click="creatWallet">Send</v-btn>
            <v-btn color="error" @click="dialog = false">Cancel</v-btn>

          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="dialog_replaceCreator" max-width="450">
        <v-card>
          <v-card-title class="headline">Replace Creator</v-card-title>
  
          <v-card-text>
            <v-text-field v-model="wallet.Creator" label="New Creator"></v-text-field>  
          </v-card-text>
  
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="info" @click="replaceCreator">Send</v-btn>
            <v-btn color="error" @click="dialog_replaceCreator = false">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>


      <v-dialog v-model="dialog_sendTransaction" max-width="450">
        <v-card>
          <v-card-title class="headline">Send Transaction</v-card-title>
  
          <v-card-text>
            <v-text-field v-model="wallet.Value" label="Value (KAL)"></v-text-field>  

          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="info" @click="sendTransaction">Send</v-btn>
            <v-btn color="error" @click="dialog_sendTransaction = false">Cancel</v-btn>

          </v-card-actions>
        </v-card>
      </v-dialog>
      
       <v-dialog v-model="dialog_withdraw" max-width="450">
        <v-card>
          <v-card-title class="headline">Withdraw</v-card-title>
  
          <v-card-text>
            全部提取: {{wallet.withdraw}} KAL
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="info" @click="withdraw">Send</v-btn>
            <v-btn color="error" @click="dialog_withdraw = false">Cancel</v-btn>

          </v-card-actions>
        </v-card>
      </v-dialog>


    </v-content>
    
</template>
  <script>
  var headers = [
        { text: 'Address', value: 'address', sortable: false,align: 'center'},
        { text: 'Owner', value: 'owner', sortable: false,align: 'center'},
        { text: 'Manager', value: 'manager',sortable: false ,align: 'center'},
        { text: 'Creator', value: 'Creator',sortable: false ,align: 'center'},
        //{ text: 'Miner', value: 'miner',sortable: false },
        { text: 'StartUnlocking', value: 'timeToStartUnlocking',sortable: false ,align: 'center'},
        { text: 'TimeInterval', value: 'timeInterval',sortable: false ,align: 'center'},
        { text: 'Balance (KAL)', value: 'balance',sortable: false},
        //balance - unlocked;
        //{ text: '待解锁 (KAL)', value: 'locked',sortable: false ,align: 'center'},
        { text: '待提取 (KAL)', value: 'unlocked',sortable: false },
        { text: '已提取 (KAL)', value: 'totalWithdrawals',sortable: false ,align: 'center'},
      ]

  export default {
    name: 'Content',
    components: {
       
    },
    data: () => ({
        account:"",
        dialog:false,
        viewmodel:false,
        dialog_replaceCreator:false,
        dialog_sendTransaction:false,
        dialog_withdraw:false,
        dialog_item:null,
        now:0,
        timer:null,
        headers:headers,
        walletlist:[],
        wallet:{
            Manager:"",
            Owner:"",
            Creator:"0x0557D37D996B123FC1799B17b417A6e5D6773031",
            TimeToStartUnlocking:1,
            Interval:10,
            numInterval:10,
            Value:1,
            withdraw:0,
        },
        
      pagination:{
        rowsPerPage:5,
        totalItems:0,
      },
      registerminer:{
          start:0,
          lifespan:0,
          vrfVerifier:"",
          voteVerifier:"",
      },
      waletlist:[],
    }),
    computed: {
      pages () {
        if (this.pagination.rowsPerPage == null ||
          this.pagination.totalItems == null
        ) return 0

        return Math.ceil(this.pagination.totalItems / this.pagination.rowsPerPage)
      }
    },
    mounted:function(){
        var vue = this;

        var account = getQuery("address");
        //如果有传地址进来进入观看模式
        if(account != ""){
          vue.viewmodel = true;
          vue.account = account.toLowerCase();
          vue.web3 = new window.Web( new Web.providers.HttpProvider(window.host));
          _init(vue);
          return true;
        }
        //没连上meta
        if(typeof web3 === 'undefined'){
          console.log(web3)
          return;
        }
        vue.web3 = new window.Web(web3.currentProvider);
        
        //ethereum.selectedAddress 可能有延迟
        if(typeof ethereum.selectedAddress == 'undefined'){
          var accountInterval = setInterval(function() {
              if (typeof ethereum.selectedAddress !== 'undefined') {
                clearInterval(accountInterval);
                vue.account = ethereum.selectedAddress.toLowerCase();
                _init(vue);
              }
          }, 1000);
          return false;
        }
        vue.account = ethereum.selectedAddress.toLowerCase();    
        _init(vue)
    },
    methods:{
      deleteTx (item) {
        var index = this.waletlist.indexOf(item)
        if(confirm('Are you sure you want to delete this item?') ){
          this.waletlist.splice(index, 1)
        }
      },
      creatWallet(){
        if (typeof window.ethereum == 'undefined'){
            confirm("Download MetaMask?") && window.open("https://metamask.io/");
            return;
        }
        var vue = this;
        _creatWallet(vue)
      },
      replaceCreator(){
          var vue = this;
          _replaceCreator(vue)
      },
      sendTransaction(){
          var vue = this;
          _sendTransaction(vue);
      },
      withdraw(){
          var vue = this;
          _withdraw(vue);
      },
      todate(ns){
        return _todate(ns);
      }
    },
  }

    function _init(vue){
      var tmpweb3 = vue.web3;
      vue.wallet.Manager = vue.account;
      vue.wallet.Owner = vue.account;
      
      tmpweb3.eth.getBlockNumber().then(function(blockNumber){
        return tmpweb3.eth.getBlock(blockNumber)
      }).then(function(block){

        var now = block.timestamp;
        vue.now = now;

        vue.wallet.TimeToStartUnlocking = _todate(now);
        _totimestamp(vue.wallet.TimeToStartUnlocking)
        vue.wallet.TimeToUnlockAll = vue.wallet.TimeToStartUnlocking;
      })
      
      _walletlist(vue);
      //_newWlletEvent(vue)
    }
    function _todate(nS) { 
      var time = new Date(nS*1000);
      var year = time.getFullYear();
      
      var month = time.getMonth()+1;
      var date = time.getDate();
      var hours = time.getHours();
      var minutes = time.getMinutes();
      var seconds = time.getSeconds();
      return year+'-'+add0(month)+'-'+add0(date)+' '+add0(hours)+':'+add0(minutes)+':'+add0(seconds);
    }
    function _totimestamp(datestr){
      var date = new Date(datestr);
      var time = date.getTime();
      return time/1000;
    }

    function add0(n){
      if(n<10){
        n= "0"+n;
      }
      return n;
    }
    async function _replaceCreator(vue){
        var walletAddress = vue.dialog_item.address;
        var tmpweb3 = vue.web3;
        var wallet = new tmpweb3.eth.Contract(window.Walletabi,walletAddress,{from:Address});
        var Address = vue.account;
        var newCreator = vue.wallet.Creator.toLowerCase();
       
        var ok = false;
        try{
          ok = wallet.methods.replaceCreator(newCreator).call({from:Address});
        }catch(e){
          console.log(e)
        }
         
        if(!ok){
            alert("Replace Creator failed!please check params");
            return;
        }
        var data = wallet.methods.replaceCreator(newCreator).encodeABI();
        const transactionParameters = {
            from: Address, // must match user's active address.
            to: walletAddress, // Required except during contract publications.
            value: '0x0', // Only required to send ether to the recipient from the initiating external account.
            data: data, // Optional, but used for defining 
            gas:"0xf4240",
        }

        var txhash = ethereum.send({
            method: 'eth_sendTransaction',
            params: [transactionParameters],
            from: vue.account,
        }, async function (err, result) {
            if(result.result != undefined){
                if(window.txlist == null){
                    window.txlist = [];
                }
                web3.eth.getTransaction(result.result,function (err, result) {
                    window.txlist.push(result)
                })
            }
            vue.dialog_replaceCreator = false;
        })
    }

    async function _sendTransaction(vue){
      
        var from = vue.account;
        var walletAddress = vue.dialog_item.address;
        var tmpweb3 = vue.web3;
        var index = vue.walletlist.indexOf(vue.dialog_item);
      
        var wallet = new tmpweb3.eth.Contract(window.Walletabi,walletAddress,{from:from});
        var balance = await tmpweb3.eth.getBalance(from);
        
        if ( tmpweb3.utils.toBN(balance).lt(tmpweb3.utils.toBN(tmpweb3.utils.toWei(vue.wallet.Value.toString()))) ){
            alert("Insufficient Balance");
            return;
        }
        var value = tmpweb3.utils.toWei(vue.wallet.Value.toString());//new window.BN(vue.wallet.Value*1e18,10);window.

        value = tmpweb3.utils.toBN(value).toString(16);
        
        const transactionParameters = {
            to: walletAddress, // Required except during contract publications.
            value: value, // Only required to send ether to the recipient from the initiating external account.
            from:from,
            gas:"0x186a0",
        }

        var txhash = ethereum.send({
            method: 'eth_sendTransaction',
            params: [transactionParameters],
            from: vue.account,
        }, async function (err, result) {
            if(result.result != undefined){
                if(window.txlist == null){
                    window.txlist = [];
                }
                web3.eth.getTransaction(result.result,function (err, result) {
                    window.txlist.push(result)
                })
            }
            //_updatewallet(vue,index,wallet);
            tmpweb3.eth.getBalance(walletAddress).then(function(balance){
                //alert(balance);
                vue.walletlist[index].balance = balance;
            })
            vue.dialog_sendTransaction = false;
        })
    }
  
    async function _withdraw(vue){
      var walletAddress = vue.dialog_item.address;
      var tmpweb3 = vue.web3;
      
      var wallet = new tmpweb3.eth.Contract(window.Walletabi,walletAddress,{from:Address});
      var Address = vue.account;

      var unlock = 0;
      try{
        unlock =  await wallet.methods.unlock().call({from:Address});
      }catch(e){
        console.log(e)
      }

      if(unlock == 0){
        alert("Withdraw failed!");
        return false;
      }

      var data = wallet.methods.unlock().encodeABI();
          const transactionParameters = {
              from: Address, // must match user's active address.
              to: walletAddress, // Required except during contract publications.
              value: '0x0', // Only required to send ether to the recipient from the initiating external account.
              data: data, // Optional, but used for defining 
              gas:"0xf4240",
          }
          var txhash = ethereum.send({
              method: 'eth_sendTransaction',
              params: [transactionParameters],
              from: vue.account,
          }, async function (err, result) {
              if(result.result != undefined){
                  if(window.txlist == null){
                      window.txlist = [];
                  }
                  web3.eth.getTransaction(result.result,function (err, result) {
                      window.txlist.push(result)
                  })
              }
              vue.dialog_withdraw = false;
          })
    }

    async function _creatWallet(vue){
        var tmpweb3 = vue.web3;
        var factory = new tmpweb3.eth.Contract(window.Factoryabi,window.FactoryAddress,{from: vue.account});
        var TimeToStartUnlocking = _totimestamp(vue.wallet.TimeToStartUnlocking);
        var Interval = vue.wallet.Interval;
        var numInterval = vue.wallet.numInterval;

        var ok = false;
        try{
          ok = await factory.methods.create(
            vue.wallet.Owner,
            vue.wallet.Manager,
            TimeToStartUnlocking,
            Interval,
            numInterval);
        }catch(e){
          console.log(factory.options.address)
          console.log(e)
        }

        if(!ok){
            alert("create wallet failed!please check params");
            return;
        }
        

        var data = factory.methods.create(
            vue.wallet.Owner,
            vue.wallet.Manager,
            TimeToStartUnlocking,
            Interval,
            numInterval).encodeABI();

        const transactionParameters = {
            from: vue.account, // must match user's active address.
            to: factory.options.address, // Required except during contract publications.
            value: '0x0', // Only required to send ether to the recipient from the initiating external account.
            data: data, // Optional, but used for defining 
            gas:"0xf42400",
        }

        var txhash = ethereum.send({
            method: 'eth_sendTransaction',
            params: [transactionParameters],
            from: vue.account,
        }, async function (err, result) {
            if(result.result != undefined){
                if(window.txlist == null){
                    window.txlist = [];
                }
                web3.eth.getTransaction(result.result,function (err, result) {
                  
                    window.txlist.push(result)
                })
                vue.dialog = false;
            }
            vue.dialog = false;
        })
    }

    async function _updatewallet(vue,index,wallet){
        var tmpweb3 = vue.web3;
        var miner = new tmpweb3.eth.Contract(window.minerabi,window.mineraddress);
        var height = await tmpweb3.eth.getBlockNumber();
        var address = vue.walletlist[index]["address"];
        vue.walletlist[index]["owner"]      = await wallet.methods.owner().call();
        vue.walletlist[index]["manager"]    = await wallet.methods.manager().call();
        var creator = await wallet.methods.creator().call();
        vue.walletlist[index]["creator"] = creator;
        vue.walletlist[index]["miner"]      = await miner.methods.isMinerOfHeight((Math.floor((height/1000000))+1)*1000000-10,address).call();
        vue.walletlist[index]["timeInterval"] = await wallet.methods.timeInterval().call();
        vue.walletlist[index]["totalWithdrawals"] = await wallet.methods.totalWithdrawals().call();
        vue.walletlist[index]["balance"] = await tmpweb3.eth.getBalance(address),
        vue.walletlist[index]["unlock"] = await wallet.methods.unlock().call({from:creator});
        vue.walletlist[index]["lastUnlockTime"] = await wallet.methods.lastUnlockTime().call();

        //已提取的解锁次数
        vue.walletlist[index]["unlockedTime"] = await wallet.methods.timeToInterval(vue.walletlist[index]["lastUnlockTime"]).call();
        //总的解锁次数
    }
    async function _walletlist(vue){
        var Address = vue.account;
        var tmpweb3 = vue.web3;
        var netid = await tmpweb3.eth.net.getId();
        if(netid != window.networkid){
          alert("请选择Kaleidochain网络")
        }
        var factory = new tmpweb3.eth.Contract(window.Factoryabi,window.FactoryAddress,{from:Address});
        var miner = new tmpweb3.eth.Contract(window.minerabi,window.mineraddress);
        var height = await tmpweb3.eth.getBlockNumber();
        var wallets = await factory.methods.getCreatedWallets(Address).call();
        vue.walletlist = [];
        for(var i=0; i < wallets.length; i++){
            var wallet = new tmpweb3.eth.Contract(window.Walletabi,wallets[i],{from:Address});
            var creator = await wallet.methods.creator().call();
            var lastUnlockTime = await wallet.methods.lastUnlockTime().call();
            vue.walletlist.push({
                address:wallets[i],
                owner: await wallet.methods.owner().call(),
                manager:await wallet.methods.manager().call(),
                creator:creator,
                miner: await miner.methods.isMinerOfHeight(height,wallets[i]).call(),
                timeToStartUnlocking:await wallet.methods.timeToStartUnlocking().call(),
                timeInterval:await wallet.methods.timeInterval().call(),
                totalWithdrawals:await wallet.methods.totalWithdrawals().call(),
                balance:await tmpweb3.eth.getBalance(wallets[i]),
                unlock:await wallet.methods.unlock().call({from:creator}),
                lastUnlockTime:lastUnlockTime,
                numInterval:await wallet.methods.numInterval().call(),
                unlockedTime:await wallet.methods.timeToInterval(lastUnlockTime).call(),
              })
              if(vue.viewmodel){continue;}
              wallet.events.allEvents({},function(index,wallet){
                return function(error,event){
                  _updatewallet(vue,index,wallet)
                };
              }(i,wallet))
        }
        vue.pagination.totalItems = wallets.length;
        _newWlletEvent(vue)
    }
    function _newWlletEvent(vue){
        if(vue.viewmodel){return true;}
        
        var tmpweb3 = vue.web3;
        var factory = new tmpweb3.eth.Contract(window.Factoryabi,window.FactoryAddress,{from: vue.account});
        factory.events.Instantiation({},async function(error,event){
            var lwallet = vue.walletlist.length;
            var wallets = await factory.methods.getCreatedWallets(vue.account).call();
            var lwallet2 = wallets.length;
            if(lwallet == lwallet2){return;}
            var height = await tmpweb3.eth.getBlockNumber();
            var miner = new tmpweb3.eth.Contract(window.minerabi,window.mineraddress);
            console.log("_newWlletEvented")
            for(var i = lwallet; i < wallets.length; i++){
              console.log(i);
                var wallet = new tmpweb3.eth.Contract(window.Walletabi,wallets[i]);
                var creator = await wallet.methods.creator().call();
                var lastUnlockTime = await wallet.methods.lastUnlockTime().call();
                vue.walletlist.push({
                    address:wallets[i],
                    owner: await wallet.methods.owner().call(),
                    manager:await wallet.methods.manager().call(),
                    creator:creator,
                    miner: await miner.methods.isMinerOfHeight(height,wallets[i]).call(),
                    timeToStartUnlocking:await wallet.methods.timeToStartUnlocking().call(),
                    timeInterval:await wallet.methods.timeInterval().call(),
                    totalWithdrawals:await wallet.methods.totalWithdrawals().call(),
                    balance:await tmpweb3.eth.getBalance(wallets[i]),
                    unlock:await wallet.methods.unlock().call({from:creator}),
                    lastUnlockTime:lastUnlockTime,
                    numInterval:await wallet.methods.numInterval().call(),
                    unlockedTime:await wallet.methods.lastUnlockTime().call(),
                  })
                  wallet.events.allEvents({},function(index,wallet){
                    return function(error,event){
                            _updatewallet(vue,index,wallet)
                    };
                  }(i,wallet))
            }
            vue.pagination.totalItems = wallets.length;
        })
      }
        function getQuery(variable){
      var query = window.location.search.substring(1);
      var vars = query.split("&");
      for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if(pair[0] == variable){return pair[1];}
      }
      return "";
    }
</script>
<style >
th {
  padding:0 4px !important;
}

td {
  padding:0px !important;
}
</style>