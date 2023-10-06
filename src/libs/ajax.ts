
import axios from "axios";
import AppConsts from "./appconst";
const ajax = axios.create({
  baseURL: AppConsts.remoteServiceBaseUrl,
  timeout: 300000,
  withCredentials: true
});

ajax.interceptors.response.use(response =>{
  return response
},error =>{
  var bypassAuthenPath = ["/login","/refresh-token"]

  if(error.response.status == 401 && !bypassAuthenPath.includes(error.config.url)){
    requestNewToken()
  }
  else{
    return Promise.reject(error)
  }
})

const requestNewToken = ()=>{
  ajax.post("/refresh-token").then(response=>{
    console.log("token refresh");
  }).catch(err=>{
    document.location.pathname = "/login"
  })
}

export default ajax;
