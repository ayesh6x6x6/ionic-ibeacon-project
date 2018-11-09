const app = require("./backend/localapp");
const http = require("http");
const port = process.env.PORT || "3006";

const server = http.createServer(app);

server.listen(port);