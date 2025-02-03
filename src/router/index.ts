import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router"
import Home from "../views/Home.vue"
import PhraseManager from "@/views/PhraseManager.vue"
import StockManagePage from "@/views/StockManagePage.vue"
import LanguageLearningPage from "@/views/LanguageLearningPage.vue"
import StockAccountManagePage from "@/views/StockAccountManagePage.vue"
import IdentityCallBack from "@/views/authen/IdentityCallBack.vue"
import { ajax, identityAjax } from "@/libs/ajax"
import { AxiosError } from "axios"


const routes: Array<RouteRecordRaw> = [
    {
        path: "/login",
        name: "login",
        meta: {
            title: "LogIn"
        },
        component: () => import("../views/authen/Login.vue")
    },
    {
        path: "/authen-callback/:exchangeCode",
        name: "authen-callback",
        component: IdentityCallBack
    },
    {
        path: "/",
        name: "home",
        component: Home,
        meta: {
            requiresAuthen: true
        }
    },
    {
        path: "/stock-manager",
        name: "stock-manager",
        component: StockManagePage,
        meta: {
            requiresAuthen: true
        }
    },
    {
        path: "/stock-accounts-manager",
        name: "stock-accounts-manager",
        component: StockAccountManagePage,
        meta: {
            requiresAuthen: true
        }
    },
    {
        path: "/language-learning",
        name: "lang-learning",
        component: LanguageLearningPage,
        meta: {
            requiresAuthen: true
        }
    }
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

router.beforeEach((to,from, next)=>{
    if (to.meta.requiresAuthen){
        identityAjax.get("/token-cookie-verification").then(res=>{
            if(res.status == 200 ){
                next()
            }
        }).catch((err: AxiosError)=> {
            next("/login")
        })
    }else{
        next()
    }
})

export default router