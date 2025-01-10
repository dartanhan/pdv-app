<template>
  <div class="min-h-screen bg-gray-50 p-6 flex justify-between">
    <!-- Carrinho de Vendas -->
    <div class="w-2/3 bg-white shadow-2xl rounded-lg p-8 relative">
      <h1 class="text-3xl font-bold text-blue-600 mb-6">
        Carrinho de Vendas
      </h1>

      <!-- Input de busca -->
      <div class="mb-6">
        <input
          ref="inputBusca"
          v-model="busca"
          type="text"
          placeholder="Digite código ou descrição..."
          class="w-full p-4 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          @input="buscarLocalmente"
        >
      </div>

      <!-- Produtos encontrados -->
      <div>
        <ul
          v-if="produtosFiltrados.length"
          class="absolute w-3/4 bg-white shadow-lg border border-gray-300 rounded-lg overflow-y-auto max-h-80 z-50"
        >
          <li
            v-for="produto in produtosFiltrados"
            :key="produto.variacao_id"
            class="p-4 bg-white hover:bg-gray-50 cursor-pointer flex justify-between items-center transition duration-150 ease-in-out"
            @click="adicionarAoCarrinhoComFocus(produto)"
          >
            <span class="font-medium">{{ produto.nome_completo }}</span>
            <span class="text-sm text-gray-500 font-bold">{{ formatarMoeda(produto.valor_varejo || 0) }}</span>
          </li>
        </ul>
      </div>

      <!-- Carrinho -->
      <div>
        <div
          v-if="carrinho.length"
          class="mb-4"
        >
          <div class="flex justify-between items-center border-b-2 border-gray-300 pb-2 text-right mb-2">
            <span class="font-medium w-1/2 text-left">Produto</span>
            <span class="font-medium w-1/2">Quantidade</span>
            <span class="font-medium w-1/4">Valor Unitário</span>
            <span class="font-medium w-1/4">Total</span>
          </div>

          <ul class="space-y-1 divide-y divide-gray-200 overflow-y-auto max-h-[calc(95vh-250px)]">
            <li
              v-for="(produto, index) in carrinho"
              :key="produto.variacao_id"
              :class="[ 
                'p-4 border rounded-lg flex justify-between items-center',
                produto.quantidade >= qtd ? 'bg-orange-100 border-orange-300' : 'bg-blue-50 border-blue-200'
              ]"
            >
              <button
                class="mr-4 text-red-500 hover:text-red-700"
                @click="removerDoCarrinho(index)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  class="w-6 h-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <span class="font-medium w-1/2 text-left">{{ produto.nome_completo }}</span>

              <span class="font-medium w-1/4 text-right">
                <button
                  class="bg-red-500 text-white px-2 py-1 rounded-full"
                  @click="diminuirQuantidade(index)"
                >-</button>
                {{ produto.quantidade }}
                <button
                  class="bg-green-500 text-white px-2 py-1 rounded-full"
                  @click="aumentarQuantidade(index)"
                >+</button>
              </span>
              <span class="text-lg font-bold text-blue-600 w-1/4 text-right">
                {{ formatarMoeda(produto.quantidade >= qtd ? produto.valor_atacado : produto.valor_varejo) }}
              </span>
              <span class="text-lg font-bold text-blue-600 w-1/5 text-right">
                {{ formatarMoeda(produto.quantidade * (produto.quantidade >= qtd ? parseFloat(produto.valor_atacado || 0) : parseFloat(produto.valor_varejo || 0))) }}
              </span>
            </li>
          </ul>
        </div>
        <div
          v-else
          class="text-gray-600"
        >
          O carrinho está vazio.
        </div>
      </div>
    </div>


    <!-- Totais e Frete -->
    <div class="w-1/3 bg-white shadow-2xl rounded-lg p-8 ml-6 flex flex-col">
      <h2 class="text-2xl font-semibold text-blue-600 mb-4">
        Resumo da Compra
      </h2>
      <div class="mt-6 border-t border-gray-300 pt-4 flex-1">
        <div class="flex justify-between items-center">
          <span class="font-medium">Subtotal:</span>
          <span class="font-bold">{{ formatarMoeda(subtotal) }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="font-medium">Frete:</span>
          <span class="font-bold">{{ formatarMoeda(frete) }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="font-medium">Cashback:</span>
          <span class="font-bold">{{ formatarMoeda(cashback) }}</span>
        </div>
        <div class="flex justify-between items-center mt-4 bg-gray-50">
          <span class="font-semibold text-2xl">Total:</span>
          <span class="font-bold text-2xl">{{ formatarMoeda(totalGeral) }}</span>
        </div>
        <!-- Input de busca de cliente -->
        <hr>
        <div
          v-if="mostrarPesquisa"
          class="mb-6 flex items-center mt-4"
        > 
          <input 
            ref="inputCpf" 
            v-model="cpf" 
            type="text"
            placeholder="Digite o CPF do cliente..." 
            class="w-full p-4 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @keydown.enter="adicionarClienteComFocus(cpf)" 
          >
          <button
            class="ml-4 bg-blue-600 text-white p-4 rounded-lg shadow-md"
            @click="adicionarClienteComFocus(cpf)"
          >
            Pesquisar
          </button> 
        </div>
        <!-- Cliente -->
        <div
          v-if="cliente"
          class="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between mt-4"
        > 
          <div>
            <p>Cliente: {{ cliente.nome }}</p> 
            <p>Frete: {{ formatarMoeda(cliente.taxa) }}</p>
          </div>
          <!-- Botão para alterar o cliente com ícone -->
          <button
            class="ml-4 bg-orange-600 text-white p-2 rounded-lg flex items-center"
            @click="alterarCliente"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              class="w-5 h-5 mr-2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 3l4 4-10 10H7v-4L17 3z"
              />
            </svg>
            Alterar Cliente
          </button>
        </div>
      </div>

      <!-- Rodapé com o botão Fechar Venda -->
      <div class="mt-auto text-left">
        <button
          class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          @click="abrirModal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 inline"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M2 2h2l.401 2H20a1 1 0 01.98 1.198l-1.2 6a1 1 0 01-.98.802H7.403l-.14.7H19a1 1 0 110 2H6a1 1 0 01-.98-1.198l.19-.952-.56-2.8H3a1 1 0 110-2h2.192l1.145 5.723L6.51 6.095 5.64 2H2a1 1 0 010-2zm15.895 18a2 2 0 100 4 2 2 0 000-4zM6 20a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          <span class="font-bold">Fechar Venda</span>
        </button>
      </div>
    </div>
    <ModalFecharVenda
      :show="exibirModal"
      :carrinho="carrinho"
      :frete="parseFloat(frete)"
      :cliente-id="cliente ? cliente.id : null"
      :cliente-nome="cliente ? cliente.nome : null"
      :cashback="parseFloat(cashback)"
      @close="fecharModal"
      @finalizar="enviarVenda"
    />
  </div>
</template>

<script>
import { ref, onMounted, nextTick} from "vue";
import { useApp } from '@/composables/useApp';
import ModalFecharVenda from '@/components/ModalFecharVenda.vue';

export default {
  name: 'CarrinhoDeVendas',
   components: { ModalFecharVenda },
  
  setup() {
    const {
      busca,
      produtosFiltrados,
      carrinho,
      buscarLocalmente,
      adicionarAoCarrinho,
      removerDoCarrinho,
      subtotal,
      totalGeral,
      frete,
      cliente,
      cpf = ref(null),
      buscarCliente,
      formatarMoeda,
      diminuirQuantidade,
      aumentarQuantidade,
      cashback,
      salvarVenda
    } = useApp();
   
    const inputBusca = ref(null);  // Crie a referência para o input
    const mostrarPesquisa = ref(false);  // Controle para esconder/mostrar o campo de pesquisa
    const inputCpf = ref(null);  
    const qtd = ref(5);  //qauntidade para atacado e varejo
    //const cashback = ref();
     // Use o onMounted para focar no campo de entrada ao carregar a página
     onMounted(() => {
      nextTick(() => {
       // Garantir que o foco seja aplicado após a renderização dos inputs
       if (inputBusca.value) {
          inputBusca.value.focus(); // Foca no campo de busca
        }
      });
    });

    // Função para adicionar ao carrinho e focar no campo de entrada
    const adicionarAoCarrinhoComFocus = (produto) => {
      adicionarAoCarrinho(produto); // Adicionar o produto ao carrinho
      nextTick(() => {
        if (inputBusca.value) {
          inputBusca.value.focus(); // Focar novamente no input
        }
      });
      mostrarPesquisa.value = true;
    };

    const adicionarClienteComFocus = (cpf) => {
      const cliente = buscarCliente(cpf);
      if(cliente){
        nextTick(() => {
          if (inputBusca.value) {
            inputBusca.value.focus(); // Focar novamente no input
          }
        });

       // Esconder o campo de pesquisa
       mostrarPesquisa.value = false;
      }else{
        // Exibe o campo de pesquisa
        mostrarPesquisa.value = true;
      }
      
    };

      // Função para alterar o cliente
    const alterarCliente = () => {
      // Mostrar novamente o campo de pesquisa
      mostrarPesquisa.value = true;
      // Limpar as informações
      frete.value = 0; // Zera o frete
      cashback.value = 0; // Zera o frete
      cpf.value = '';
      cliente.value = null;
      nextTick(() => {
        if (inputCpf.value) {
          inputCpf.value.focus(); // Focar novamente no input
        }
      });
    };

    return {
      busca,
      produtosFiltrados,
      carrinho,
      buscarLocalmente,
      adicionarAoCarrinho,
      removerDoCarrinho,
      subtotal,
      totalGeral,
      frete,
      formatarMoeda,
      inputBusca,  
      adicionarAoCarrinhoComFocus,// Retorne a referência para o input
      buscarCliente,
      cliente,
      cpf,
      adicionarClienteComFocus,
      mostrarPesquisa,  // Retorne a variável para controlar a visibilidade
      alterarCliente,  // Função para alterar o cliente
      inputCpf,
      diminuirQuantidade,
      aumentarQuantidade,
      qtd,
      cashback,
      salvarVenda
    };
  },
  data() {
    return {
      exibirModal: false,

    };
  },
  methods: {
    abrirModal() {
      this.exibirModal = true;
    },
    fecharModal() {
      this.exibirModal = false;
    },
    enviarVenda(dadosVenda) {
        //console.log('Dados da Venda:', dadosVenda);
       // Adicionar os dados do cliente à venda
       const venda = {
        ...dadosVenda,
        clienteId: this.cliente ? this.cliente.id : null,  // Adicionando o ID do cliente
        clienteNome: this.cliente ? this.cliente.nome : null,  // Adicionando o nome do cliente
        // Outras informações que você deseja passar sobre o cliente
      };
      console.log('Venda :', venda);
      this.salvarVenda(venda);
      

      this.fecharModal();
      // Aqui você pode fazer a chamada para a API
    },
  }
};
</script>
