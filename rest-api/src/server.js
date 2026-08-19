// Chamada de dados do .env
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./database");
const { consultarCliente } = require("./soap-client");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// GET - Raiz
app.get("/", (req, res) => {
    res.json({
        message: "API Central de Solicitações funcionando!"
    });
});

// GET - Consultar todas as solicitações
app.get("/solicitacoes", async (req, res) => {
    console.log("GET /solicitacoes foi chamado");

    try {
        const resultado = await pool.query(
            "SELECT * FROM solicitacoes ORDER BY id"
        );

        console.log("Resultado:", resultado.rows);

        return res.status(200).json(resultado.rows);

    } catch (error) {
        console.error("ERRO BANCO:", error);

        return res.status(500).json({
            message: "Erro ao consultar solicitações.",
            error: error.message
        });
    }
});

// GET - Consultar solicitação pelo ID
app.get("/solicitacoes/:id", async (req, res) => {
    const id = Number(req.params.id);

    try {
        const resultado = await pool.query(
            "SELECT * FROM solicitacoes WHERE id = $1",
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                message: "Solicitação não encontrada."
            });
        }

        return res.status(200).json(resultado.rows[0]);

    } catch (error) {
        console.error("Erro ao consultar solicitação:", error);

        return res.status(500).json({
            message: "Erro ao consultar solicitação."
        });
    }
});

// POST - Criar uma solicitação
app.post("/solicitacoes", async (req, res) => {
    try {
        const { titulo, descricao, cpfSolicitante, status } = req.body;

        if (!titulo || !descricao || !cpfSolicitante) {
            return res.status(400).json({
                message: "Título, descrição e CPF do solicitante são obrigatórios."
            });
        }

        // Consulta assíncrona ao sistema legado SOAP
        const cliente = await consultarCliente(cpfSolicitante);
        // TEMPORÁRIO!!!!
        console.log("Resposta do SOAP:", JSON.stringify(cliente, null, 2));

        // CPF não existe no sistema legado
        if (!cliente.sucesso) {
            return res.status(400).json({
                message: "CPF não encontrado no sistema legado. Solicitação não cadastrada."
            });
        }

        // CPF existe, então cadastra no PostgreSQL
        const resultado = await pool.query(
            `INSERT INTO solicitacoes (titulo, descricao, cpf_solicitante, status)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [titulo, descricao, cpfSolicitante, status || "ABERTA"]
        );

        return res.status(201).json({
            message: "Solicitação cadastrada com sucesso.",
            solicitacao: resultado.rows[0],
            cliente: {
                nome: cliente.nome,
                matricula: cliente.matricula,
                situacao: cliente.situacao
            }
        });

    } catch (error) {
        console.error("Erro ao criar solicitação:", error);

        return res.status(500).json({
            message: "Erro ao criar solicitação."
        });
    }
});

// PUT - Alterar uma Solicitação
app.put("/solicitacoes/:id", async (req, res) => {
    const id = Number(req.params.id);

    const {
        titulo,
        descricao,
        cpfSolicitante,
        status
    } = req.body;

    // Validar campos obrigatórios
    if (!titulo || !descricao || !cpfSolicitante || !status) {
        return res.status(400).json({
            message: "Título, descrição, CPF do solicitante e status são obrigatórios."
        });
    }

    try {
        const resultado = await pool.query(
            `UPDATE solicitacoes
             SET
                titulo = $1,
                descricao = $2,
                cpf_solicitante = $3,
                status = $4
             WHERE id = $5
             RETURNING *`,
            [
                titulo,
                descricao,
                cpfSolicitante,
                status,
                id
            ]
        );

        // Verificar se a solicitação existe
        if (resultado.rows.length === 0) {
            return res.status(404).json({
                message: "Solicitação não encontrada."
            });
        }

        return res.status(200).json(resultado.rows[0]);

    } catch (error) {
        console.error("Erro ao atualizar solicitação:", error);

        return res.status(500).json({
            message: "Erro ao atualizar solicitação."
        });
    }
});

// PATCH - Alterar o status da Solicitação
app.patch("/solicitacoes/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body;

    // Validar status
    if (!status) {
        return res.status(400).json({
            message: "O status é obrigatório."
        });
    }

    try {
        const resultado = await pool.query(
            `UPDATE solicitacoes
             SET status = $1
             WHERE id = $2
             RETURNING *`,
            [status, id]
        );

        // Verificar se a solicitação existe
        if (resultado.rows.length === 0) {
            return res.status(404).json({
                message: "Solicitação não encontrada."
            });
        }

        return res.status(200).json(resultado.rows[0]);

    } catch (error) {
        console.error("Erro ao atualizar status:", error);

        return res.status(500).json({
            message: "Erro ao atualizar status da solicitação."
        });
    }
});

// DELETE - Cancelar/Excluir uma solicitação
app.delete("/solicitacoes/:id", async (req, res) => {
    const id = Number(req.params.id);

    try {
        const resultado = await pool.query(
            `UPDATE solicitacoes
             SET status = 'CANCELADA'
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        // Verificar se a solicitação existe
        if (resultado.rows.length === 0) {
            return res.status(404).json({
                message: "Solicitação não encontrada."
            });
        }

        return res.status(200).json({
            message: "Solicitação cancelada com sucesso.",
            solicitacao: resultado.rows[0]
        });

    } catch (error) {
        console.error("Erro ao cancelar solicitação:", error);

        return res.status(500).json({
            message: "Erro ao cancelar solicitação."
        });
    }
});

// Testar Banco de Dados
app.get("/teste-banco", async (req, res) => { 
    try { 
        const resultado = await pool.query("SELECT NOW()"); 
        return res.status(200).json({ 
            message: "Conexão com PostgreSQL realizada com sucesso.", data: resultado.rows[0] 
        }); 
    } catch (error) { 
        console.error(error); 
        return res.status(500).json({ 
            message: "Erro ao conectar ao banco de dados." 
        }); 
    } 
});

// Rota de Teste SOAP
app.get("/cliente/:cpf", async (req, res) => {
    try {
        const cpf = req.params.cpf;
        const cliente = await consultarCliente(cpf);
        return res.status(200).json(cliente);
    } catch (error) {
        console.error("Erro ao consultar SOAP:", error);
        return res.status(500).json({
            message: "Erro ao consultar sistema legado."
        });
    }
});

// Definir porta do Servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});