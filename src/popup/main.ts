import 'vue-global-api'
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './Popup.vue'
import '../styles'
import '~/assets/money-flow/styles/main.scss'

const app = createApp(App)
app.use(ElementPlus)
app.mount('#app')
