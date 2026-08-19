const http = require("http");
const fs = require("fs");
const soap = require("soap");

const service = require("./service");

const wsdl = fs.readFileSync(
    __dirname + "/service.wsdl",
    "utf8"
);

const server = http.createServer((req, res) => {
    res.statusCode = 404;
    res.end();
});

const PORT = process.env.PORT || 4000;

soap.listen(
    server,
    "/legacy",
    service,
    wsdl
);

server.listen(PORT, () => {
    console.log(`SOAP Service rodando na porta ${PORT}`);
    console.log(`WSDL: http://localhost:${PORT}/legacy?wsdl`);
});