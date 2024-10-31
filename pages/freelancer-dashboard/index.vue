<script setup lang="ts">

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
        <SkillsSection />

        <!-- Tools Section -->
        <ToolsSection />

      </div>

      <!-- Right Column -->
      <div class="col-span-1 lg:col-span-2">
        <div class="grid grid-cols-1 gap-5">
          
          <!-- Biosection -->
          <BioSection />

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
