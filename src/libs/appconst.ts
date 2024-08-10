import {SERVER_BASE_URL, SERVER_CRAW_DATA_URL} from "./url";

const AppConsts = {
  remoteServerBaseUrl: SERVER_BASE_URL.endsWith("/") ? SERVER_BASE_URL.slice(0, -1) : SERVER_BASE_URL,
  remoteCrawDataServerUrl: SERVER_CRAW_DATA_URL.endsWith("/") ? SERVER_CRAW_DATA_URL.slice(0,-1) : SERVER_CRAW_DATA_URL,
  authorization: {
    encrptedAuthTokenName: "enc_auth_token",
    tokenName: "Abp.AuthToken",
  },
  appBaseUrl: "http://localhost:8081",
};
export default AppConsts;
