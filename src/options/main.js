import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './main.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'

createApp(App).use(router).mount('#app')
