const SERVER_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "http://localhost:3333"
    : "http://localhost:3334";

const SERVER_CRAW_DATA_URL = 
  process.env.NODE_ENV == "production"
  ? "http://localhost:3323"
  : "http://localhost:3324"

export {SERVER_BASE_URL,SERVER_CRAW_DATA_URL};
