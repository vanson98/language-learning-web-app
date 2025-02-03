/* eslint-disable */
import { createApp } from "vue";
import App from "./App.vue";
import "element-plus/dist/index.css";
import router from "./router";
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import './assets/main.css'
import { createPinia } from "pinia";

const globalOptions = {
    debug: 'info',
    modules: {
      toolbar: ['bold', 'italic', 'underline']
    },
    spellcheck: false,
    scrollY:true
  }
const pinia = createPinia();
const app = createApp(App);
QuillEditor.props.globalOptions.default = () => globalOptions
app.component('QuillEditor', QuillEditor)

app.use(router);
app.use(pinia);
app.mount("#app");
