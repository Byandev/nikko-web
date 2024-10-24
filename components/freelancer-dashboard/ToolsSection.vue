<script setup lang="ts">
import { accountStore } from '~/store/accountStore';
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { Account } from '~/types/models/Account';
import { storeToRefs } from 'pinia';
import { useSubmit } from '~/composables/useSubmit';
import { useFetchData } from '~/composables/useFetchData';
import type { Tool } from '~/types/models/Tool';
import { ref } from 'vue';

const { account } = storeToRefs(accountStore());

const { sendRequest: updateTools } = useSubmit<{ data: Account }, ApiErrorResponse>();
const { data: toolOptions, fetchData: fetchTools } = useFetchData<{ data: Tool[] }, ApiErrorResponse>();

fetchTools('/v1/tools');

const isEditModalOpen = ref(false);
const isRequestModalOpen = ref(false);
const selectedToolId = ref<number | null>(null);
const selectedTools = ref<Tool[]>([]);

function onRemoveTool(idx: number) {
  if (account.value && account.value.tools) {
    account.value.tools.splice(idx, 1);
  }
}

const submitTools = async () => {
  if (!account.value || !account.value.tools) return;

  try {
    const response = await updateTools(`/v1/auth/accounts/${account.value.id}`, {
      method: 'PUT',
      body: {
        tools: account.value.tools.map((tool: { id: number }) => tool.id),
      },
    });

    if (account.value) {
      account.value.tools = response.data.tools;
    }

    isEditModalOpen.value = false;
  } catch (error) {
    console.log('Error updating tools:', error);
  }
};

const requestTool = async () => {
  if (!selectedToolId.value || !account.value?.id) return;

  try {
    const response = await updateTools(`/v1/auth/accounts/${account.value.id}`, {
      method: 'PUT',
      body: {
        tools: [
          ...(account.value?.tools?.map((tool: { id: number }) => tool.id) || []),
          ...selectedTools.value.map((tool: { id: number }) => tool.id)
        ],
      },
    });

    if (account.value) {
      account.value.tools = response.data.tools;
    }

    selectedTools.value = [];
    selectedToolId.value = null;
    isRequestModalOpen.value = false;
  } catch (error) {
    console.log('Error requesting tool:', error);
  }
};

const onSelect = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const toolId = Number(target.value);
  const tool = toolOptions.value?.data.find(tool => tool.id === toolId);
  if (tool && !selectedTools.value.some(t => t.id === tool.id)) {
    selectedTools.value.push(tool);
  }
  console.log('Selected Tools after onSelect:', selectedTools.value);
}

const onRemoveSelectedTool = (idx: number) => {
  selectedTools.value.splice(idx, 1);
}

const onCancelEdit = async () => {
    isEditModalOpen.value = false;
}

</script>

<template>
  <Section class="mt-5">
    <template #header>
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold">Tools</h2>
        <div>
          <button class="text-blue-500" @click="isRequestModalOpen = true">Request Tools</button>
          <button class="text-gray-500 ml-5" @click="isEditModalOpen = true">Edit</button>
        </div>
      </div>
    </template>
    <template #content>
      <div class="flex flex-wrap">
        <div v-for="(tool, idx) in account?.tools" :key="`selected-tool-${tool.id}`" class="mr-2 my-1">
          <span class="inline-flex items-center gap-x-0.5 rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
            {{tool.name}}
          </span>
        </div>
      </div>
    </template>
  </Section>

  <Modal v-model="isEditModalOpen" @close="isEditModalOpen = false">
    <template #title>
      <h3 class="text-lg font-medium leading-6 text-gray-900">Edit Tools</h3>
    </template>
    <template #content>
      <div class="mt-5 flex flex-wrap">
        <div v-for="(tool, idx) in account?.tools" :key="`selected-tool-${tool.id}`" class="mr-2 my-1">
          <span class="inline-flex items-center gap-x-0.5 rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
            {{tool.name}}
            <button @click="onRemoveTool(idx)" type="button" class="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-green-600/20">
              <span class="sr-only">Remove</span>
              <svg viewBox="0 0 14 14" class="h-3.5 w-3.5 stroke-green-700/50 group-hover:stroke-green-700/75">
                <path d="M4 4l6 6m0-6l-6 6" />
              </svg>
              <span class="absolute -inset-1" />
            </button>
          </span>
        </div>
      </div>
    </template>
    <template #actions>
      <Button @click="onCancelEdit" text="Cancel" type="button" background="white" foreground="primary" />
      <Button @click="submitTools" text="Save" type="button" background="primary" foreground="white" />
    </template>
  </Modal>

  <Modal v-model="isRequestModalOpen" @close="isRequestModalOpen = false">
    <template #title>
      <h3 class="text-lg font-medium leading-6 text-gray-900">Request New Tool</h3>
    </template>
    <template #content>
      <div class="mt-4 w-full">
        
        <div class="mt-2">
          <select required @change="onSelect" v-model="selectedToolId"
                  class="w-full px-2 block text-sm leading-6 rounded-md border-0 py-2 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
            <option :value="null">Select Tool</option>
            <option class="truncate text-sm leading-6" v-for="tool in toolOptions?.data" :key="tool.id"
                    :value="tool.id">
              {{ tool.name }}
            </option>
          </select>
        </div>
        <div class="mt-4">
          <div class="flex flex-wrap mt-2">
            <div v-for="(tool, idx) in selectedTools" :key="`selected-tool-${tool.id}`" class="mr-2 my-1">
                <span class="inline-flex items-center gap-x-0.5 rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    {{tool.name}}
                    <button @click="onRemoveSelectedTool(idx)" type="button" class="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-green-600/20">
                    <span class="sr-only">Remove</span>
                    <svg viewBox="0 0 14 14" class="h-3.5 w-3.5 stroke-green-700/50 group-hover:stroke-green-700/75">
                        <path d="M4 4l6 6m0-6l-6 6" />
                    </svg>
                    <span class="absolute -inset-1" />
                    </button>
                </span>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #actions>
      <Button @click="isRequestModalOpen = false" text="Cancel" type="button" background="white" foreground="primary" />
      <Button @click="requestTool" text="Request" type="button" background="primary" foreground="white" />
    </template>
  </Modal>
</template>