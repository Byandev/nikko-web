<script setup lang="ts">
import { jobPostingStore } from '~/store/jobPostingStore';

const currentStep = ref(0);
const { resetJobPosting } = jobPostingStore();

const router = useRouter();

const clientDashboard = async () => {
    await router.push('/client-dashboard');
}

</script>

<template>
    <div class="my-5 max-w-2xl mx-5 lg:mx-auto border border-gray-300 rounded-lg py-10 px-4 sm:px-16">
        <div class="flex justify-center mb-5">
            <ProgressBar :current-step="currentStep" :steps="['StepOne', 'StepTwo', 'Review']" />
        </div>
        <div v-if="currentStep === 0">
            <JobPostingStepOne @back="clientDashboard"  @submit="currentStep++" />
        </div>
        <div v-if="currentStep === 1">
            <JobPostingStepTwo @back="currentStep--" @submit="currentStep++" />
        </div>
        <div v-if="currentStep === 2">
            <JobPostingReview @back="currentStep--" @submit="{
                resetJobPosting();
                clientDashboard();
            }" />
        </div>
    </div>
</template>