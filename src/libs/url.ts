const SERVER_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "http://localhost:3333"
    : "http://localhost:3334";
export default SERVER_BASE_URL;
