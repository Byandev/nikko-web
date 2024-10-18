<script setup lang="ts">
import { ref } from 'vue';
import { Icon } from '@iconify/vue/dist/iconify.js';
import ProfileForm from '~/components/multi-step-forms/ProfileForm.vue';
import LanguagesForm from '~/components/multi-step-forms/LanguagesForm.vue';
import SkillsForm from '~/components/multi-step-forms/SkillsForm.vue';
import WorkExperiencesForm from '~/components/multi-step-forms/WorkExperiencesForm.vue';
import EducationHistoryForm from '~/components/multi-step-forms/EducationHistoryForm.vue';

const currentStep = ref(1);
const router = useRouter();

interface Step {
  label: string;
  state: 'completed' | 'current' | 'upcoming';
}

const steps = ref<Step[]>([
  { label: 'Profile', state: 'current' },
  { label: 'Languages', state: 'upcoming' },
  { label: 'Skills', state: 'upcoming' },
  { label: 'Work Experience', state: 'upcoming' },
  { label: 'Education', state: 'upcoming' }, // Add the new step
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

  if (currentStep.value === 3) {
    if (skillsRef.value) {
      skillsRef.value.SubmitSkills();
    }
  }

  if (currentStep.value === 4) {
    if (workExperiencesRef.value) {
      workExperiencesRef.value.SubmitWorkExperience();
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
const skillsRef = ref<InstanceType<typeof SkillsForm> | null>(null);
const workExperiencesRef = ref<InstanceType<typeof WorkExperiencesForm> | null>(null);
const educationRef = ref<InstanceType<typeof EducationHistoryForm> | null>(null);

const submitForm = () => {
  if (educationRef.value) {
      educationRef.value.SubmitEducationHistory();
  }
  router.push('/freelancer-dashboard');
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
      <SkillsForm ref="skillsRef" />
    </div>
    <div v-if="currentStep === 4">
      <WorkExperiencesForm ref="workExperiencesRef" />
    </div>
    <div v-if="currentStep === 5">
      <EducationHistoryForm ref="educationRef" />
    </div>

    <div :class="{ 'justify-end': currentStep === 1, 'justify-between': currentStep !== 1}" class="flex mt-5">
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