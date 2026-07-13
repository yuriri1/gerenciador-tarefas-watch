<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="500px" persistent>
    <v-card class="rounded-xl pa-4">
      <v-card-title class="text-h5 font-weight-bold px-4">Nova Tarefa</v-card-title>
      
      <v-card-text>
        <v-form ref="formRef" v-model="isFormValid" @submit.prevent="submitTask">
          <v-text-field
            v-model="title"
            label="Título da Tarefa"
            variant="outlined"
            :rules="[v => !!v || 'O título é obrigatório.']"
            required
          ></v-text-field>

          <v-textarea
            v-model="description"
            label="Descrição"
            variant="outlined"
            rows="3"
          ></v-textarea>

          <v-select
            v-model="selectedUserId"
            :items="workspaceMembers"
            item-title="name"
            item-value="id"
            label="Responsável pela Tarefa"
            variant="outlined"
            prepend-inner-icon="mdi-account-outline"
            clearable
          ></v-select>
        </v-form>
      </v-card-text>

      <v-card-actions class="px-4">
        <v-spacer></v-spacer>
        <v-btn variant="text" class="text-capitalize font-weight-bold" @click="closeDialog" :disabled="loading">
          Cancelar
        </v-btn>
        <v-btn color="primary" class="text-capitalize font-weight-bold px-4" :loading="loading" :disabled="!isFormValid" @click="submitTask">
          Adicionar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useTaskStore } from '../stores/tasks';
import { useProjectStore } from '../stores/projects';

const props = defineProps({
  modelValue: Boolean,
  projectId: { type: String, required: true }
});

const emit = defineEmits(['update:modelValue', 'show-toast']);
const taskStore = useTaskStore();
const projectStore = useProjectStore();

const formRef = ref(null);
const isFormValid = ref(false);
const title = ref('');
const description = ref('');
const selectedUserId = ref(null);
const loading = ref(false);

const workspaceMembers = computed(() => {
  const currentProject = projectStore.projects.find(p => p.id === props.projectId);

  if (!currentProject?.members) return [];

  return currentProject.members.map(member => ({
    id: member.user?.id || member.userId,
    name: member.user?.name || 'Usuário Sem Nome'
  }));
});

watch(() => props.modelValue, async (isOpen) => {
  if (isOpen) {
    await projectStore.fetchProjects();
  }
});

const submitTask = async () => {
  if (!isFormValid.value) return;
  loading.value = true;
  try {
    await taskStore.createTask(
      props.projectId,
      title.value,
      description.value,
      selectedUserId.value || null
    );
    emit('show-toast', { message: 'Tarefa adicionada com sucesso!', color: 'success' });
    closeDialog();
  } catch (error) {
    const apiError = error.response?.data?.error || 'Erro ao criar a tarefa.';
    emit('show-toast', { message: apiError, color: 'error' });
  } finally {
    loading.value = false;
  }
};

const closeDialog = () => {
  emit('update:modelValue', false);
  title.value = '';
  description.value = '';
  selectedUserId.value = null;
  formRef.value?.resetValidation();
};
</script>
