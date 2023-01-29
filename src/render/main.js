import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import animated  from'animate.css'
import { createApp } from 'vue'
import Directive from './directives'
import mitt from 'mitt';

const emitter = mitt();
const app = createApp(App)

app.use(router)
app.use(animated)
app.use(Directive)
app.use(createPinia())
app.mount('#app')

app.config.globalProperties.$emitter = emitter;
