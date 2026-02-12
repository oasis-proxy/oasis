import { createApp } from 'vue'
import App from './App.vue'
import './main.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

import { i18n } from '../common/i18n'

createApp(App).use(i18n).mount('#app')
