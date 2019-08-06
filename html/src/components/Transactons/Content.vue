<template>
    <v-content>
      <v-container  grid-list-md style="max-width:100%">
        <v-layout row wrap justify-center>
       
          <v-flex d-flex xs12 sm12 md10  xl8>
            <v-card >
              <v-toolbar color="blue darken-3" dark>
                <v-toolbar-title>Transactions  </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn round color="error" outline class="mb-2" @click="RemoveAll">Remove All</v-btn>
              </v-toolbar>

              <v-card-text class="px-0">
                  <v-data-table
                    :headers="headers"
                    :items="txlist"
                    hide-actions
                    :pagination.sync="pagination"
                    class="elevation-1"
                  >
                    <template v-slot:items="props">
                      <td class="text-xs-start">
                       
                        <span style="max-width: 100px; display: inline-block; overflow: hidden; text-overflow: ellipsis;">
                          {{ props.item.hash }}
                          </span>
                        </td>
                      <td class="text-xs-start">
                        <span style="max-width: 100px; display: inline-block; overflow: hidden; text-overflow: ellipsis;">
                        {{ props.item.from }}
                        </span></td>
                      <td class="text-xs-start">
                        <span style="max-width: 100px; display: inline-block; overflow: hidden; text-overflow: ellipsis;">
                        {{ props.item.to }}
                        </span></td>
                      <td class="text-xs-start">{{ props.item.value/1e18 }}</td>
                      <td class="text-xs-start">
                        <span style="max-width: 200px; display: inline-block; overflow: hidden; text-overflow: ellipsis;">
                        {{ props.item.input }}
                        </span>
                        </td>
                      <td class="text-xs-start">{{ props.item.status=="0x1"?"success":(props.item.status=="0x0"?"failed":"pending") }}</td>
                      <td class="text-xs-start">

                        <v-icon   @click="deleteTx(props.item)">delete</v-icon>
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
      
      

    </v-content>
</template>
  <script>
  var headers = [
        { text: 'Hash', value: 'hash',align: 'left', sortable: false},
        { text: 'From', value: 'from',align: 'left', sortable: false},
        { text: 'To', value: 'to',sortable: false },
        { text: 'Value (KAL)', value: 'value',sortable: false },
        { text: 'Data', value: 'input',sortable: false },
        { text: 'Status', value: 'status',sortable: false },
        { text: 'Remove', value: 'remove',sortable: false }
      ]
  export default {
    name: 'Content',
    components: {
       
    },
    data: () => ({
      dialog:false,
      headers:headers,
      transaction:{
        to:"",
        value:"",
        input:"",
      },
      txlist:[],
      pagination:{
        rowsPerPage:5,
        totalItems:11,
      },
    }),
    computed: {
      pages () {
        if (this.pagination.rowsPerPage == null ||
          this.pagination.totalItems == null
        ) return 0

        return Math.ceil(this.txlist.length / this.pagination.rowsPerPage)
      }
    },
    mounted:function(){
      var vue = this;
      if(window.txlist != null){
        for(var i=0; i<window.txlist.length; i++){
          if(window.txlist[i]["status"] == null){
            window.txlist[i]["status"] = "pending"
          }
        }
        vue.txlist = window.txlist;
      }
      _getreceiptlist(vue);
    
    },
    methods:{
      deleteTx (item) {
        var index = this.txlist.indexOf(item)
        if(confirm('Are you sure you want to delete this item?') ){
          this.txlist.splice(index, 1);
          window.txlist = this.txlist;
        }
        this.pagination.totalItems = this.txlist.length;
      },
      RemoveAll(){
        if(!confirm('Are you sure you want to delete all item?')){
          return;
        }
        this.txlist = [];
        window.txlist = [];
        this.pagination.totalItems = this.txlist.length;
      },
      sendTransaction(){
      }
    },
  }
  function _getreceiptlist(vue){
    if (typeof window.ethereum == 'undefined'){
      return;
    }
    for(var i=0; i < vue.txlist.length; i++){
        _getreceipt(vue,i);
    }
  }

  function _getreceipt(vue,i){
    if (typeof window.ethereum == 'undefined'){
      return;
    }
    if(vue.txlist[i]["blockNubmer"] > 0 ){
      //return;
    }
    var hash = vue.txlist[i]["hash"];
    
    var receipt = web3.eth.getTransactionReceipt(hash,function(err,result){
      if(result == null){
        return;
      }
      vue.txlist[i]["blockNumber"] = result["blockNumber"];
      vue.txlist[i]["status"] = result["status"];
    })
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