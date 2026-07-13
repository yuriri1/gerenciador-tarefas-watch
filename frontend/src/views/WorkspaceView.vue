<template>
  <v-container fluid class="pa-6">
    <v-row class="mb-4 align-center">
      <v-col cols="12" sm="8" class="d-flex align-center">
        <div>
          <div class="d-flex align-center">
            <h1 class="text-h4 font-weight-bold text-grey-darken-4">Painel do Workspace</h1>

            <v-btn icon="mdi-delete-outline" variant="text" color="error" class="ml-2" density="comfortable"
              title="Excluir este Workspace" @click="confirmDeleteWorkspace = true"></v-btn>
          </div>
          <p class="text-body-2 text-grey-darken-1">Gerencie e acompanhe o progresso das suas tarefas em tempo real.</p>
        </div>
      </v-col>
      <v-dialog v-model="confirmDeleteWorkspace" max-width="400px">
        <v-card class="rounded-xl pa-4">
          <v-card-title class="text-h6 font-weight-bold text-error">Excluir Workspace?</v-card-title>
          <v-card-text class="text-body-2 text-grey-darken-1">
            Esta ação é irreversível. Todas as tarefas vinculadas a este workspace serão apagadas definitivamente.
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="text" class="text-capitalize font-weight-bold"
              @click="confirmDeleteWorkspace = false">Cancelar</v-btn>
            <v-btn color="error" class="text-capitalize font-weight-bold px-4" :loading="workspaceDeleteLoading"
              @click="handleDeleteWorkspace">Sim, Excluir</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-col cols="12" sm="4" class="text-sm-right">
        <v-btn variant="outlined" color="grey-darken-2" prepend-icon="mdi-account-group-outline"
          class="font-weight-bold text-capitalize mr-2" @click="isMembersModalOpen = true">
          Membros
        </v-btn>
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
        <TaskColumn title="Pendentes" status="PENDING" :tasks="pendingTasks" @status-updated="forwardToast"
          @open-edit="handleOpenEdit" />
      </v-col>
      <v-col cols="12" md="4">
        <TaskColumn title="Em Andamento" status="IN_PROGRESS" :tasks="inProgressTasks" @status-updated="forwardToast"
          @open-edit="handleOpenEdit" />
      </v-col>
      <v-col cols="12" md="4">
        <TaskColumn title="Concluídas" status="COMPLETED" :tasks="completedTasks" @status-updated="forwardToast"
          @open-edit="handleOpenEdit" />
      </v-col>
    </v-row>
    <NewTaskModal v-model="isTaskModalOpen" :project-id="id" @show-toast="forwardToast" />
    <EditTaskModal v-model="isEditModalOpen" :task="selectedTask" @show-toast="forwardToast" />
    <WorkspaceMembersModal v-model="isMembersModalOpen" :project-id="id" @show-toast="forwardToast" />
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useTaskStore } from '../stores/tasks';
import TaskColumn from '../components/TaskColumn.vue';
import NewTaskModal from '../components/NewTaskModal.vue';
import EditTaskModal from '../components/EditTaskModal.vue';
import WorkspaceMembersModal from '../components/WorkspaceMembersModal.vue';

import { useProjectStore } from '../stores/projects';
import { useRouter } from 'vue-router';

const router = useRouter();
const projectStore = useProjectStore();

const props = defineProps({
  id: { type: String, required: true }
});

const emit = defineEmits(['show-toast']);
const taskStore = useTaskStore();

const isTaskModalOpen = ref(false);

const isEditModalOpen = ref(false);
const selectedTask = ref(null);

const pendingTasks = computed(() => taskStore.tasks.filter(t => t.status === 'PENDING' || t.status === 'TODO'));
const inProgressTasks = computed(() => taskStore.tasks.filter(t => t.status === 'IN_PROGRESS'));
const completedTasks = computed(() => taskStore.tasks.filter(t => t.status === 'COMPLETED' || t.status === 'DONE'));

const confirmDeleteWorkspace = ref(false);
const workspaceDeleteLoading = ref(false);

const isMembersModalOpen = ref(false);

let pollingInterval = null;

onMounted(() => {
  loadWorkspaceData();
  startPolling();
});

watch(() => props.id, () => {
  loadWorkspaceData();
  startPolling();
});

onUnmounted(() => {
  stopPolling();
});

const loadWorkspaceData = async () => {
  if (props.id) {
    try {
      await taskStore.fetchTasks(props.id, false);
    } catch (error) {
      forwardToast({ message: 'Falha ao sincronizar as tarefas.', color: 'error' });
    }
  }
};

const syncBackgroundData = async () => {
  if (document.visibilityState === 'visible' && props.id) {
    try {
      await taskStore.fetchTasks(props.id, true);
    } catch (e) {
      console.log('Sincronização em background falhou silenciosamente.');
    }
  }
};

const startPolling = () => {
  stopPolling();
  pollingInterval = setInterval(syncBackgroundData, 5000);
};

const stopPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
};

const forwardToast = (options) => {
  emit('show-toast', options);
};

const handleOpenEdit = (task) => {
  selectedTask.value = task;
  isEditModalOpen.value = true;
};

const handleDeleteWorkspace = async () => {
  workspaceDeleteLoading.value = true;
  try {
    await projectStore.deleteProject(props.id);
    forwardToast({ message: 'Workspace excluído com sucesso!', color: 'success' });
    confirmDeleteWorkspace.value = false;

    router.push('/');
  } catch (error) {
    forwardToast({ message: 'Erro ao excluir o workspace.', color: 'error' });
  } finally {
    workspaceDeleteLoading.value = false;
  }
};
</script>