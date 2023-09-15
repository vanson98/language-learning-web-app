import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router"
import Layout from "../views/Layout.vue"


const routes: Array<RouteRecordRaw> = [
    {
        path: "/login",
        name: "Login",
        meta: {
            title: "LogIn"
        },
        component: () => import("../views/authen/Login.vue")
    },
    {
        path: "/",
        name: "layout",
        component: Layout,
        children: [
            {
                path: "/home",
                name: "home",
                component: () => import("../views/home/Home.vue")
            },
        ]
    }
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

export default router