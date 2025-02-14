
import axios from "axios";
import AppConsts from "./appconst";
import router from "@/router";
const ajax = axios.create({
  baseURL: AppConsts.remoteServerBaseUrl,
  timeout: 300000,
  withCredentials: true
});

const crawAjax = axios.create({
  baseURL: AppConsts.remoteCrawDataServerUrl,
  timeout: 3000000,
  withCredentials: true
})

const stockAjax = axios.create({
  baseURL: AppConsts.remoteStockTrackerServerUrl,
  withCredentials: true
})

const identityAjax = axios.create({
  baseURL: AppConsts.remoteIdentityServerUrl,
  withCredentials: true
})

const gatewayAjax = axios.create({
  baseURL: AppConsts.remoteGatewayServerUrl,
  withCredentials: true
})

ajax.interceptors.response.use(response =>{
  return Promise.resolve(response)
},error =>{
  if(error.response && error.response.status == 401){
    alert("User session expired. Pls login again")
    router.push("/login")
  } 
  return Promise.reject(error.response)
})

stockAjax.interceptors.response.use(response =>{
  return Promise.resolve(response)
},error =>{
  if(error.response && error.response.status == 401){
    alert("User session expired. Pls login again")
    router.push("/login")
  } 
  return Promise.reject(error.response)
})

export { ajax,crawAjax, stockAjax, identityAjax, gatewayAjax};
