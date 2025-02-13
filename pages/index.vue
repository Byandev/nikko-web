<script setup lang="ts">
import { ref } from 'vue';
import {
  ArrowPathIcon,
  Bars3Icon,
  CloudArrowUpIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
} from '@heroicons/vue/24/outline';

const features = [
  {
    name: 'Showcase Your Portfolio',
    description:
      'Easily create and manage your portfolio to showcase your best work to potential clients. Highlight your skills and past projects.',
    icon: CloudArrowUpIcon,
  },
  {
    name: 'Secure Transactions',
    description:
      'Ensure secure payments and transactions between freelancers and clients with our integrated payment system.',
    icon: LockClosedIcon,
  },
  {
    name: 'Job Matching',
    description:
      'Our platform uses advanced algorithms to match freelancers with the most suitable job opportunities based on their skills and experience.',
    icon: ArrowPathIcon,
  },
  {
    name: 'Bid Functions',
    description:
      'Allow freelancers to bid on projects, helping clients find the best freelancer for their needs.',
    icon: Bars3Icon,
  },
  {
    name: 'Filtering Features',
    description:
      'Use advanced filtering options to find freelancers based on specific skills, experience, and other criteria.',
    icon: MagnifyingGlassIcon,
  },
  {
    name: 'Invite Freelancers',
    description:
      'Invite freelancers to apply for your job postings, ensuring you get the best candidates for your projects.',
    icon: UserPlusIcon,
  },
];
const faqs = [
  {
    id: 1,
    question: 'How do I create a portfolio on Artsycrowd?',
    answer:
      "To create a portfolio, sign up for an account, navigate to the 'Portfolio' section, and follow the prompts to add your projects, skills, and experiences.",
  },
  {
    id: 2,
    question: 'Is there a fee for using Artsycrowd?',
    answer:
      'Artsycrowd offers both free and premium plans. The free plan allows you to create a basic portfolio, while the premium plan offers additional features such as advanced analytics and priority support.',
  },
  {
    id: 3,
    question: 'How can I ensure secure transactions on Artsycrowd?',
    answer:
      'Artsycrowd uses an integrated payment system that ensures secure transactions between freelancers and clients. All payments are processed through trusted payment gateways.',
  },
  {
    id: 4,
    question: 'Can I invite freelancers to apply for my job postings?',
    answer:
      "Yes, you can invite freelancers to apply for your job postings by using the 'Invite Freelancers' feature. This ensures you get the best candidates for your projects.",
  },
  {
    id: 5,
    question: 'How does the job matching algorithm work?',
    answer:
      'Our platform uses advanced algorithms to match freelancers with the most suitable job opportunities based on their skills and experience. This helps both freelancers and clients find the best matches.',
  },
  {
    id: 6,
    question: 'What types of projects can I find on Artsycrowd?',
    answer:
      "Artsycrowd features a wide range of projects, including painting, sculpting, crafting, and more. Whether you're an artist or a client, you'll find projects that suit your needs.",
  },
];

const selectedTab = ref(0);

const tabs = ref([
  {
    title: 'Freelancer Dashboard',
    description:
      'Manage your projects, track your earnings, and communicate with clients all in one place. The Freelancer Dashboard provides all the tools you need to succeed.',
    image: new URL('@/assets/images/freelancer-page.png', import.meta.url).href,
  },
  {
    title: 'Client Dashboard',
    description:
      'Post new projects, review freelancer bids, and manage your ongoing projects with ease. The Client Dashboard helps you keep everything organized.',
    image: new URL('@/assets/images/client-page.png', import.meta.url).href,
  },
]);

definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/find-work',
    navigateUnauthenticatedTo: '/register',
  },
});
</script>

<template>
  <div class="bg-white">
    <main class="isolate">
      <!-- Hero section -->
      <div class="relative pt-14">
        <div
          class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#34d399] to-[#10b981] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style="
              clip-path: polygon(
                74.1% 44.1%,
                100% 61.6%,
                97.5% 26.9%,
                85.5% 0.1%,
                80.7% 2%,
                72.5% 32.5%,
                60.2% 62.4%,
                52.4% 68.1%,
                47.5% 58.3%,
                45.2% 34.5%,
                27.5% 76.7%,
                0.1% 64.9%,
                17.9% 100%,
                27.6% 76.8%,
                76.1% 97.7%,
                74.1% 44.1%
              );
            "
          />
        </div>
        <div class="py-24 sm:py-32 lg:pb-40">
          <div class="mx-auto max-w-7xl px-6 lg:px-8">
            <div class="mx-auto max-w-2xl text-center">
              <h1
                class="text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl"
              >
                Connect with Talented Artists and Crafters
              </h1>
              <p
                class="mt-8 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8"
              >
                Discover and hire top artists and crafters for your projects.
                Whether you're looking for painters, sculptors, or artisans,
                Artsycrowd has the talent you need.
              </p>
              <div class="mt-10 flex items-center justify-center gap-x-6">
                <RouterLink
                  to="#"
                  class="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                  >Get started</RouterLink
                >
                <RouterLink to="#" class="text-sm/6 font-semibold text-gray-900"
                  >Learn more <span aria-hidden="true">→</span></RouterLink
                >
              </div>
            </div>
          </div>
        </div>
        <div
          class="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          aria-hidden="true"
        >
          <div
            class="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#34d399] to-[#10b981] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style="
              clip-path: polygon(
                74.1% 44.1%,
                100% 61.6%,
                97.5% 26.9%,
                85.5% 0.1%,
                80.7% 2%,
                72.5% 32.5%,
                60.2% 62.4%,
                52.4% 68.1%,
                47.5% 58.3%,
                45.2% 34.5%,
                27.5% 76.7%,
                0.1% 64.9%,
                17.9% 100%,
                27.6% 76.8%,
                76.1% 97.7%,
                74.1% 44.1%
              );
            "
          />
        </div>
      </div>

      <div
        class="flex flex-col bg-gradient-to-br from-green-700 to-green-600 px-6 md:px-10 py-6 md:py-40 text-white mt-10"
      >
        <div class="text-center mb-10">
          <p
            class="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Manage Your Projects Efficiently
          </p>
          <p class="mt-4 text-lg leading-6 tracking-tight text-white">
            Switch between Freelancer and Client dashboards to manage your
            projects, track earnings, and communicate with clients or
            freelancers.
          </p>
        </div>
        <div class="flex flex-col md:flex-row mt-8">
          <!-- Left Side Tabs -->
          <div class="w-full md:w-1/3 space-y-4 md:space-y-6 mb-4 md:mb-0">
            <div
              v-for="(tab, index) in tabs"
              :key="index"
              class="p-4 md:p-6 rounded-lg cursor-pointer"
              :class="{ 'bg-white/10': selectedTab === index }"
              @click="selectedTab = index"
            >
              <h2 class="text-base md:text-lg font-semibold">
                {{ tab.title }}
              </h2>
              <p class="text-xs md:text-sm">{{ tab.description }}</p>
            </div>
          </div>

          <!-- Right Side Image Display -->
          <div class="w-full md:w-2/3 flex items-center justify-center">
            <img
              loading="lazy"
              :src="tabs[selectedTab].image"
              :alt="tabs[selectedTab].image"
              class="rounded-lg shadow-lg w-full md:max-w-full h-auto"
            />
          </div>
        </div>
      </div>

      <!-- Logo cloud -->
      <div class="mx-auto max-w-7xl px-6 lg:px-8 mt-56">
        <div
          class="mx-auto grid max-w-lg grid-cols-1 items-center gap-x-8 gap-y-12 sm:max-w-xl sm:grid-cols-2 sm:gap-x-10 sm:gap-y-14 lg:mx-0 lg:max-w-none lg:grid-cols-2"
        >
          <div
            class="flex flex-row w-full items-center justify-start sm:justify-end"
          >
            <img
              loading="lazy"
              class="col-span-1 max-h-12 object-contain"
              src="/assets/icons/artsycrowd.png"
              alt="ArtsyCrowd"
            />
            ArtsyCrowd
          </div>
          <div class="col-span-1">
            <p class="text-lg font-medium text-gray-600">
              ArtsyCrowd connects you with talented artists and crafters from
              around the world. Whether you're looking for painters, sculptors,
              or artisans, ArtsyCrowd has the talent you need.
            </p>
          </div>
        </div>
        <div class="mt-16 flex justify-center">
          <p
            class="relative rounded-full px-4 py-1.5 text-sm/6 text-gray-600 ring-1 ring-inset ring-gray-900/10 hover:ring-gray-900/20"
          >
            <span class="hidden md:inline"
              >ArtsyCrowd connects you with talented artists and crafters from
              around the world.</span
            >
            <RouterLink to="/login" class="font-semibold text-primary"
              ><span class="absolute inset-0" aria-hidden="true" /> Learn more
              about us <span aria-hidden="true">&rarr;</span></RouterLink
            >
          </p>
        </div>
      </div>

      <!-- Feature section -->
      <div class="mx-auto mt-32 max-w-7xl px-6 sm:mt-56 lg:px-8">
        <div class="mx-auto max-w-2xl lg:text-center">
          <h2 class="text-base/7 font-semibold text-primary">
            Showcase Your Skills
          </h2>
          <p
            class="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl lg:text-balance"
          >
            Everything you need to highlight your talents
          </p>
          <p class="mt-6 text-pretty text-lg/8 text-gray-600">
            Easily create and manage your portfolio to showcase your best work
            to potential clients. Highlight your skills and past projects.
          </p>
        </div>
        <div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl
            class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16"
          >
            <div
              v-for="feature in features"
              :key="feature.name"
              class="relative pl-16"
            >
              <dt class="text-base/7 font-semibold text-gray-900">
                <div
                  class="absolute left-0 top-0 flex size-10 items-center justify-center rounded-lg bg-primary"
                >
                  <component
                    :is="feature.icon"
                    class="size-6 text-white"
                    aria-hidden="true"
                  />
                </div>
                {{ feature.name }}
              </dt>
              <dd class="mt-2 text-base/7 text-gray-600">
                {{ feature.description }}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Testimonial section -->
      <div class="mx-auto mt-32 max-w-7xl sm:mt-56 sm:px-6 lg:px-8">
        <div
          class="relative overflow-hidden bg-gray-900 px-6 py-20 shadow-xl sm:rounded-3xl sm:px-10 sm:py-24 md:px-12 lg:px-20"
        >
          <img
            loading="lazy"
            class="absolute inset-0 size-full object-cover brightness-150 saturate-0"
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
            alt="Testimonial Background"
          />
          <div class="absolute inset-0 bg-green-900/90 mix-blend-multiply" />
          <div
            class="absolute -left-80 -top-56 transform-gpu blur-3xl"
            aria-hidden="true"
          >
            <div
              class="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-r from-[#34d399] to-[#10b981] opacity-[0.45]"
              style="
                clip-path: polygon(
                  74.1% 44.1%,
                  100% 61.6%,
                  97.5% 26.9%,
                  85.5% 0.1%,
                  80.7% 2%,
                  72.5% 32.5%,
                  60.2% 62.4%,
                  52.4% 68.1%,
                  47.5% 58.3%,
                  45.2% 34.5%,
                  27.5% 76.7%,
                  0.1% 64.9%,
                  17.9% 100%,
                  27.6% 76.8%,
                  76.1% 97.7%,
                  74.1% 44.1%
                );
              "
            />
          </div>
          <div
            class="hidden md:absolute md:bottom-16 md:left-[50rem] md:block md:transform-gpu md:blur-3xl"
            aria-hidden="true"
          >
            <div
              class="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-r from-[#34d399] to-[#10b981] opacity-25"
              style="
                clip-path: polygon(
                  74.1% 44.1%,
                  100% 61.6%,
                  97.5% 26.9%,
                  85.5% 0.1%,
                  80.7% 2%,
                  72.5% 32.5%,
                  60.2% 62.4%,
                  52.4% 68.1%,
                  47.5% 58.3%,
                  45.2% 34.5%,
                  27.5% 76.7%,
                  0.1% 64.9%,
                  17.9% 100%,
                  27.6% 76.8%,
                  76.1% 97.7%,
                  74.1% 44.1%
                );
              "
            />
          </div>
          <div class="relative mx-auto max-w-2xl lg:mx-0">
            <img
              loading="lazy"
              class="h-12 w-auto"
              src="/assets/icons/artsycrowd-white.png"
              alt="ArtsyCrowd Logo"
            />
            <figure>
              <blockquote
                class="mt-6 text-lg font-semibold text-white sm:text-xl/8"
              >
                <p>
                  “ArtsyCrowd has transformed the way we connect with talented
                  artists and crafters. The platform is user-friendly and has
                  helped us find the perfect match for our projects every time.”
                </p>
              </blockquote>
              <figcaption class="mt-6 text-base text-white">
                <div class="font-semibold">Nikko</div>
                <div class="mt-1">Founder of ArtsyCrowrd</div>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>

      <!-- FAQs -->
      <div
        class="mx-auto max-w-2xl px-6 pb-8 sm:pb-24 sm:pt-12 lg:max-w-7xl lg:px-8 lg:pb-32"
      >
        <h2
          class="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl"
        >
          Frequently asked questions
        </h2>
        <dl class="mt-20 divide-y divide-gray-900/10">
          <div
            v-for="faq in faqs"
            :key="faq.id"
            class="py-8 first:pt-0 last:pb-0 lg:grid lg:grid-cols-12 lg:gap-8"
          >
            <dt class="text-base/7 font-semibold text-gray-900 lg:col-span-5">
              {{ faq.question }}
            </dt>
            <dd class="mt-4 lg:col-span-7 lg:mt-0">
              <p class="text-base/7 text-gray-600">{{ faq.answer }}</p>
            </dd>
          </div>
        </dl>
      </div>

      <!-- CTA section -->
      <div class="relative -z-10 mt-32 px-6 lg:px-8">
        <div
          class="absolute inset-x-0 top-1/2 -z-10 flex -translate-y-1/2 transform-gpu justify-center overflow-hidden blur-3xl sm:bottom-0 sm:right-[calc(50%-6rem)] sm:top-auto sm:translate-y-0 sm:transform-gpu sm:justify-end"
          aria-hidden="true"
        >
          <div
            class="aspect-[1108/632] w-[69.25rem] flex-none bg-gradient-to-r from-[#34d399] to-[#10b981] opacity-25"
            style="
              clip-path: polygon(
                73.6% 48.6%,
                91.7% 88.5%,
                100% 53.9%,
                97.4% 18.1%,
                92.5% 15.4%,
                75.7% 36.3%,
                55.3% 52.8%,
                46.5% 50.9%,
                45% 37.4%,
                50.3% 13.1%,
                21.3% 36.2%,
                0.1% 0.1%,
                5.4% 49.1%,
                21.4% 36.4%,
                58.9% 100%,
                73.6% 48.6%
              );
            "
          />
        </div>
        <div class="mx-auto max-w-2xl text-center">
          <h2
            class="text-balance text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl"
          >
            Discover and Hire Top Artists and Crafters
          </h2>
          <p class="mx-auto mt-6 max-w-xl text-pretty text-lg/8 text-gray-600">
            Connect with talented artists and crafters from around the world.
            Whether you're looking for painters, sculptors, or artisans,
            Artsycrowd has the talent you need.
          </p>
          <div class="mt-10 flex items-center justify-center gap-x-6">
            <RouterLink
              to="/login"
              class="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >Get started</RouterLink
            >
            <RouterLink
              to="/login"
              class="text-sm/6 font-semibold text-gray-900"
              >Learn more <span aria-hidden="true">→</span></RouterLink
            >
          </div>
        </div>
        <div
          class="absolute left-1/2 right-0 top-full -z-10 hidden -translate-y-1/2 transform-gpu overflow-hidden blur-3xl sm:block"
          aria-hidden="true"
        >
          <div
            class="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#34d399] to-[#10b981] opacity-30"
            style="
              clip-path: polygon(
                74.1% 44.1%,
                100% 61.6%,
                97.5% 26.9%,
                85.5% 0.1%,
                80.7% 2%,
                72.5% 32.5%,
                60.2% 62.4%,
                52.4% 68.1%,
                47.5% 58.3%,
                45.2% 34.5%,
                27.5% 76.7%,
                0.1% 64.9%,
                17.9% 100%,
                27.6% 76.8%,
                76.1% 97.7%,
                74.1% 44.1%
              );
            "
          />
        </div>
      </div>
    </main>
  </div>
</template>
