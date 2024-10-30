import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router"
import Home from "../views/Home.vue"
import PhraseManager from "@/views/PhraseManager.vue"
import StockManagePage from "@/views/StockManagePage.vue"
import LanguageLearningPage from "@/views/LanguageLearningPage.vue"


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
        path: "/",
        name: "home",
        component: Home,
    },
    {
        path: "/stock-manager",
        name: "stock-manager",
        component: StockManagePage,
    },
    {
        path: "/language-learning",
        name: "lang-learning",
        component: LanguageLearningPage
    }
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})
// router.beforeEach((to,from, next)=>{
//     var exceptAuthenPathName = ["/login","/register","/logout"]
//     if(exceptAuthenPathName.includes(to.path)){
//         next()
//     }
//     else{
//         // check do have token
//         var token = getCookieByName("token")
//         if(token == null || token == ""){
//             next({name: "login"})
//         }
//         else{
//             next()
//         }
//         next()
//     }
// })

const getCookieByName = (name : string) : string | undefined =>{
    debugger
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if(parts.length === 2){
        return parts?.pop()?.split(";").shift();
    } 
    return undefined
}
export default router