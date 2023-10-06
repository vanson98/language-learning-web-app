import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router"
import Layout from "../views/Layout.vue"


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
router.beforeEach((to,from, next)=>{
    
    var exceptAuthenPathName = ["/login","/register","/logout"]
    if(exceptAuthenPathName.includes(to.path)){
        next()
    }
    else{
        // check do have token
        var token = getCookieByName("token")
        if(token == null || token == ""){
            next({name: "login"})
        }
        else{
            next()
        }
        next()
    }
    
})

const getCookieByName = (name : string) : string | undefined =>{
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if(parts.length === 2){
        return parts?.pop()?.split(";").shift();
    } 
    return undefined
}
export default router