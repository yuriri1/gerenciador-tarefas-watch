<template>
  <v-card class="bg-grey-lighten-3 rounded-xl pa-4 d-flex flex-column" style="min-height: 65vh; max-height: 75vh;"
    variant="flat">
    <div class="d-flex align-center justify-space-between mb-4">
      <h3 class="text-subtitle-1 font-weight-bold text-grey-darken-3 px-1">
        {{ title }}
      </h3>
      <v-chip size="small" color="grey-darken-1" variant="tonal" class="font-weight-bold ml-2">
        {{ tasks.length }}
      </v-chip>
    </div>

    <Draggable v-model="localTasks" group="tasks" item-key="id" class="flex-grow-1 overflow-y-auto pr-1"
      ghost-class="ghost-card" @change="handleMove">
      <template #item="{ element }">
        <div class="draggable-item-wrapper">
          <TaskCard :task="element" />
        </div>
      </template>
    </Draggable>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';
import Draggable from 'vuedraggable';
import TaskCard from './TaskCard.vue';
import { useTaskStore } from '../stores/tasks';

const props = defineProps({
  title: { type: String, required: true },
  status: { type: String, required: true },
  tasks: { type: Array, required: true }
});

const emit = defineEmits(['status-updated']);
const taskStore = useTaskStore();

const localTasks = computed({
  get: () => props.tasks,
  set: (value) => {
    // Mantém a sincronização reativa estável
  }
});

const handleMove = async (event) => {
  if (event.added) {
    const movedTask = event.added.element;
    try {
      await taskStore.updateTaskStatus(movedTask.id, props.status);
      emit('status-updated', { message: 'Tarefa movida com sucesso!', color: 'success' });
    } catch (error) {
      emit('status-updated', { message: 'Erro ao mover tarefa no servidor.', color: 'error' });
    }
  }
};
</script>

<style scoped>
.ghost-card {
  opacity: 0.4;
  border: 2px dashed #6366F1 !important;
}

.draggable-item-wrapper {
  display: block;
  width: 100%;
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
</style>