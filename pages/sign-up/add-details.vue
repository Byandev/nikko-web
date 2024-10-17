<script setup lang="ts">
import { Icon } from '@iconify/vue/dist/iconify.js';

import StepOne from '~/pages/sign-up/multi-step-forms/step-one.vue';
import StepTwo from '~/pages/sign-up/multi-step-forms/step-two.vue';
import StepThree from '~/pages/sign-up/multi-step-forms/step-three.vue';
import StepFour from '~/pages/sign-up/multi-step-forms/step-four.vue';

const currentStep = ref(1);

interface Step {
  label: string;
  state: 'completed' | 'current' | 'upcoming';
}

const steps = ref<Step[]>([
  { label: 'Step 1', state: 'current' },
  { label: 'Step 2', state: 'upcoming' },
  { label: 'Step 3', state: 'upcoming' },
  { label: 'Step 4', state: 'upcoming' },
]);

interface FormData {
  profileTitle: string;
  profileBio: string;
  languages: {
    language: string;
    level: string;
  }[];
}

const formData = ref<FormData>({
  profileTitle: '',
  profileBio: '',
  languages: [
    {
      language: '',
      level: '',
    },
  ],
});

const addLanguage = () => {
  formData.value.languages.push({
    language: '',
    level: '',
  });
};


watch(formData, (newVal, oldVal) => {
  console.log('Form data changed:', newVal);
}, { deep: true });

const nextStep = () => {
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

const submitForm = () => {
  console.log('Form submitted:', formData.value);
};
</script>

<template>
  <div class="my-5 max-w-2xl mx-5 lg:mx-auto border border-gray-300 rounded-lg py-10 px-4 sm:px-16">
    <div class="flex justify-center mb-5">
      <ProgressBar :steps="steps" />
    </div>
    <div v-if="currentStep === 1">
      <StepOne :formData="formData" @update-profile-title="formData.profileTitle = $event" @update-profile-bio="formData.profileBio = $event" />
    </div>
    <div v-if="currentStep === 2">
      <StepTwo :formData="formData" @add-language="addLanguage" />
    </div>
    <div v-if="currentStep === 3">
      <StepThree :formData="formData" />
    </div>
    <div v-if="currentStep === 4">
      <StepFour :formData="formData" />
    </div>

    <div
      :class="{ 'justify-end': currentStep === 1, 'justify-between': currentStep !== 1}"
      class="flex  mt-5">
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