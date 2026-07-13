<template>
  <v-layout>
    <v-app-bar color="primary" elevation="2">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-app-bar-title class="font-weight-bold">Gerenciador de Tarefas</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="handleLogout" title="Sair do Sistema">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" permanent elevation="1">
      <v-list class="pa-4">
        <v-btn 
          color="secondary" 
          block 
          prepend-icon="mdi-plus" 
          class="font-weight-bold text-capitalize"
          @click="isModalOpen = true"
        >
          Novo Projeto
        </v-btn>
      </v-list>

      <v-divider></v-divider>

      <v-list density="compact" nav class="px-2">
        <v-list-subheader class="text-subtitle-2 font-weight-bold text-grey-darken-1">
          SEUS PROJETOS
        </v-list-subheader>

        <v-progress-linear v-if="projectStore.loading" indeterminate color="primary" class="my-2"></v-progress-linear>

        <v-list-item
          v-for="project in projectStore.projects"
          :key="project.id"
          :title="project.name"
          prepend-icon="mdi-folder-outline"
          :to="`/project/${project.id}`"
          link
          color="primary"
          class="rounded-lg mb-1"
        ></v-list-item>

        <v-list-item v-if="!projectStore.loading && projectStore.projects.length === 0" class="text-center text-grey mt-4">
          Nenhum projeto encontrado.
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main class="bg-grey-lighten-4" style="min-height: 100vh;">
      <router-view v-if="$route.params.id" :key="$route.params.id" @show-toast="triggerToast" />
      
      <v-container v-else class="fill-height d-flex flex-column align-center justify-center text-grey-darken-1 mt-12">
        <v-icon icon="mdi-developer-board" size="100" color="grey-lighten-1" class="mb-4"></v-icon>
        <h2 class="text-h5 font-weight-bold">Selecione um Workspace</h2>
        <p class="text-body-1 text-center mt-2">Escolha um projeto na barra lateral ou crie um novo para abrir um workspace.</p>
      </v-container>
    </v-main>

    <NewProjectModal v-model="isModalOpen" @show-toast="triggerToast" />

      <v-snackbar v-model="toast.show" :color="toast.color" timeout="4000" location="top right" rounded="pill">
      <div class="d-flex align-center">
        <v-icon :icon="toast.icon" class="mr-2"></v-icon>
        <span class="font-weight-medium">{{ toast.message }}</span>
      </div>
    </v-snackbar>
  </v-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useProjectStore } from '../stores/projects';
import NewProjectModal from '../components/NewProjectModal.vue';

const router = useRouter();
const authStore = useAuthStore();
const projectStore = useProjectStore();

const drawer = ref(true);
const isModalOpen = ref(false);

const toast = ref({
  show: false,
  message: '',
  color: 'success',
  icon: 'mdi-check-circle'
});

const triggerToast = (options) => {
  toast.value.message = options.message;
  toast.value.color = options.color || 'success';
  toast.value.icon = options.color === 'error' ? 'mdi-alert-circle' : 'mdi-check-circle';
  toast.value.show = true;
};

onMounted(async () => {
  try {
    await projectStore.fetchProjects();
  } catch (error) {
    authStore.logout();
    router.push('/login');
  }
});

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>