<template>
  <v-card class="mb-3 rounded-lg elevation-2 cursor-pointer transition-all" variant="flat" border @click="$emit('open-edit', task)">
    <v-card-item class="pb-1">
      <v-card-title class="text-subtitle-1 font-weight-bold">
        {{ task.title }}
      </v-card-title>
    </v-card-item>

    <v-card-text class="text-body-2 text-grey-darken-1 pb-2">
      {{ task.description || 'Sem descrição fornecida.' }}
    </v-card-text>

    <v-card-actions v-if="assigneeName" class="pt-0 px-4 pb-2">
      <v-chip size="x-small" color="grey-darken-1" variant="tonal" prepend-icon="mdi-account-outline">
        {{ assigneeName }}
      </v-chip>
    </v-card-actions>

    <v-card-actions v-if="task.categories && task.categories.length > 0" class="pt-0 px-4 flex-wrap">
      <v-chip
        v-for="cat in task.categories"
        :key="cat.id"
        size="x-small"
        :color="cat.color || 'primary'"
        variant="flat"
        class="mr-1 mb-1 text-white font-weight-bold"
      >
        {{ cat.name }}
      </v-chip>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';

defineEmits(['open-edit']);

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
});

const assigneeName = computed(() => {
  const collaboration = props.task.collaborations?.[0];
  return collaboration?.user?.name || null;
});
</script>

<style scoped>
.cursor-grab {
  cursor: grab;
}
.cursor-grab:active {
  cursor: grabbing;
}
</style>
