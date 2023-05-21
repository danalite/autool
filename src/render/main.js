import App from './App.vue'
import router from './router'

import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'

import Directive from './directives'
import Local from './locale'
import mitt from 'mitt';

const lang = navigator.language;
const i18n = createI18n({
    legacy: false,
    locale: lang == 'zh-CN' ? 'zh-CN' : 'en-US', 
    messages: Local
})

const emitter = mitt();
const app = createApp(App)

app.use(router)
app.use(Directive)
app.use(createPinia())
app.use(i18n)

app.mount('#app')

app.config.globalProperties.$emitter = emitter;
