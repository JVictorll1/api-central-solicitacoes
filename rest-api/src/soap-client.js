const soap = require("soap");
const SOAP_URL = "https://legacy-soap-service.onrender.com/legacy?wsdl";

async function consultarCliente(cpf) {
    const client = await soap.createClientAsync(SOAP_URL);
    const resultado = await client.consultarClienteAsync({
        cpf: cpf
    });

    return resultado[0];
}

module.exports = {
    consultarCliente
};