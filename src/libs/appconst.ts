import {SERVER_BASE_URL, SERVER_CRAW_DATA_URL, SERVER_STOCK_TRACKER_URL, SERVER_IDENTITY_URL, API_GATEWAY_URL} from "./url";

const AppConsts = {
  remoteServerBaseUrl: SERVER_BASE_URL.endsWith("/") ? SERVER_BASE_URL.slice(0, -1) : SERVER_BASE_URL,
  remoteCrawDataServerUrl: SERVER_CRAW_DATA_URL.endsWith("/") ? SERVER_CRAW_DATA_URL.slice(0,-1) : SERVER_CRAW_DATA_URL,
  remoteStockTrackerServerUrl: SERVER_STOCK_TRACKER_URL.endsWith("/") ? SERVER_STOCK_TRACKER_URL.slice(0,-1) : SERVER_STOCK_TRACKER_URL,
  remoteIdentityServerUrl: SERVER_IDENTITY_URL.endsWith("/") ? SERVER_IDENTITY_URL.slice(0,-1) : SERVER_IDENTITY_URL,
  remoteGatewayServerUrl: API_GATEWAY_URL.endsWith("/") ? API_GATEWAY_URL.slice(0,-1) : API_GATEWAY_URL,
  appBaseUrl: "http://localhost:8081",
};
export default AppConsts;
