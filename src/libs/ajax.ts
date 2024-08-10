
import axios from "axios";
import AppConsts from "./appconst";
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

// ajax.interceptors.response.use(response =>{
//   return Promise.resolve(response)
// },error =>{
//   debugger
//   var bypassAuthenPath = ["/login","/refresh-token"]

//   return Promise.reject(error.response)

//   // if(error.response != null && error.response.status == 401 && !bypassAuthenPath.includes(error.config.url)){
//   //   requestNewToken()
//   // }
//   // else{
//   //   return Promise.reject(error)
//   // }
// })

const requestNewToken = ()=>{
  ajax.post("/refresh-token").then(response=>{
    console.log("token refresh");
  }).catch(err=>{
    document.location.pathname = "/login"
  })
}

export { ajax,crawAjax};
