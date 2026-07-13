<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="500px" persistent>
    <v-card class="rounded-xl pa-4">
      <v-card-title class="text-h5 font-weight-bold px-4">Membros do Workspace</v-card-title>
      
      <v-card-text>
        <p class="text-body-2 text-grey-darken-1 mb-4">
          Convide outros colaboradores digitando o e-mail cadastrado deles no sistema.
        </p>

        <v-form ref="formRef" v-model="isFormValid" @submit.prevent="handleInvite">
          <v-row dense align="center">
            <v-col cols="9">
              <v-text-field
                v-model="email"
                label="E-mail do colaborador"
                type="email"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required, rules.email]"
                hide-details
              ></v-text-field>
            </v-col>
            <v-col cols="3">
              <v-btn 
                color="secondary" 
                block 
                height="48"
                class="font-weight-bold text-capitalize" 
                :loading="loading" 
                :disabled="!isFormValid"
                @click="handleInvite"
              >
                Convidar
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="px-4 mt-2">
        <v-spacer></v-spacer>
        <v-btn variant="text" class="text-capitalize font-weight-bold" @click="closeDialog">
          Fechar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue';
import { useProjectStore } from '../stores/projects';

const props = defineProps({
  modelValue: Boolean,
  projectId: { type: String, required: true }
});

const emit = defineEmits(['update:modelValue', 'show-toast']);
const projectStore = useProjectStore();

const formRef = ref(null);
const isFormValid = ref(false);
const email = ref('');
const loading = ref(false);

const rules = {
  required: value => !!value || 'Obrigatório.',
  email: value => {
    const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return pattern.test(value) || 'E-mail inválido.';
  }
};

const handleInvite = async () => {
  if (!isFormValid.value) return;
  loading.value = true;
  try {
    await projectStore.addWorkspaceMember(props.projectId, email.value.trim());
    
    emit('show-toast', { message: 'Colaborador adicionado com sucesso!', color: 'success' });
    email.value = '';
    formRef.value?.resetValidation();
  } catch (error) {
    const apiError = error.response?.data?.message || 'Erro ao adicionar membro. Verifique se o e-mail está correto.';
    emit('show-toast', { message: apiError, color: 'error' });
  } finally {
    loading.value = false;
  }
};

const closeDialog = () => {
  emit('update:modelValue', false);
  email.value = '';
  formRef.value?.resetValidation();
};
</script>