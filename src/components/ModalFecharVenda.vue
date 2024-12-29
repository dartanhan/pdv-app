<template>
    <div v-if="show" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-lg w-[90%] max-w-3xl p-6">
            <div class="flex justify-between items-center border-b pb-4">
                <h2 class="text-2xl font-bold text-blue-600">Fechamento de Venda</h2>
                <button @click="close" class="text-gray-600 hover:text-gray-900">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div class="mt-4 space-y-6">
                <!-- Formas de Pagamento -->
                <div>
                    <h3 class="text-lg font-medium">Formas de Pagamento</h3>

                    <!-- Listagem das formas de pagamento adicionadas -->
                    <div v-for="(pgto, index) in pagamentos" :key="index" class="flex items-center space-x-4 mb-2">
                        <select v-model="pgto.id" @change="atualizarValorPagamento(index)" class="border rounded-lg p-2 w-1/2">
                            <option value="">Selecione uma opção</option>
                            <option v-for="forma in formasPagamentoDisponiveis(pagamentos, index)" :key="forma.id" :value="forma.id">
                                {{ forma.nome }}
                            </option>
                        </select>
                        
                        <input
                            type="text"
                            :id="`pagamento-valor-${index}`"
                            v-model="pgto.valor"
                            placeholder="Valor"
                            @input="validarEAtualizarValoresPagamento(index)"
                            class="border rounded-lg p-2 w-1/2"
                            @blur="validarEAtualizarValoresPagamento(index)" 
                        />
                          
                        <button v-if="pagamentos.length > 1" @click="removerPagamento(index)" class="text-red-500 hover:text-red-700" title="Remover">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>

                    <!-- Botão para adicionar nova forma de pagamento -->
                    <button @click="adicionarPagamento" class="text-blue-500 hover:text-blue-700">
                        + Adicionar Pagamento
                    </button>
                </div>

                <!-- Forma de Entrega -->
                <div>
                    <h3 class="text-lg font-medium">Forma de Entrega</h3>
                    <select v-model="formaEntrega" class="border rounded-lg p-2 w-full">
                        <option value="">Selecione uma opção</option>
                        <option v-for="forma in formaEntregas" :key="forma.id" :value="forma.id">
                            {{ forma.nome }}
                        </option>
                    </select>
                </div>

                <!-- Total e Frete -->
                <div>
                    <h3 class="text-lg font-medium">Resumo</h3>
                    <p>SubTotal: <span class="font-bold">{{ formatarMoeda(subtotal) }}</span></p>
                    <p>Frete: <span class="font-bold">{{ formatarMoeda(frete) }}</span></p>
                    <p>Cashback: <span class="font-bold">{{ formatarMoeda(cashback) }}</span></p>
                    <p>Total Geral: <span class="font-bold">{{ formatarMoeda(totalGeral) }}</span></p>
                </div>

                <!-- Botão para Finalizar -->
                <div class="flex justify-end">
                    <button @click="finalizarVenda" class="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline" viewBox="0 0 20 20" fill="currentColor">
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

<script>
 
import { useApp } from "@/composables/useApp";


export default {
    props: {
        show: {
            type: Boolean,
            default: false,
        }
    },
    emits: ["close", "finalizar"],

    data() {
        return {
            pagamentos: [{ id: "", valor: 0 }],
            formaEntrega: "",
        };
    },
    setup() {
        const { 
            formaPagamentos, 
            formaEntregas, 
            subtotal, 
            totalGeral, 
            carrinho, 
            frete, 
            cashback,
            formatarMoeda, 
            formasPagamentoDisponiveis,
            gerarNumeroVenda
        } = useApp();

        return { 
            formaPagamentos, 
            formaEntregas, 
            subtotal, 
            totalGeral, 
            carrinho, 
            frete, 
            cashback, 
            formatarMoeda,
            formasPagamentoDisponiveis,
            gerarNumeroVenda
        };
    },
    methods: {
        adicionarPagamento() {
            this.pagamentos.push({ id: "", valor: 0 });
            this.validarEAtualizarValoresPagamento(0); // Atualiza os valores ao adicionar novo pagamento
        },
        removerPagamento(index) {
            this.pagamentos.splice(index, 1);
            if (this.pagamentos.length === 1) {
                this.pagamentos[0].valor = this.totalGeral; // Retorna o valor total ao único input restante
            }
            this.validarEAtualizarValoresPagamento(0); // Atualiza os valores após remoção
        },
        close() {
            this.$emit("close");
        },
        atualizarValorPagamento(index) {
            if (index === 0 && this.pagamentos.length === 1) {
                this.pagamentos[0].valor = this.totalGeral.toFixed(2); 
            } 
            this.validarEAtualizarValoresPagamento(index);
        },
        validarEAtualizarValoresPagamento(index) {
    // Garantir que o valor atual seja uma string e convertê-lo para número válido
    let valorAtual = parseFloat(
        (this.pagamentos[index].valor || "")
            .toString()
            .replace(/[^0-9.-]+/g, "")
            .replace(",", ".")
    );

    // Se o valor não for um número válido, limpar o campo
    if (isNaN(valorAtual)) {
        this.pagamentos[index].valor = "";
        return;
    }

    // Atualizar o valor no campo, mas não adicionar automaticamente os 2 dígitos após a vírgula
    this.pagamentos[index].valor = valorAtual.toString();

    // Calcular o valor total restante (sem considerar o pagamento que está sendo alterado)
    let totalRestante = this.totalGeral - valorAtual;

    // Caso seja a primeira forma de pagamento (index 0), não deve ser alterado, distribuir entre as outras
    if (index === 0) {
        // Se for a primeira forma de pagamento, distribuímos entre as outras formas
        const outrosPagamentos = this.pagamentos.slice(1); // Ignora o primeiro pagamento
        outrosPagamentos.forEach((pgto) => {
            const outroIndex = this.pagamentos.indexOf(pgto);
            const novoValor = totalRestante / outrosPagamentos.length;
            this.pagamentos[outroIndex].valor = novoValor > 0 ? novoValor.toString() : "";
        });
    } else {
        // Caso contrário, distribuímos o valor entre todas as formas de pagamento
        this.pagamentos.forEach((pgto, i) => {
            if (i !== index) {
                const outroIndex = this.pagamentos.indexOf(pgto);
                const novoValor = totalRestante / (this.pagamentos.length - 1); // Exclui o valor atual do cálculo
                this.pagamentos[outroIndex].valor = novoValor > 0 ? novoValor.toString() : "";
            }
        });
    }

    // Garantir que a soma dos valores nunca exceda o total geral
    const somaValores = this.pagamentos.reduce((acc, pgto) => {
        const valor = parseFloat(
            (pgto.valor || "0").toString().replace(/[^0-9.-]+/g, "").replace(",", ".")
        );
        return acc + (isNaN(valor) ? 0 : valor);
    }, 0);

    // Ajustar o valor do pagamento atual se a soma dos valores exceder o total
    if (somaValores > this.totalGeral) {
        const excesso = somaValores - this.totalGeral;
        this.pagamentos[index].valor = (valorAtual - excesso).toString();
    }
}
,
        finalizarVenda() {
            const dadosVenda = {
                numeroVenda: this.gerarNumeroVenda(), // Número gerado
                carrinho: this.carrinho.map(item => ({ 
                    ...item, 
                    valor_venda: item.quantidade >= 5 ? item.valor_atacado : item.valor_varejo 
                })),
                pagamentos: this.pagamentos.map(pgto => ({ 
                    id: pgto.id, 
                    valor: parseFloat(pgto.valor.replace(/[^\d,.-]/g, '').replace(',', '.')) 
                })),
                formaEntrega: this.formaEntrega,
                frete: this.frete,
                cashback: this.cashback,
                total: this.totalGeral,
            };
            this.$emit("finalizar", dadosVenda);
        },
    },
};
</script>
