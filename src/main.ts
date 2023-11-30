/* eslint-disable */
import { createApp } from "vue";
import App from "./App.vue";
import "element-plus/dist/index.css";
import router from "./router";
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';


const globalOptions = {
    debug: 'info',
    modules: {
      toolbar: ['bold', 'italic', 'underline']
    },
    spellcheck: false
  }

const app = createApp(App);
QuillEditor.props.globalOptions.default = () => globalOptions
app.component('QuillEditor', QuillEditor)

app.use(router);
app.mount("#app");
