import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { useToast } from "vue-toastification";

// States
const url = "http://localhost:3000";
const busca = ref("");
const produtos = ref([]);
const clientes = ref([]);
const formaPagamentos = ref([]);
const formaEntregas = ref([]);
const produtosFiltrados = ref([]);
const carrinho = ref([]);
const cliente = ref(null); // Cliente selecionado
const frete = ref(0.0); // Frete do cliente
const cashback = ref(0.0); // Cashback disponível do cliente
const toast = useToast(); // Toast notifications

export function useApp() {
  
   // Sincronização de produtos
    const sincronizarProdutos = async () => {
        try {
            const response = await axios.get(url + "/api/produtos");
            const produtosLocal = response.data;

            localStorage.setItem("produtos", JSON.stringify(produtosLocal));
            produtos.value = produtosLocal;
        } catch (err) {
            if (err.code === 'ERR_NETWORK') {
                // Erro de conexão recusada
                console.error("Erro de conexão: servidor não disponível.");
                toast.error("Erro de conexão: servidor não está respondendo.");
            } else if (err.response) {
                // Erro retornado pela API
                const { message, error } = err.response.data;
                console.error("Erro da API:", error);
                toast.error(`${message} - ${error}`);
            } else {
                // Outros tipos de erro (como timeout ou erro desconhecido)
                console.error("Erro desconhecido:", err);
                toast.error("Erro ao sincronizar Produtos.");
            }
        }
    };

    // Sincronização de clientes
    const sincronizarClientes = async () => {
        try {
            const response = await axios.get(url + "/api/clientes");
            const clientesLocal = response.data;

            localStorage.setItem("clientes", JSON.stringify(clientesLocal));
            clientes.value = clientesLocal;
            //console.log('clientes', clientes);
        } catch (err) {
            if (err.code === 'ERR_NETWORK') {
                // Erro de conexão recusada
                console.error("Erro de conexão: servidor não disponível.");
                toast.error("Erro de conexão: servidor não está respondendo.");
            } else if (err.response) {
                // Erro retornado pela API
                const { message, error } = err.response.data;
                console.error("Erro da API:", error);
                toast.error(`${message} - ${error}`);
            } else {
                // Outros tipos de erro (como timeout ou erro desconhecido)
                console.error("Erro desconhecido:", err);
                toast.error("Erro ao sincronizar Cientes.");
            }
        }
    };


    // Sincronização de forma de entregas
    const sincronizarFormaPagamentos = async () => {
        try {
            const response = await axios.get(url + "/api/formaPagamentos");
            const formaPagamentosLocal = response.data;

            localStorage.setItem("formaPagamentos", JSON.stringify(formaPagamentosLocal));
            formaPagamentos.value = formaPagamentosLocal;
            //console.log('formaPagamentos', formaPagamentos);
        } catch (err) {
           // console.log('err formaPagamentos', err.code);
            if (err.code === 'ERR_NETWORK') {
                // Erro de conexão recusada
                console.error("Erro de conexão: servidor não disponível.");
                toast.error("Erro de conexão: servidor não está respondendo.");
            } else if (err.response) {
                // Erro retornado pela API
                const { message, error } = err.response.data;
                console.error("Erro da API:", error);
                toast.error(`${message} - ${error}`);
            } else {
                // Outros tipos de erro (como timeout ou erro desconhecido)
                console.error("Erro desconhecido:", err);
                toast.error("Erro ao sincronizar Forma de Pagamentos.");
            }
        }
    };

    // Sincronização de formaEntregas
    const sincronizarFormaEntregas = async () => {
        try {
            const response = await axios.get(url + "/api/formaEntregas");
            const formaEntregasLocal = response.data;

            localStorage.setItem("formaEntregas", JSON.stringify(formaEntregasLocal));
            formaEntregas.value = formaEntregasLocal;
           // console.log('formaEntregas', formaEntregas);
        } catch (err) {
            console.log('err formaEntregas', err);
            if (err.code === 'ERR_NETWORK') {
                // Erro de conexão recusada
                console.error("Erro de conexão: servidor não disponível.");
                toast.error("Erro de conexão: servidor não está respondendo.");
            } else if (err.response) {
                // Erro retornado pela API
                const { message, error } = err.response.data;
                console.error("Erro da API:", error);
                toast.error(`${message} - ${error}`);
            } else {
                // Outros tipos de erro (como timeout ou erro desconhecido)
                console.error("Erro desconhecido:", err);
                toast.error("Erro ao sincronizar Forma de Entregas.");
            }
        }
    };

    // Busca local de produtos
    const buscarLocalmente = () => {
        const buscaLower = busca.value.toLowerCase();
        produtosFiltrados.value = produtos.value.filter(produto =>
            produto.nome_completo.toLowerCase().includes(buscaLower) ||
            produto.subcodigo.toLowerCase().includes(buscaLower)
        );
    };

    // Adicionar ao carrinho
    const adicionarAoCarrinho = (produto) => {
        const itemCarrinho = carrinho.value.find(item => item.variacao_id === produto.variacao_id);

        if (itemCarrinho) {
            itemCarrinho.quantidade++;
        } else {
            carrinho.value.push({ ...produto, quantidade: 1 });
        }

        busca.value = "";
        produtosFiltrados.value = [];
    };

    // Aumentar quantidade
    const aumentarQuantidade = (index) => {
        carrinho.value[index].quantidade++;
    };

    // Diminuir quantidade
    const diminuirQuantidade = (index) => {
        if (carrinho.value[index].quantidade > 1) {
            carrinho.value[index].quantidade--;
        } else {
            removerDoCarrinho(index);
        }
    };

    // Remover do carrinho
    const removerDoCarrinho = (index) => {
        carrinho.value.splice(index, 1);
    };

    // Buscar cliente por CPF ou TELEFONE
    const buscarCliente = (cpfOuTelefone) => {
        if (!cpfOuTelefone || cpfOuTelefone.trim() === "") {
            toast.error("Por favor, digite o CPF ou Telefone do cliente.");
            return false;
        }
    
        // Remove formatação do CPF (somente números)
        const dadoLimpo = cpfOuTelefone.replace(/\D/g, ""); // Remove qualquer caractere não numérico
    
        // Adiciona DDD padrão se o dado tiver tamanho de telefone sem DDD
        let telefoneComDDD = dadoLimpo;
        const DDD_PADRAO = "21"; // Substitua pelo DDD desejado
    
        if (telefoneComDDD.length === 8 || telefoneComDDD.length === 9) {
            telefoneComDDD = `${DDD_PADRAO}${telefoneComDDD}`;
        }
    
        // Busca cliente por CPF ou Telefone
        const clienteEncontrado = clientes.value.find(cliente => 
            cliente.cpf === dadoLimpo || cliente.telefone === telefoneComDDD
        );
    
        if (clienteEncontrado) {
            cliente.value = clienteEncontrado;
            frete.value = clienteEncontrado.taxa;
            cashback.value = clienteEncontrado.cashback_disponivel;
            return true;
        } else {
            toast.error("Cliente não encontrado.");
            return false;
        }
    };
    

    // Subtotal
    const subtotal = computed(() => {
        return carrinho.value.reduce((acc, produto) => {
            const valorUnitario = produto.quantidade >= 5
                ? parseFloat(produto.valor_atacado || 0)
                : parseFloat(produto.valor_varejo || 0);
            return acc + valorUnitario * produto.quantidade;
        }, 0);
    });

    // Total
    const totalGeral = computed(() => {
        const valorTotal = parseFloat(subtotal.value || 0) + parseFloat(frete.value || 0);
        return Math.max(valorTotal - parseFloat(cashback.value || 0), 0);
    });

    // Formatar moeda
    const formatarMoeda = (valor) => {
        if (valor == null) return "R$ 0,00";
        return new Intl.NumberFormat("pt-BR", {style: "currency",currency: "BRL",}).format(valor);
    };

    //Retorna as formas de paamentos , não deixando repetir a oção selecionada nos combos
    const formasPagamentoDisponiveis = (pagamentos, index) => {
        const selecionados = pagamentos.map((pgto) => pgto.id);
        const usados = [...selecionados.slice(0, index), ...selecionados.slice(index + 1)];
        return formaPagamentos.value.filter((forma) => !usados.includes(forma.id));
    };

    //Função para Gerar Número Aleatório de Venda 
    const  gerarNumeroVenda = () => {
        const prefixo = "KN";
        const numeroAleatorio = Math.floor(100000 + Math.random() * 900000); // Gera um número entre 100000 e 999999
        return `${prefixo}${numeroAleatorio}`;
    }

    const salvarVenda = async (venda) => {
        try {
            // Enviar os dados da venda para o backend
            const response = await axios.post(url + "/api/vendas", venda);
            console.log('Venda registrada com sucesso:', response.data);
    
            // Se você precisar retornar a resposta, pode fazer isso
            return response.data;
        } catch (error) {
            console.error('Erro ao registrar venda:', error);
            // Se precisar retornar algum erro ou mensagem, pode fazer aqui
            throw error;  // Pode lançar o erro novamente ou retornar uma mensagem
        }
    };

    // Montagem inicial
    onMounted(() => {
            sincronizarProdutos();
            sincronizarClientes();
            sincronizarFormaPagamentos();
            sincronizarFormaEntregas();
    });

    // Retorno
    return {
        busca,
        produtosFiltrados,
        carrinho,
        buscarLocalmente,
        adicionarAoCarrinho,
        removerDoCarrinho,
        aumentarQuantidade,
        diminuirQuantidade,
        subtotal,
        totalGeral,
        frete,
        cashback,
        buscarCliente,
        cliente,
        sincronizarClientes,
        formatarMoeda,
        formaPagamentos,
        formaEntregas,
        formasPagamentoDisponiveis,
        gerarNumeroVenda,
        salvarVenda
    };
}
