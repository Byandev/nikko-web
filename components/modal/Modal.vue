<script setup lang="ts">
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue';
import { ref, watch } from 'vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        required: true
    }
});

const emits = defineEmits(['update:modelValue']);

const open = ref(props.modelValue);

const closeModal = () => {
    open.value = false;
    emits('update:modelValue', false);
};

// Watch for changes in props.modelValue to update open ref
watch(() => props.modelValue, (newVal) => {
    open.value = newVal;
});
</script>

<template>
  <TransitionRoot as="template" :show="open">
    <Dialog class="relative z-50" @close="closeModal">
      <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-800 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white px-6 pb-6 pt-5 text-left shadow-2xl transition-all w-full max-w-lg sm:my-8 sm:p-8">
              <div>
                <div class="mt-3 text-center">
                  <h3 class="text-lg font-semibold leading-6 text-gray-900">
                    <slot name="title">Default Title</slot>
                  </h3>
                  <div class="mt-4">
                    <slot name="content">
                      <p class="text-sm text-gray-500">Default content goes here.</p>
                    </slot>
                  </div>
                </div>
              </div>
              <div class="mt-6 sm:mt-8 flex justify-end space-x-3">
                <slot name="actions">
                  <button type="button" class="inline-flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-200" @click="closeModal">Deactivate</button>
                  <button type="button" class="inline-flex justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-md ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300 transition-all duration-200" @click="closeModal" ref="cancelButtonRef">Cancel</button>
                </slot>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>