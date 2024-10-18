<script setup lang="ts">
import {ref} from "vue";

import WorkExperiencesForm from "~/components/multi-step-forms/WorkExperiencesForm.vue";
import LanguagesForm from "~/components/multi-step-forms/LanguagesForm.vue";
import EducationHistoryForm from "~/components/multi-step-forms/EducationHistoryForm.vue";
import SkillsForm from "~/components/multi-step-forms/SkillsForm.vue";
import ProfileForm from "~/components/multi-step-forms/ProfileForm.vue";

const currentStep = ref(0);
</script>

<template>
  <div class="my-5 max-w-2xl mx-5 lg:mx-auto border border-gray-300 rounded-lg py-10 px-4 sm:px-16">
    <div class="flex justify-center mb-5">
      <ProgressBar :current-step="currentStep" :steps="['Profile', 'Languages', 'Skills', 'Work Experience', 'Education']" />
    </div>
    <div v-if="currentStep === 0">
      <ProfileForm @submit="currentStep++" />
    </div>
    <div v-if="currentStep === 1">
      <LanguagesForm @back="currentStep--" @submit="currentStep++" />
    </div>
    <div v-if="currentStep === 2">
      <SkillsForm @back="currentStep--" @submit="currentStep++" />
    </div>
    <div v-if="currentStep === 3">
      <WorkExperiencesForm @back="currentStep--" @submit="currentStep++" />
    </div>
    <div v-if="currentStep === 4">
      <EducationHistoryForm @back="currentStep--" @submit="currentStep++" />
    </div>

  </div>
</template>
