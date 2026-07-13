<template>
  <v-container class="fill-height bg-grey-lighten-4" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12 rounded-lg pa-4">
          <v-card-item class="justify-center text-center">
            <v-icon icon="mdi-checkbox-marked-circle-outline" size="large" color="primary" class="mb-2"></v-icon>
            <v-card-title class="text-h5 font-weight-bold">Acessar Gerenciador de Tarefas</v-card-title>
            <v-card-subtitle>Entre com suas credenciais para continuar</v-card-subtitle>
          </v-card-item>

          <v-card-text class="mt-4">
            <v-alert
              v-if="errorMessage"
              type="error"
              variant="tonal"
              closable
              class="mb-4"
              @click:close="errorMessage = ''"
            >
              {{ errorMessage }}
            </v-alert>

            <v-form ref="formRef" v-model="isFormValid" @submit.prevent="handleLogin">
              <v-text-field
                v-model="email"
                label="E-mail"
                name="email"
                prepend-inner-icon="mdi-email-outline"
                type="email"
                variant="outlined"
                :rules="[rules.required, rules.email]"
                required
              ></v-text-field>

              <v-text-field
                v-model="password"
                label="Senha"
                name="password"
                prepend-inner-icon="mdi-lock-outline"
                type="password"
                variant="outlined"
                :rules="[rules.required]"
                required
              ></v-text-field>

              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                class="mt-4 font-weight-bold"
                :loading="loading"
                :disabled="!isFormValid"
              >
                Entrar
              </v-btn>
            </v-form>
          </v-card-text>

          <v-card-actions class="justify-center mt-2">
            <span class="text-body-2 text-grey-darken-1">Não tem uma conta?</span>
            <v-btn variant="text" color="primary" class="text-capitalize font-weight-bold" to="/register">
              Cadastre-se
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

// Estados do formulário
const formRef = ref(null);
const isFormValid = ref(false);
const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');


const rules = {
  required: value => !!value || 'Este campo é obrigatório.',
  email: value => {
    const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return pattern.test(value) || 'Insira um e-mail válido.';
  }
};

const handleLogin = async () => {
  if (!isFormValid.value) return;

  loading.value = true;
  errorMessage.value = '';

  try {
    const success = await authStore.login(email.value, password.value);
    if (success) {
      router.push('/');
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'Ocorreu um erro ao tentar fazer login. Verifique sua conexão.';
  } finally {
    loading.value = false;
  }
};
</script>