<script setup lang="ts">
import { ref } from 'vue';
import { Icon } from '@iconify/vue/dist/iconify.js';
import ProfileForm from '~/components/multi-step-forms/ProfileForm.vue';
import LanguagesForm from '~/components/multi-step-forms/LanguagesForm.vue';

const currentStep = ref(1);

interface Step {
  label: string;
  state: 'completed' | 'current' | 'upcoming';
}

const steps = ref<Step[]>([
  { label: 'Profile', state: 'current' },
  { label: 'Step 2', state: 'upcoming' },
  { label: 'Step 3', state: 'upcoming' },
  { label: 'Step 4', state: 'upcoming' },
]);

const nextStep = () => {
  if (currentStep.value === 1) {
    if (profileRef.value) {
      profileRef.value.SubmitProfile();
    }
  }
  
  if (currentStep.value === 2) {
    if (languagesRef.value) {
      languagesRef.value.SubmitLanguage();
    }
  }

  if (currentStep.value < steps.value.length) {
    currentStep.value++;
    updateStepStates();
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
    updateStepStates();
  }
};

const updateStepStates = () => {
  steps.value.forEach((step, index) => {
    if (index < currentStep.value - 1) {
      step.state = 'completed';
    } else if (index === currentStep.value - 1) {
      step.state = 'current';
    } else {
      step.state = 'upcoming';
    }
  });
};

const profileRef = ref<InstanceType<typeof ProfileForm> | null>(null);
const languagesRef = ref<InstanceType<typeof LanguagesForm> | null>(null);

const submitForm = () => {

};
</script>

<template>
  <div class="my-5 max-w-2xl mx-5 lg:mx-auto border border-gray-300 rounded-lg py-10 px-4 sm:px-16">
    <div class="flex justify-center mb-5">
      <ProgressBar :steps="steps" />
    </div>
    <div v-if="currentStep === 1">
      <ProfileForm ref="profileRef" />
    </div>
    <div v-if="currentStep === 2">
      <LanguagesForm ref="languagesRef" />
    </div>
    <div v-if="currentStep === 3">
      <!-- Step 3 Component -->
    </div>
    <div v-if="currentStep === 4">
      <!-- Step 4 Component -->
    </div>

    <div :class="{ 'justify-end': currentStep === 1, 'justify-between': currentStep !== 1}" class="flex  mt-5">
      <span @click="prevStep" class="flex flex-row justify-center items-center"
        :class="{'cursor-not-allowed text-gray-400 hidden': currentStep === 1, 'cursor-pointer text-primary': currentStep !== 1}"
        :disabled="currentStep === 1">
        <Icon icon="weui:back-filled" width="20" height="20" class="text-primary" />
        Back
      </span>
      <Button text="Submit" type="submit" background="primary" foreground="white" v-if="currentStep === steps.length"
        @click="submitForm" />
      <Button text="Next" type="button" background="primary" foreground="white" v-else @click="nextStep" />
    </div>
  </div>
</template>