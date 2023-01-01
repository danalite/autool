import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import animated  from'animate.css'
import { createApp } from 'vue'
import Directive from './directives'

createApp(App)
  .use(router)
  .use(animated)
  .use(Directive)
  .use(createPinia())
  .mount('#app')
