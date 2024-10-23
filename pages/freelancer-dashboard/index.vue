<script setup lang="ts">
import EducationSection from '~/components/freelancer-dashboard/EducationSection.vue';


definePageMeta({
  middleware: ['verify']
});
</script>

<template>
  <div class="my-8 lg:mx-auto mx-5">
    <ProfileInfo class="max-w-6xl mx-auto " />
    <div class="max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-4 mt-5 mx-auto ">

      <!-- Left Column -->
      <div class="col-span-1">
        <div class="flex flex-row justify-center gap-5 border border-gray-300 rounded-lg overflow-hidden bg-white p-4">
          <div class="text-center">
            <div class="text-red-600 font-bold">
              0
            </div>
            <div>
              Total Hours
            </div>
          </div>

          <div class="text-center">
            <div class="text-red-600 font-bold">
              0
            </div>
            <div>
              Completed Jobs
            </div>
          </div>

          <div class="text-center">
            <div class="text-red-600 font-bold">
              0
            </div>
            <div>
              Total Hours
            </div>
          </div>
        </div>

        <!-- Skill Section -->
        <Section class="mt-5">
          <template #header>
            <div class="flex justify-between items-center">
              <h2 class="text-2xl font-bold">Skills</h2>
              <div>
                <button class="text-blue-500">Request Skills</button>
                <button class="text-gray-500 ml-5">Edit</button>
              </div>
            </div>
          </template>
          <template #content>
            <div class="mt-4">
              <p class="text-gray-500">Skill Section</p>
            </div>
          </template>
        </Section>

        <!-- Tools Section -->
        <Section class="mt-5">
          <template #header>
            <div class="flex justify-between items-center">
              <h2 class="text-2xl font-bold">Tools</h2>
              <div>
                <button class="text-blue-500">Request Tools</button>
                <button class="text-gray-500 ml-5">Edit</button>
              </div>
            </div>
          </template>
          <template #content>
            <div class="mt-4">
              <p class="text-gray-500">Tools Section</p>
            </div>
          </template>
        </Section>

        <!-- Verification Section -->
        <Section class="mt-5">
          <template #header>
            <div class="flex justify-between items-center">
              <h2 class="text-2xl font-bold">Verification</h2>
            </div>
          </template>
          <template #content>
            <div class="mt-4">
              <p class="text-gray-500">Verification Section</p>
            </div>
          </template>
        </Section>

      </div>

      <!-- Right Column -->
      <div class="col-span-1 lg:col-span-2">
        <div class="grid grid-cols-1 gap-5">
          <Section>
            <template #header>
              <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold">About</h2>
                <div>
                  <button class="text-gray-500 ml-5">Edit</button>
                </div>
              </div>
            </template>
            <template #content>
              <div class="mt-4">
                <p class="text-gray-500">About Section</p>
              </div>
            </template>
          </Section>

          <Section>
            <template #header>
              <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold">Feedback & History</h2>
              </div>
            </template>
            <template #content>
              <div class="mt-4">
                <p class="text-gray-500">Feedback & History Section</p>
              </div>
            </template>
          </Section>

          <Section>
            <template #header>
              <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold">Portfolio</h2>
              </div>
            </template>
            <template #content>
              <PorfolioSection />
            </template>
          </Section>

          <Section>
            <template #header>
              <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold">Certifications</h2>
              </div>
            </template>
            <template #content>
              <CertificateSection />
            </template>
          </Section>

          <!-- Portfolio -->
          <Section>
            <template #header>
              <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold">Share Your Education</h2>
                <div>
                  <button class="text-blue-500">Add Education</button>
                </div>
              </div>

            </template>
            <template #content>
              <EducationSection />
            </template>
          </Section>

          <Section>
            <template #header>
              <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold">Share Your Professional Journey</h2>
              </div>
            </template>
            <template #content>
              <WorkExperienceSection />
            </template>
          </Section>
        </div>
      </div>
    </div>
  </div>
</template>
