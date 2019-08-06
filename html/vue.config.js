module.exports = {
    baseUrl:'/unlock',
    devServer: {
        
        proxy: {
            '/xbone': {
              target: 'http://106.75.184.214:8547', //对应自己的接口
              changeOrigin: true,
              pathRewrite: {
                
              }
            }
        },
        port: 8080,
    },
    pages:{
        //首页
        index:'src/main.js',
       
    }
}