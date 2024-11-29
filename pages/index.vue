<script setup lang="ts">
import { accountStore } from '~/store/accountStore';

const { account } = storeToRefs(accountStore());

definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: `${account.value?.type === 'FREELANCER' ? '/find-work' : '/find-freelancer'}`,
    navigateUnauthenticatedTo: '/register',
  },
});
</script>

<template>
  <div class="bg-gray-900 min-h-screen">
    <div class="relative isolate overflow-hidden pt-14 min-h-screen">
      <img
        src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2830&q=80&blend=111827&sat=-100&exp=15&blend-mode=multiply"
        alt="" class="absolute inset-0 -z-10 h-full w-full object-cover" />
      <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true">
        <div
          class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" />
      </div>
      <div class="mx-auto max-w-2xl py-20 sm:py-32 lg:py-48 px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col justify-center">
        <div class="hidden sm:mb-8 sm:flex sm:justify-center">
          <div
            class="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-400 ring-1 ring-white/10 hover:ring-white/20">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. <a href="#" class="font-semibold text-white"><span
                class="absolute inset-0" aria-hidden="true" />Read more <span aria-hidden="true">&rarr;</span></a>
          </div>
        </div>
        <div class="text-center">
          <h1 class="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">Lorem ipsum dolor sit amet</h1>
          <p class="mt-6 text-base leading-7 text-gray-300 sm:text-lg md:text-xl">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <NuxtLink to="/register" class="flex flex-row justify-center w-full sm:w-auto"><Button type="button" text="Get started"
                background="primary" foreground="white" /></NuxtLink>
            <a href="#" class="text-sm font-semibold leading-6 text-white">Learn more <span
                aria-hidden="true">→</span></a>
          </div>
        </div>
      </div>
      <div
        class="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        aria-hidden="true">
        <div
          class="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" />
      </div>
    </div>
  </div>
</template>