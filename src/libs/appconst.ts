import url from "./url";
const AppConsts = {
  remoteServiceBaseUrl: url.endsWith("/") ? url.slice(0, -1) : url,
  authorization: {
    encrptedAuthTokenName: "enc_auth_token",
    tokenName: "Abp.AuthToken",
  },
  appBaseUrl: "http://localhost:8081",
};
export default AppConsts;
