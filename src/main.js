import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

import './assets/styles/variables.css'
import './assets/styles/base.css'
import './assets/styles/cards.css'
import './assets/styles/modals.css'
import './assets/styles/draft.css'
import './assets/styles/print.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')
