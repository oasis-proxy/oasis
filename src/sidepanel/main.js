import { createApp } from 'vue'
import App from './App.vue'
import './main.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

import { i18n } from '../common/i18n'

const app = createApp(App)
app.use(i18n)
app.mount('#app')
