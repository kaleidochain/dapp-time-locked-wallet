import Vue from "vue"
import Router from "vue-router"
import Transactions from "../components/Transactons"
//import Transactions from '../components/Head.vue'
import Wallets from '../components/Wallets'
import Manager from '../components/Manager'
import Creator from '../components/Creator'
Vue.use(Router)

export default new Router({
    routes:[
        {
            path:'/',
            name:'owner',
            component:Wallets,
        },
        {
            path:'/creator',
            name:'creator',
            component:Creator,
        },
        {
            path:'/manager',
            name:'manager',
            component:Manager,
        },
        {
            path:'/transactions',
            name:'Transactions',
            component:Transactions,
        }
    ]

})