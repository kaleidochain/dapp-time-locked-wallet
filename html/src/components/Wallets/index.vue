<template>
  <v-app>
      <Head></Head>
      <Content></Content>
      <Foot></Foot>
  </v-app>
</template>

<script>
import Head from '../Head.vue'
import Content from './Content.vue'
import Foot from '../Foot.vue'
export default {
  name: 'Main',
  components: {
    Head,Content,Foot
  },
  data () {
    return {
      
    }
  }
}
</script>
<style scoped>
td {
  padding:0px !important;
}
</style>