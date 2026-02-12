import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './main.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'

import { i18n } from '../common/i18n'

createApp(App).use(router).use(i18n).mount('#app')
