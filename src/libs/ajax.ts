import axios from "axios";
import AppConsts from "./appconst";

const ajax = axios.create({
  baseURL: AppConsts.remoteServiceBaseUrl,
  timeout: 300000,
});

export default ajax;
