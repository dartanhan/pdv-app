import { createApp } from 'vue';
import App from './App.vue';
import Toast from 'vue-toastification';
import './index.css';
import 'vue-toastification/dist/index.css';
import { vMaska } from "maska/vue";
import PrimeVue from 'primevue/config';
import InputMask from 'primevue/inputmask';

const app = createApp(App);

app.use(Toast, {
    position: 'top-right',
    timeout: 5000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: 'button',
    icon: true,
    rtl: false
});
app.directive("maska", vMaska);
app.use(PrimeVue, { theme: 'none' });
app.component('InputMask', InputMask);

app.mount('#app');
