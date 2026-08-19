const dadosLegado = {
    "12345678900": {
        cpf: "12345678900",
        nome: "João da Silva",
        matricula: "LEG-001",
        situacao: "ATIVO"
    },

    "98765432100": {
        cpf: "98765432100",
        nome: "Maria da Silva",
        matricula: "LEG-002",
        situacao: "ATIVO"
    }
};

const service = {
    LegacyService: {
        LegacyPort: {

            consultarCliente: function (args) {
                const cpf = args.cpf;

                const cliente = dadosLegado[cpf];

                if (!cliente) {
                    return {
                        sucesso: false,
                        mensagem: "Cliente não encontrado."
                    };
                }

                return {
                    sucesso: true,
                    mensagem: "Cliente encontrado.",
                    cpf: cliente.cpf,
                    nome: cliente.nome,
                    matricula: cliente.matricula,
                    situacao: cliente.situacao
                };
            }

        }
    }
};

module.exports = service;