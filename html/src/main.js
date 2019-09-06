import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
//import BN from 'bn.js'
import Web3 from "web3"
import router from './router'

//window.BN = BN;
window.Web = Web3;

window.Factoryabi = [{"constant":true,"inputs":[{"name":"creator","type":"address"}],"name":"getCreatedCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"}],"name":"getOwnedCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"uint256"}],"name":"walletsOfCreator","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"creator","type":"address"}],"name":"getCreatedWallets","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"}],"name":"getOwnedWallets","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"uint256"}],"name":"walletsOfManager","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_owner","type":"address"},{"name":"_newOwner","type":"address"}],"name":"replaceOwner","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"uint256"}],"name":"walletsOfOwner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"name":"sender","type":"address"},{"indexed":false,"name":"dapp","type":"address"}],"name":"Instantiation","type":"event"},{"constant":false,"inputs":[{"name":"_manager","type":"address"},{"name":"_owner","type":"address"},{"name":"s","type":"uint64"},{"name":"i","type":"uint64"},{"name":"n","type":"uint256"},{"name":"e","type":"uint64"}],"name":"create","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"owner","type":"address"},{"name":"s","type":"uint64"},{"name":"i","type":"uint64"},{"name":"n","type":"uint256"},{"name":"e","type":"uint64"}],"name":"create","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_manager","type":"address"},{"name":"_newManager","type":"address"}],"name":"replaceManager","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_manager","type":"address"}],"name":"getManagedCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_manager","type":"address"}],"name":"getManagedWallets","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"}];

window.Walletabi = [{"constant":false,"inputs":[{"name":"_value","type":"uint256"}],"name":"withdraw","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"manager","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalWithdrawals","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"unlocked","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"timeToUnlockAll","outputs":[{"name":"","type":"uint64"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"timeToStartUnlocking","outputs":[{"name":"","type":"uint64"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"timeInterval","outputs":[{"name":"","type":"uint64"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"replaceOwner","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalUnlocked","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"amountOfEachUnlock","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"factory","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"start","type":"uint64"},{"name":"lifespan","type":"uint32"},{"name":"vrfVerifier","type":"bytes32"},{"name":"voteVerifier","type":"bytes32"}],"name":"registerMiner","outputs":[{"name":"suc","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_owner","type":"address"},{"name":"_manager","type":"address"},{"name":"s","type":"uint64"},{"name":"i","type":"uint64"},{"name":"n","type":"uint256"},{"name":"e","type":"uint64"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_manager","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Revocation","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"manager","type":"address"},{"indexed":false,"name":"newManager","type":"address"}],"name":"ManagerReplaced","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"sender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"owner","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Withdrew","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"owner","type":"address"},{"indexed":false,"name":"newOwner","type":"address"}],"name":"OwnerReplaced","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"owner","type":"address"}],"name":"MinerRegistered","type":"event"},{"constant":false,"inputs":[{"name":"_value","type":"uint256"}],"name":"revoke","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newManager","type":"address"}],"name":"replaceManager","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]

window.minerabi=[{"anonymous":false,"inputs":[{"indexed":false,"name":"start","type":"uint256"},{"indexed":false,"name":"miner","type":"address"}],"name":"Added","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"start","type":"uint256"},{"indexed":false,"name":"miner","type":"address"}],"name":"Updated","type":"event"},{"constant":false,"inputs":[{"name":"start","type":"uint64"},{"name":"lifespan","type":"uint32"},{"name":"coinbase","type":"address"},{"name":"vrfVerifier","type":"bytes32"},{"name":"voteVerifier","type":"bytes32"}],"name":"set","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"number","type":"uint256"},{"name":"coinbase","type":"address"}],"name":"setCoinbase","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"number","type":"uint256"},{"name":"miner","type":"address"}],"name":"get","outputs":[{"name":"","type":"uint64"},{"name":"","type":"uint32"},{"name":"","type":"address"},{"name":"","type":"bytes32"},{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"number","type":"uint256"},{"name":"addr","type":"address"}],"name":"isMinerOfHeight","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"number","type":"uint256"}],"name":"getNewAddedMinersCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"number","type":"uint256"},{"name":"index","type":"uint32"}],"name":"getNewAddedMiner","outputs":[{"name":"miner","type":"address"}],"payable":false,"stateMutability":"view","type":"function"}];
window.mineraddress = "0x1000000000000000000000000000000000000002";

window.host = "https://api.kalscan.io/mainnet";
window.FactoryAddress="0x7c46fdca570353a25b9ede8f0afc8dd6eda36d29";
window.networkid = 888;

Vue.config.productionTip = false
new Vue({
  el:'#app',
  router,
  components:{App},
  render: h => h(App),
})
