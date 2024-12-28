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
                        <select v-model="pgto.id" class="border rounded-lg p-2 w-1/2">
                            <option value="">Selecione uma opção</option>
                            <option v-for="forma in formasPagamentoDisponiveis(pagamentos,index)" :key="forma.id" :value="forma.id">
                                {{ forma.nome }}
                            </option>
                        </select>
                        <input
                            type="number"
                            v-model="pgto.valor"
                            placeholder="Valor"
                            class="border rounded-lg p-2 w-1/2"
                        />
                        <button
                            v-if="pagamentos.length > 1"
                            @click="removerPagamento(index)"
                            class="text-red-500 hover:text-red-700"
                            title="Remover"
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
                                    d="M6 6l12 12M6 12l12-12"
                                />
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
            pagamentos: [{ id: "", valor: "" }],
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
            this.pagamentos.push({ id: "", valor: "" });
        },
        removerPagamento(index) {
            this.pagamentos.splice(index, 1);
        },
        close() {
            this.$emit("close");
        },
        finalizarVenda() {
            const dadosVenda = {
                numeroVenda:this.gerarNumeroVenda(), // Número gerado
                carrinho: this.carrinho,
                pagamentos: this.pagamentos,
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
