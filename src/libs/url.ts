const SERVER_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "http://localhost:3333"
    : "http://localhost:3334";

const SERVER_CRAW_DATA_URL = 
  process.env.NODE_ENV == "production"
  ? "http://localhost:3323"
  : "http://localhost:3324"

const SERVER_STOCK_TRACKER_URL = 
  process.env.NODE_ENV == "production"
  ? "http://localhost:5050"
  : "http://localhost:5051"

const SERVER_IDENTITY_URL = 
  process.env.NODE_ENV == "production"
  ? "http://localhost:9090"
  : "http://localhost:9091"

const API_GATEWAY_URL = 
  process.env.NODE_ENV == "production"
  ? "http://localhost:6060"
  : "http://localhost:6061"

export {SERVER_BASE_URL,SERVER_CRAW_DATA_URL, SERVER_STOCK_TRACKER_URL, SERVER_IDENTITY_URL, API_GATEWAY_URL};
