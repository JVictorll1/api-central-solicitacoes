const API_URL = "https://api-central-solicitacoes.onrender.com";

// Mostrar de status do sistema
function mostrarMensagem(tipo, mensagem) {
    const elemento = document.getElementById("mensagemSistema");

    elemento.className = `alert alert-${tipo}`;
    elemento.textContent = mensagem;

    elemento.classList.remove("d-none");
}

// ========================================
// CONSULTAR TODAS
// ========================================

async function listarSolicitacoes() {

    try {

        const resposta = await fetch(`${API_URL}/solicitacoes`);

        if (!resposta.ok) {
            throw new Error("Erro ao consultar a API.");
        }

        const solicitacoes = await resposta.json();

        const tabela = document.getElementById("listaSolicitacoes");

        tabela.innerHTML = "";

        solicitacoes.forEach(function(solicitacao) {

            let classeStatus = "bg-secondary";

            if (solicitacao.status === "ABERTA") {
                classeStatus = "bg-primary";
            }

            if (solicitacao.status === "EM_ANALISE") {
                classeStatus = "bg-warning text-dark";
            }

            if (solicitacao.status === "CONCLUIDA") {
                classeStatus = "bg-success";
            }

            tabela.innerHTML += `
                <tr>
                    <td>${solicitacao.id}</td>
                    <td>${solicitacao.titulo}</td>
                    <td>${solicitacao.cpf_solicitante}</td>
                    <td>
                        <span class="badge ${classeStatus}">
                            ${solicitacao.status}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-info btn-sm" onclick="verSolicitacao(${solicitacao.id})">
                            Detalhes
                        </button>

                        <button class="btn btn-warning btn-sm" onclick="editarSolicitacao(${solicitacao.id})">
                            Editar
                        </button>

                        <button class="btn btn-secondary btn-sm" onclick="abrirModalStatus(${solicitacao.id}, '${solicitacao.status}')">
                            Status
                        </button>

                        <button class="btn btn-danger btn-sm" onclick="abrirModalExcluir(${solicitacao.id})">
                            Cancelar
                        </button>
                    </td>
                </tr>
            `;

        });

    } catch (erro) {

        console.error("Erro:", erro);

        const tabela = document.getElementById("listaSolicitacoes");

        tabela.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger">
                    Erro ao carregar solicitações.
                </td>
            </tr>
        `;

    }

}



// CRIAR
document.getElementById("formSolicitacao").addEventListener("submit", async function(event) {
    event.preventDefault();

    const dados = {
        titulo: document.getElementById("titulo").value,
        descricao: document.getElementById("descricao").value,
        cpfSolicitante: document.getElementById("cpf").value,
        status: document.getElementById("status").value
    };

    try {
        const resposta = await fetch(`${API_URL}/solicitacoes`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            mostrarMensagem("danger", resultado.message);
            return;
        }

        mostrarMensagem("success", resultado.message || "Solicitação cadastrada com sucesso.");

        document.getElementById("formSolicitacao").reset();

        await listarSolicitacoes();

    } catch (erro) {
        console.error("Erro:", erro);
        mostrarMensagem("danger", "Não foi possível comunicar com a API.");
    }
});


// ========================================
// DETALHES
// ========================================

async function verSolicitacao(id) {

    const resposta = await fetch(`${API_URL}/solicitacoes/${id}`);
    const solicitacao = await resposta.json();

    if (!resposta.ok) {
        return;
    }

    document.getElementById("detalheId").value = solicitacao.id;
    document.getElementById("detalheTitulo").value = solicitacao.titulo;
    document.getElementById("detalheDescricao").value = solicitacao.descricao;
    document.getElementById("detalheCpf").value = solicitacao.cpf_solicitante;
    document.getElementById("detalheStatus").value = solicitacao.status;

    const modal = new bootstrap.Modal(document.getElementById("modalDetalhes"));

    modal.show();

}


// ========================================
// EDITAR
// ========================================

async function editarSolicitacao(id) {

    const resposta = await fetch(`${API_URL}/solicitacoes/${id}`);
    const solicitacao = await resposta.json();

    if (!resposta.ok) {
        return;
    }

    document.getElementById("editarId").value = solicitacao.id;
    document.getElementById("editarTitulo").value = solicitacao.titulo;
    document.getElementById("editarDescricao").value = solicitacao.descricao;
    document.getElementById("editarCpf").value = solicitacao.cpf_solicitante;
    document.getElementById("editarStatus").value = solicitacao.status;

    const modal = new bootstrap.Modal(document.getElementById("modalEditar"));

    modal.show();

}


// ========================================
// SALVAR EDIÇÃO
// ========================================

document.getElementById("btnSalvarEdicao").addEventListener("click", async function() {

    const id = document.getElementById("editarId").value;

    const dados = {
        titulo: document.getElementById("editarTitulo").value,
        descricao: document.getElementById("editarDescricao").value,
        cpfSolicitante: document.getElementById("editarCpf").value,
        status: document.getElementById("editarStatus").value
    };

    const resposta = await fetch(`${API_URL}/solicitacoes/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dados)
    });

    if (resposta.ok) {

        const elemento = document.getElementById("modalEditar");
        const modal = bootstrap.Modal.getInstance(elemento);

        modal.hide();

        await listarSolicitacoes();

    } else {

        alert("Erro ao atualizar solicitação.");

    }

});


// ========================================
// ABRIR MODAL STATUS
// ========================================

function abrirModalStatus(id, statusAtual) {

    document.getElementById("statusId").value = id;
    document.getElementById("novoStatus").value = statusAtual;

    const modal = new bootstrap.Modal(document.getElementById("modalStatus"));

    modal.show();

}


// ========================================
// SALVAR STATUS
// ========================================

document.getElementById("btnSalvarStatus").addEventListener("click", async function() {

    const id = document.getElementById("statusId").value;
    const status = document.getElementById("novoStatus").value;

    const resposta = await fetch(`${API_URL}/solicitacoes/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            status: status
        })
    });

    if (resposta.ok) {

        const elemento = document.getElementById("modalStatus");
        const modal = bootstrap.Modal.getInstance(elemento);

        modal.hide();

        await listarSolicitacoes();

    } else {

        alert("Erro ao alterar status.");

    }

});


// ========================================
// ABRIR MODAL EXCLUSÃO
// ========================================

function abrirModalExcluir(id) {

    document.getElementById("excluirId").value = id;

    const modal = new bootstrap.Modal(document.getElementById("modalExcluir"));

    modal.show();

}


// ========================================
// CONFIRMAR EXCLUSÃO
// ========================================

document.getElementById("btnConfirmarExclusao").addEventListener("click", async function() {

    const id = document.getElementById("excluirId").value;

    const resposta = await fetch(`${API_URL}/solicitacoes/${id}`, {
        method: "DELETE"
    });

    if (resposta.ok) {

        const elemento = document.getElementById("modalExcluir");
        const modal = bootstrap.Modal.getInstance(elemento);

        modal.hide();

        await listarSolicitacoes();

    } else {

        alert("Erro ao cancelar solicitação.");

    }

});


// ========================================
// ATUALIZAR LISTAGEM
// ========================================

document.getElementById("btnAtualizar").addEventListener("click", listarSolicitacoes);


// ========================================
// INICIALIZAÇÃO
// ========================================

listarSolicitacoes();