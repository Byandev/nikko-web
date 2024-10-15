<template>
  <div class="my-8">
    <ProfileInfo class="max-w-6xl mx-auto" />
    <div class="max-w-6xl lg:mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 mt-5 mx-5">

      <!-- Left Column -->
      <div class="col-span-1">
        <Section>
          <template #header>
            <div class="flex justify-between items-center">
              <h2 class="text-2xl font-bold">Your Bids</h2>
            </div>
          </template>
          <template #content>
            <div class="mt-4">
              <p>Available: <strong>Unlimited</strong></p>
            </div>
          </template>
        </Section>

        <!-- Skill Section -->
        <Section class="mt-5">
          <template #header>
            <div class="flex justify-between items-center">
              <h2 class="text-2xl font-bold">All Contracts</h2>
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
                <h2 class="text-2xl font-bold">Show Your Talent</h2>
              </div>
            </template>
            <template #content>
              <div class="mt-4">
                <p class="text-gray-500">Show Your Talent Section</p>
              </div>
            </template>
          </Section>

          <Section>
            <template #header>
              <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold">Certifications</h2>
              </div>
            </template>
            <template #content>
              <div class="mt-4">
                <p class="text-gray-500">Certifications Section</p>
              </div>
            </template>
          </Section>

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
              <div class="mt-4">
                <p class="text-gray-500">Share Your Education Section</p>
              </div>
            </template>
          </Section>

          <Section>
            <template #header>
              <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold">Share Your Professional Journey</h2>
              </div>
            </template>
            <template #content>
              <div class="mt-4">
                <p class="text-gray-500">Share Your Professional Journey Section</p>
              </div>
            </template>
          </Section>
        </div>
      </div>
    </div>
  </div>
</template>