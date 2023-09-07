/* eslint-disable */
import { createApp } from "vue";
import App from "./App.vue";
import Home from "@/components/Home.vue";
import LanguageLessons from "./components/LanguageLessons.vue";
import "element-plus/dist/index.css";
import { createRouter, createWebHistory } from "vue-router";


const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: "/", name: "Home", component: Home },
        { path: "/import-lesson", name: "Lesson", component: LanguageLessons },
    ],
});

const app = createApp(App);
app.use(router);
app.mount("#app");
