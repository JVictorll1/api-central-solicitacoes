const soap = require("soap");

const url = "http://localhost:4000/legacy?wsdl";

soap.createClient(url, (error, client) => {
    if (error) {
        console.error("Erro ao criar cliente SOAP:", error);
        return;
    }

    console.log("Cliente SOAP conectado.");

    client.consultarCliente(
        {
            cpf: "12345678900"
        },
        (error, result) => {

            if (error) {
                console.error("Erro na chamada SOAP:", error);
                return;
            }

            console.log("Resposta SOAP:");
            console.log(result);
        }
    );
});