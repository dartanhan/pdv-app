<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg shadow-lg w-[90%] max-w-3xl p-6">
      <div class="flex justify-between items-center border-b pb-4">
        <h2 class="text-2xl font-bold text-blue-600">
          Fechamento de Venda
        </h2>
        <button
          class="text-gray-600 hover:text-gray-900"
          @click="close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div class="mt-4 space-y-6">
        <!-- Formas de Pagamento -->
        <div>
          <h3 class="text-lg font-medium">
            Formas de Pagamento
          </h3>

          <!-- Listagem das formas de pagamento adicionadas -->
          <div
            v-for="(pgto, index) in pagamentos"
            :key="index"
            class="flex items-center space-x-4 mb-2"
          >
            <select
              v-model="pgto.id"
              class="border rounded-lg p-2 w-1/2"
              @change="atualizarValorPagamento(index)"
            >
              <option value="">
                Selecione uma opção
              </option>
              <option
                v-for="forma in formasPagamentoDisponiveis(pagamentos, index)"
                :key="forma.id"
                :value="forma.id"
              >
                {{ forma.nome }}
              </option>
            </select>
                        
            <input
              :id="`pagamento-valor-${index}`"
              v-model="pgto.valor"             
              type="text"
              placeholder="Valor"
              class="border rounded-lg p-2 w-1/2"
              @input="validarEAtualizarValoresPagamento(index)" 
              @blur="validarEAtualizarValoresPagamento(index)"              
            >
                          
            <button
              v-if="pagamentos.length > 1"
              class="text-red-500 hover:text-red-700"
              title="Remover"
              @click="removerPagamento(index)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Botão para adicionar nova forma de pagamento -->
          <button
            class="text-blue-500 hover:text-blue-700"
            @click="adicionarPagamento"
          >
            + Adicionar Pagamento
          </button>
        </div>

        <!-- Forma de Entrega -->
        <div>
          <h3 class="text-lg font-medium">
            Forma de Entrega
          </h3>
          <select
            v-model="formaEntrega"
            class="border rounded-lg p-2 w-full"
          >
            <option value="">
              Selecione uma opção
            </option>
            <option
              v-for="forma in formaEntregas"
              :key="forma.id"
              :value="forma.id"
            >
              {{ forma.nome }}
            </option>
          </select>
        </div>

        <!-- Total e Frete -->
        <div>
          <h3 class="text-lg font-medium">
            Resumo
          </h3>
          <p>SubTotal: <span class="font-bold">{{ formatarMoeda(subtotal) }}</span></p>
          <p>Frete: <span class="font-bold">{{ formatarMoeda(frete) }}</span></p>
          <p>Cashback: <span class="font-bold">{{ formatarMoeda(cashback) }}</span></p>
          <p>Total Geral: <span class="font-bold">{{ formatarMoeda(totalGeral) }}</span></p>
        </div>

        <!-- Botão para Finalizar -->
        <div class="flex justify-end">
          <button
            class="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            @click="finalizarVenda"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 inline"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M16.707 4.293a1 1 0 010 1.414L8.414 14l-3.707-3.707a1 1 0 011.414-1.414L8.414 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="font-bold">Finalizar Venda</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useApp } from "@/composables/useApp";


// Props
 defineProps({
   show: {
     type: Boolean,
     default: false,
   },
 });

// Emits
const emit = defineEmits(["close", "finalizar"]);

// Importando os estados e métodos globais
const {
  //formaPagamentos,
  formaEntregas,
  subtotal,
  totalGeral,
  carrinho,
  frete,
  cashback,
  formatarMoeda,
  formasPagamentoDisponiveis,
  gerarNumeroVenda,
} = useApp();

// Estados locais
const pagamentos = ref([{ id: "", valor: 0 }]);
const formaEntrega = ref("");

// Métodos locais
const adicionarPagamento = () => {
  pagamentos.value.push({ id: "", valor: 0 });
  validarEAtualizarValoresPagamento(0);
};

const removerPagamento = (index) => {
  pagamentos.value.splice(index, 1);
  if (pagamentos.value.length === 1) {
    pagamentos.value[0].valor = totalGeral.value;
  }
  validarEAtualizarValoresPagamento(0);
};

const close = () => {
    emit("close");
};

const atualizarValorPagamento = (index) => {
  if (index === 0 && pagamentos.value.length === 1) {
    pagamentos.value[0].valor = totalGeral.value.toFixed(2);
  }
  validarEAtualizarValoresPagamento(index);
};

const validarEAtualizarValoresPagamento = (index) => {
  let valorAtual = parseFloat(
    (pagamentos.value[index].valor || "")
      .toString()
      .replace(/[^0-9.-]+/g, "")
      .replace(",", ".")
  );

  if (isNaN(valorAtual)) {
    pagamentos.value[index].valor = "";
    return;
  }

  pagamentos.value[index].valor = valorAtual.toString();

  let totalRestante = totalGeral.value - valorAtual;

  if (index === 0) {
    const outrosPagamentos = pagamentos.value.slice(1);
    outrosPagamentos.forEach((pgto) => {
      const outroIndex = pagamentos.value.indexOf(pgto);
      const novoValor = totalRestante / outrosPagamentos.length;
      pagamentos.value[outroIndex].valor = novoValor > 0 ? novoValor.toString() : "";
    });
  } else {
    pagamentos.value.forEach((pgto, i) => {
      if (i !== index) {
        const outroIndex = pagamentos.value.indexOf(pgto);
        const novoValor = totalRestante / (pagamentos.value.length - 1);
        pagamentos.value[outroIndex].valor = novoValor > 0 ? novoValor.toString() : "";
      }
    });
  }

  const somaValores = pagamentos.value.reduce((acc, pgto) => {
    const valor = parseFloat(
      (pgto.valor || "0").toString().replace(/[^0-9.-]+/g, "").replace(",", ".")
    );
    return acc + (isNaN(valor) ? 0 : valor);
  }, 0);

  if (somaValores > totalGeral.value) {
    const excesso = somaValores - totalGeral.value;
    pagamentos.value[index].valor = (valorAtual - excesso).toString();
  }
};

const finalizarVenda = () => {
  const dadosVenda = {
    numeroVenda: gerarNumeroVenda(),
    carrinho: carrinho.value.map((item) => ({
      ...item,
      valor_venda: item.quantidade >= 5 ? item.valor_atacado : item.valor_varejo,
    })),
    pagamentos: pagamentos.value.map((pgto) => ({
      id: pgto.id,
      valor: parseFloat(
        pgto.valor.toString().replace(/[^\d,.-]/g, "").replace(",", ".")
      ),
    })),
    formaEntrega: formaEntrega.value,
    frete: frete.value,
    cashback: cashback.value,
    total: totalGeral.value,
  };
  emit("finalizar", dadosVenda);
};
</script>
