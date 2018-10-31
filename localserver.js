const app = require("./backend/localapp");
const http = require("http");
const port = process.env.PORT || "3005";

const server = http.createServer(app);

server.listen(port);