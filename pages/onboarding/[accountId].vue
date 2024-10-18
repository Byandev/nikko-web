<script setup lang="ts">
definePageMeta({middleware: ['verify'] });

import {ref} from "vue";

import WorkExperiencesForm from "~/components/multi-step-forms/WorkExperiencesForm.vue";
import LanguagesForm from "~/components/multi-step-forms/LanguagesForm.vue";
import EducationHistoryForm from "~/components/multi-step-forms/EducationHistoryForm.vue";
import SkillsForm from "~/components/multi-step-forms/SkillsForm.vue";
import ProfileForm from "~/components/multi-step-forms/ProfileForm.vue";

const currentStep = ref(5);
</script>

<template>
  <div class="my-5 max-w-2xl mx-5 lg:mx-auto border border-gray-300 rounded-lg py-10 px-4 sm:px-16">
<!--    <div class="flex justify-center mb-5">-->
<!--      <ProgressBar :steps="steps" />-->
<!--    </div>-->
    <div v-if="currentStep === 1">
      <ProfileForm @submit="currentStep++" />
    </div>
    <div v-if="currentStep === 2">
      <LanguagesForm @back="currentStep--" @submit="currentStep++" />
    </div>
    <div v-if="currentStep === 3">
      <SkillsForm @back="currentStep--" @submit="currentStep++" />
    </div>
    <div v-if="currentStep === 4">
      <WorkExperiencesForm @back="currentStep--" @submit="currentStep++" />
    </div>
    <div v-if="currentStep === 5">
      <EducationHistoryForm @back="currentStep--" @submit="currentStep++" />
    </div>

  </div>
</template>
