<template>
    <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="600px"
        persistent>
        <v-card class="rounded-xl pa-4" v-if="task">
            <v-card-title class="text-h5 font-weight-bold px-4 d-flex align-center justify-space-between">
                <span>Editar Tarefa</span>
                <v-chip size="small" color="primary" variant="tonal">{{ task.status }}</v-chip>
            </v-card-title>

            <v-card-text class="mt-2">
                <v-form ref="formRef" v-model="isFormValid">
                    <v-text-field v-model="editedTitle" label="Título" variant="outlined"
                        :rules="[v => !!v || 'O título é obrigatório.']" required></v-text-field>
                    <v-textarea v-model="editedDescription" label="Descrição" variant="outlined" rows="3"></v-textarea>

                    <v-select v-model="selectedUserId" :items="currentWorkspaceMembers" item-title="name"
                        item-value="id" label="Responsável pela Tarefa" variant="outlined"
                        prepend-inner-icon="mdi-account-outline" clearable></v-select>

                    <v-divider class="my-4"></v-divider>

                    <div class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-2">Etiquetas do Workspace</div>

                    <v-select v-model="selectedCategoryIds" :items="categoryStore.categories" item-title="name"
                        item-value="id" label="Vincular Etiquetas" variant="outlined" multiple chips closable-chips>
                        <template #chip="{ item, props }">
                            <v-chip v-bind="props" :color="item?.raw?.color || 'primary'"
                                class="text-white font-weight-bold"></v-chip>
                        </template>
                    </v-select>

                    <v-expansion-panels variant="accordion" class="elevation-0 border rounded-lg mt-2">
                        <v-expansion-panel title="Criar Nova Etiqueta Global" prepend-icon="mdi-tag-plus-outline">
                            <v-expansion-panel-text>
                                <v-row dense align="center">
                                    <v-col cols="12" sm="6">
                                        <v-text-field v-model="newCatName" label="Nome da Tag" variant="outlined"
                                            density="comfortable" class="mb-2" hide-details></v-text-field>
                                        <v-btn color="secondary" block prepend-icon="mdi-check"
                                            class="font-weight-bold text-capitalize mt-4" :disabled="!newCatName"
                                            @click="handleCreateCategory">
                                            Salvar Nova Etiqueta
                                        </v-btn>
                                    </v-col>

                                    <v-col cols="12" sm="6" class="d-flex justify-center">
                                        <v-color-picker v-model="newCatColor" hide-inputs mode="hex"
                                            swatches-max-height="100px" elevation="0"></v-color-picker>
                                    </v-col>
                                </v-row>
                            </v-expansion-panel-text>
                        </v-expansion-panel>
                    </v-expansion-panels>
                </v-form>
            </v-card-text>

            <v-card-actions class="px-4 mt-4">
                <v-btn color="error" variant="text" prepend-icon="mdi-trash-can-outline"
                    class="text-capitalize font-weight-bold" :loading="deleteLoading" @click="handleDelete">
                    Excluir Tarefa
                </v-btn>

                <v-spacer></v-spacer>

                <v-btn variant="text" class="text-capitalize font-weight-bold" @click="closeDialog"
                    :disabled="saveLoading || deleteLoading">Cancelar</v-btn>
                <v-btn color="primary" class="text-capitalize font-weight-bold px-4" :loading="saveLoading"
                    :disabled="!isFormValid || deleteLoading" @click="handleSave">Salvar Alterações</v-btn>

            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useTaskStore } from '../stores/tasks';
import { useCategoryStore } from '../stores/categories';
import { useProjectStore } from '../stores/projects';

const props = defineProps({
    modelValue: Boolean,
    task: Object
});

const emit = defineEmits(['update:modelValue', 'show-toast']);
const taskStore = useTaskStore();
const categoryStore = useCategoryStore();
const projectStore = useProjectStore();

const isFormValid = ref(false);
const saveLoading = ref(false);

const editedTitle = ref('');
const editedDescription = ref('');
const selectedCategoryIds = ref([]);

const newCatName = ref('');
const newCatColor = ref('#FFFFFF');

const deleteLoading = ref(false);

const selectedUserId = ref(null);

watch(() => props.modelValue, async (isOpen) => {
    if (isOpen && props.task) {
        editedTitle.value = props.task.title;
        editedDescription.value = props.task.description || '';
        selectedCategoryIds.value = props.task.categories?.map(c => c.id) || [];
        selectedUserId.value = props.task.assignedUserId || null;

        await Promise.all([
            categoryStore.fetchCategories(),
            projectStore.fetchProjects(),
        ]);
    }
});

const handleCreateCategory = async () => {
    if (!newCatName.value) return;

    const sanitizedNewName = newCatName.value.trim().toLowerCase();

    const nameExists = categoryStore.categories.some(
        (cat) => cat.name.trim().toLowerCase() === sanitizedNewName
    );

    if (nameExists) {
        emit('show-toast', {
            message: 'Esta etiqueta já existe! Selecione-a no campo acima.',
            color: 'error'
        });
        return;
    }

    try {
        const hexColor = typeof newCatColor.value === 'object' ? newCatColor.value.hex : newCatColor.value;
        const createdTag = await categoryStore.createCategory(newCatName.value.trim(), hexColor);

        selectedCategoryIds.value.push(createdTag.id);
        newCatName.value = '';
        emit('show-toast', { message: 'Nova etiqueta global criada!', color: 'success' });
    } catch (error) {
        emit('show-toast', { message: 'Erro ao criar etiqueta.', color: 'error' });
    }
};

const handleSave = async () => {
    if (!isFormValid.value) return;
    saveLoading.value = true;
    try {
        await taskStore.updateTaskDetails(props.task.id, {
            title: editedTitle.value,
            description: editedDescription.value,
            status: props.task.status,
            categoryIds: selectedCategoryIds.value,
            userId: selectedUserId.value || null
        });
        emit('show-toast', { message: 'Tarefa atualizada com sucesso!', color: 'success' });
        closeDialog();
    } catch (error) {
        emit('show-toast', { message: 'Erro ao salvar alterações no servidor.', color: 'error' });
    } finally {
        saveLoading.value = false;
    }
};

const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa permanentemente?')) return;

    deleteLoading.value = true;
    try {
        await taskStore.deleteTask(props.task.id);
        emit('show-toast', { message: 'Tarefa excluída com sucesso!', color: 'success' });
        closeDialog();
    } catch (error) {
        emit('show-toast', { message: 'Erro ao excluir a tarefa no servidor.', color: 'error' });
    } finally {
        deleteLoading.value = false;
    }
};

const currentWorkspaceMembers = computed(() => {
  const currentProject = projectStore.projects.find(p => p.id === props.task?.projectId);
  
  if (!currentProject || !currentProject.members) return [];

  return currentProject.members.map(member => ({
    id: member.user?.id || member.userId,
    name: member.user?.name || 'Usuário Sem Nome'
  }));
});

const closeDialog = () => {
    emit('update:modelValue', false);
};
</script>