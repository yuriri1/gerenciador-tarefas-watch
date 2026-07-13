<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="500px" persistent>
    <v-card class="rounded-xl pa-4">
      <v-card-title class="text-h5 font-weight-bold px-4">Criar Novo Projeto</v-card-title>
      
      <v-card-text>
        <v-form ref="formRef" v-model="isFormValid" @submit.prevent="submitProject">
          <v-text-field
            v-model="projectName"
            label="Nome do Projeto"
            variant="outlined"
            :rules="[v => !!v || 'O nome é obrigatório.']"
            required
          ></v-text-field>

          <v-textarea
            v-model="projectDescription"
            label="Descrição (Opcional)"
            variant="outlined"
            rows="3"
          ></v-textarea>
        </v-form>
      </v-card-text>

      <v-card-actions class="px-4">
        <v-spacer></v-spacer>
        <v-btn variant="text" class="text-capitalize font-weight-bold" @click="closeDialog" :disabled="modalLoading">
          Cancelar
        </v-btn>
        <v-btn color="primary" class="text-capitalize font-weight-bold px-4" :loading="modalLoading" :disabled="!isFormValid" @click="submitProject">
          Criar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue';
import { useProjectStore } from '../stores/projects';

defineProps({
  modelValue: Boolean
});

const emit = defineEmits(['update:modelValue', 'show-toast']);
const projectStore = useProjectStore();

const formRef = ref(null);
const isFormValid = ref(false);
const projectName = ref('');
const projectDescription = ref('');
const modalLoading = ref(false);

const closeDialog = () => {
  emit('update:modelValue', false);
  projectName.value = '';
  projectDescription.value = '';
  formRef.value?.resetValidation();
};

const submitProject = async () => {
  if (!isFormValid.value) return;
  modalLoading.value = true;
  try {
    await projectStore.createProject(projectName.value, projectDescription.value);

    emit('show-toast', { message: 'Projeto criado com sucesso!', color: 'success' });
    closeDialog();
  } catch (error) {
    const apiError = error.response?.data?.error || 'Erro ao criar o projeto.';
    emit('show-toast', { message: apiError, color: 'error' });
  } finally {
    modalLoading.value = false;
  }
};
</script>