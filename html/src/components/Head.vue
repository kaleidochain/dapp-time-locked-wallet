  <template>
  <div id="Head">
  <v-toolbar color="blue darken-3" app > <!-- app -->

      <v-spacer></v-spacer><v-spacer></v-spacer>
      <!-- class="hidden-sm-and-down" -->
      <v-toolbar-items >
        <v-menu offset-y>
          <template v-slot:activator="{ on }">
            <v-btn flat dark large v-on="on">
              {{path}}
              <v-icon dark left>arrow_drop_down</v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-tile  >
              <v-list-tile-title>
                <v-icon dark color="red" >person_pin</v-icon>
                <a href="#/" > 我的锁定钱包</a>
              </v-list-tile-title>
            </v-list-tile>
            <v-list-tile  >
              <v-list-tile-title>
                <v-icon dark color="red">perm_contact_calendar</v-icon>
                <a href="#/creator" > 创建锁定钱包</a>
              </v-list-tile-title>
            </v-list-tile>
            <v-list-tile  >
              <v-list-tile-title>
                <v-icon dark color="red"> monetization_on</v-icon>
                <a href="#/manager" > 管理锁定钱包</a>
              </v-list-tile-title>
            </v-list-tile>

          </v-list>
        
        
        </v-menu>
      </v-toolbar-items>
      <v-toolbar-items class="hidden-sm-and-down">
        <v-btn flat dark large href="#/transactions">
          Transactions
        </v-btn>
      </v-toolbar-items> 
      <!-- <v-toolbar-items class="hidden-sm-and-down" >
          <v-btn flat dark large href="https://docs.kaleidochain.io/" target="_blank">
          KaleidoChain
        </v-btn>
      </v-toolbar-items>  -->


      <v-spacer></v-spacer>

      <v-toolbar-items  class="hidden-sm-and-down" >
        <span v-if="isonline" style="color:white;">
          <br>
        
           {{account}}
        </span>
        <v-text-field
              single-line
              outlined
              dark
              v-model="account"
              v-if="!isonline"
              style="width:380px;"
            ></v-text-field>
        <v-btn flat icon v-if="!isonline" color="white" @click="search">
            <v-icon>search</v-icon>
        </v-btn>
      </v-toolbar-items> 

      <v-toolbar-items  class="hidden-sm-and-down" >
        <span style="color:white;margin: 0 10px;">          
          <br>
          {{(balance/1e18).toFixed(3)}} KAL
        </span>

      </v-toolbar-items> 

       <v-toolbar-items v-if="isonline" class="hidden-sm-and-down">
          <v-btn flat icon  color="#2de234">
                <i class="fas fa-circle"></i>
              </v-btn>
      </v-toolbar-items>
         
      
      <v-toolbar-items v-if="!isonline" class="hidden-sm-and-down">
          <v-btn flat icon dark @click="offline" >
                <!-- <v-icon>signal_cellular_off</v-icon> -->
                <i class="fas fa-plug"></i>
              </v-btn>
      </v-toolbar-items>

  </v-toolbar>
  </div>
  </template>
  <script>
  export default {
    name: 'Head',
    
    data:()=>({
      isonline:false,
      loading:false,
      balance:0.00,
      account:"0x00000000000000000000000000000000000000000",
      web3:null,
      path:"",
    }),
    mounted() {
      var vue = this;

      if(vue.$route.path == "/"){
        vue.path = "我的锁定钱包"
      }else if(vue.$route.path == "/creator"){
        vue.path = "创建锁定钱包"
      }else if(vue.$route.path == "/manager"){
        vue.path = "管理锁定钱包"
      }else{
        vue.path = "锁定钱包"
      }
      var account = getQuery("address");
      //如果有传地址进来进入观看模式
      if(account != ""){
        vue.account = account.toLowerCase();
        vue.web3 = new window.Web(new window.Web.providers.HttpProvider(window.host));
        _viewinit(vue);
        return true;
      }
      //没连上meta
      if(typeof web3 === 'undefined'){
        return;
      }

      vue.web3 = new window.Web(web3.currentProvider);
      //ethereum.selectedAddress 可能有延迟
      if(typeof ethereum.selectedAddress == 'undefined'){
        var accountInterval = setInterval(function() {
            if (typeof ethereum.selectedAddress !== 'undefined') {
              clearInterval(accountInterval);
              _init(vue);
            }
        }, 1000);
        return false;
      }
      
      _init(vue);
    },
    methods: {
      offline(){
        var vue = this;
         
        if (typeof window.ethereum !== 'undefined'){
          ethereum.enable().then(function(accounts){
            if (typeof web3 !== 'undefined') {
              var url = window.location.href;    
              var urlParam = window.location.search.substr(1);   
              var beforeUrl = url.substr(0, url.indexOf("?"));   
              window.location.href=beforeUrl;
              
              return;
            }
          }).catch(function (error) {
            console.log(error)
          });
        } else {
          confirm("Download MetaMask?")&&window.open("https://metamask.io/");
          return;
        }

      },
      getBalance(){
        var vue = this;
        vue.loading = true;
        var tmpweb3 = vue.web3;
        tmpweb3.eth.getBalance(vue.account).then(function(result){
        vue.loading = false;
        vue.balance = result;
      });
      },
      search(){
        
        window.location.href="?address="+this.account;
      }
    },
  }
  function _init(vue){
      vue.account = ethereum.selectedAddress;

      var tmpweb3 = vue.web3;
      tmpweb3.eth.getBalance(vue.account).then(function(result){
        vue.balance = result;
      });

      vue.isonline = true;
      //检查账户切换,余额变动
      var accountInterval = setInterval(function() {
        if (ethereum.selectedAddress !== vue.account) {
          vue.$router.go(0);
        }

        tmpweb3.eth.getBalance(vue.account).then(function(result){
          vue.balance = result;
        });
      }, 1000);
  }

  async function _viewinit(vue){
    var tmpweb3 = vue.web3;
    tmpweb3.eth.getBalance(vue.account).then(function(result){
        vue.balance = result;
    });

  }
  function getQuery(variable)
  {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
      var pair = vars[i].split("=");
      if(pair[0] == variable){return pair[1];}
    }
    return "";
  }
</script>

<style scope="this api replaced by slot-scope in 2.5.0+">
a {
  text-decoration: none;
  color: #212121;
}
</style>
