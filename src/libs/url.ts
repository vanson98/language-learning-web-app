const SERVER_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "http://localhost:8065/"
    : "http://localhost:3333/";
export default SERVER_BASE_URL;
