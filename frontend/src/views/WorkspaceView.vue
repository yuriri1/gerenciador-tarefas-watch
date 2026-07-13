<template>
  <v-container fluid class="pa-6">
    <v-row class="mb-4 align-center">
      <v-col cols="12" sm="8">
        <h1 class="text-h4 font-weight-bold text-grey-darken-4">Painel do Workspace</h1>
        <p class="text-body-2 text-grey-darken-1">Gerencie e acompanhe o progresso das suas tarefas em tempo real.</p>
      </v-col>
      <v-col cols="12" sm="4" class="text-sm-right">
        <v-btn color="primary" prepend-icon="mdi-plus" class="font-weight-bold text-capitalize"
          @click="isTaskModalOpen = true">
          Nova Tarefa
        </v-btn>
      </v-col>
    </v-row>

    <v-row v-if="taskStore.loading" class="mt-12" justify="center" align="center">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <p class="text-body-1 text-grey mt-4">Carregando tarefas do workspace...</p>
      </v-col>
    </v-row>

    <v-row v-else class="mt-2">
      <v-col cols="12" md="4">
        <TaskColumn title="Pendentes" status="PENDING" :tasks="pendingTasks" @status-updated="forwardToast" />
      </v-col>
      <v-col cols="12" md="4">
        <TaskColumn title="Em Andamento" status="IN_PROGRESS" :tasks="inProgressTasks" @status-updated="forwardToast" />
      </v-col>
      <v-col cols="12" md="4">
        <TaskColumn title="Concluídas" status="COMPLETED" :tasks="completedTasks" @status-updated="forwardToast" />
      </v-col>
    </v-row>
    <NewTaskModal v-model="isTaskModalOpen" :project-id="id" @show-toast="forwardToast" />
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useTaskStore } from '../stores/tasks';
import TaskColumn from '../components/TaskColumn.vue';
import NewTaskModal from '../components/NewTaskModal.vue';

const props = defineProps({
  id: { type: String, required: true }
});

const emit = defineEmits(['show-toast']);
const taskStore = useTaskStore();

const isTaskModalOpen = ref(false);

const pendingTasks = computed(() => taskStore.tasks.filter(t => t.status === 'PENDING' || t.status === 'TODO'));
const inProgressTasks = computed(() => taskStore.tasks.filter(t => t.status === 'IN_PROGRESS'));
const completedTasks = computed(() => taskStore.tasks.filter(t => t.status === 'COMPLETED' || t.status === 'DONE'));

const loadWorkspaceData = async () => {
  if (props.id) {
    try {
      await taskStore.fetchTasks(props.id);
    } catch (error) {
      forwardToast({ message: 'Falha ao sincronizar as tarefas.', color: 'error' });
    }
  }
};

onMounted(loadWorkspaceData);

watch(() => props.id, loadWorkspaceData);

const forwardToast = (options) => {
  emit('show-toast', options);
};
</script>