import { build, defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react'
import vitePluginImp from 'vite-plugin-imp'
import {visualizer} from 'rollup-plugin-visualizer'
// https://vitejs.dev/config/
export default defineConfig({
  define: {
    // global: {}
  },
  build: {
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    reportCompressedSize: false,
    sourcemap: false,
    minify: 'terser',
       rollupOptions: {
        // external: [
        //   'marked',
        // ],
        output:{
          manualChunks(id: any): string {  
            if (id.includes("node_modules")) {
              return id
                .toString()
                .split("node_modules/")[1]
                .split("/")[0]
                .toString();
              }
            }
        }
       }
    // rollupOptions: {
    //   output:{
    //         manualChunks(id: any): string {  
    //             if (id.includes("node_modules")) {
    //                 return id
    //                         .toString()
    //                         .split("node_modules/")[1]
    //                         .split("/")[0]
    //                         .toString();
    //             }
    //         }
    //     }
    // }
  },
  plugins: [
    reactRefresh(),
    vitePluginImp({
      libList: [
        {
          libName: 'antd',
          style: (name) => `antd/es/${name}/style`
        }
      ]
    }),
    visualizer({
      open:true,
      gzipSize:true,
      brotliSize:true,
    }),
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/,'/')
      }
    }
  }
})
