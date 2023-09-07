const URL =
  process.env.NODE_ENV === "production"
    ? "http://localhost:8065/"
    : "https://localhost:3333/";
export default URL;
