<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ref } from 'vue';
import { profileDisplayStore } from '~/store/profileDisplayStore';

const router = useRouter();

const { profileDisplay } = storeToRefs(profileDisplayStore());

const tabs = ref([
  { name: 'All freelancer', current: true },
  { name: 'Saved freelancer', current: false },
]);

const setActiveTab = (tabName: string) => {
  tabs.value.forEach(tab => {
    tab.current = (tab.name === tabName);
  });
};

const handleInputFocus = () => {
  console.log('Input is selected');
};

interface Account {
  id: number;
  user: {
    avatar: {
      original_url: string;
    };
    banner: {
      original_url: string;
    };
    first_name: string;
    last_name: string;
    created_at: string;
    country_code: string;
  };
  title: string;
  skills: { id: number; name: string }[];
  bio: string;
}

const freelancers = ref<Account[]>([
  {
    id: 1,
    user: {
      avatar: {
        original_url: 'https://example.com/avatar1.jpg',
      },
      banner: {
        original_url: 'https://example.com/banner1.jpg',
      },
      first_name: 'John',
      last_name: 'Doe',
      created_at: '2023-01-01',
      country_code: 'Philippines',
    },
    title: 'Web Developer',
    skills: [
      { id: 1, name: 'JavaScript' },
      { id: 2, name: 'Vue.js' },
    ],
    bio: 'Experienced web developer with a focus on front-end technologies.',
  },
  {
    id: 2,
    user: {
      avatar: {
        original_url: 'https://example.com/avatar2.jpg',
      },
      banner: {
        original_url: 'https://example.com/banner2.jpg',
      },
      first_name: 'Jane',
      last_name: 'Smith',
      created_at: '2022-05-15',
      country_code: 'CA',
    },
    title: 'Graphic Designer',
    skills: [
      { id: 3, name: 'Photoshop' },
      { id: 4, name: 'Illustrator' },
    ],
    bio: 'Creative graphic designer with over 5 years of experience.',
  },

]);

const freelancerProfile = (user: Account) => {
  profileDisplay.value = user;
  router.push({ path: `/freelancer/${user.id}` });
}

</script>

<template>
  <div class="my-8 lg:mx-auto mx-5">
    <ProfileInfo class="max-w-6xl mx-auto " />
    <div class="max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-4 mt-5 mx-auto ">

      <!-- Left Column -->
      <div class="col-span-1 flex flex-col gap-4">
        <!-- Skill search -->
        <Section>
          <template #header>
            <div class="flex justify-between items-center">
              <h2 class="text-xl font-bold">Skill</h2>
            </div>
          </template>
          <template #content>
            <!-- Skill search input -->
          </template>
        </Section>

        <!-- Hourly Range -->
        <Section>
          <template #header>
            <div class="flex justify-between items-center">
              <h2 class="text-xl font-bold">Hourly Range</h2>
              <button>Clear</button>
            </div>
          </template>
          <template #content>
            <!-- content -->
          </template>
        </Section>


        <!-- Ratings search -->
        <Section>
          <template #header>
            <div class="flex justify-between items-center">
              <h2 class="text-xl font-bold">Ratings</h2>
              <button>Clear</button>
            </div>
          </template>
          <template #content>
            <!-- content -->
          </template>
        </Section>

        <!-- Freelancer Earnings search -->
        <Section>
          <template #header>
            <div class="flex justify-between items-center">
              <h2 class="text-xl font-bold">Freelancer Earnings</h2>
              <button>Clear</button>
            </div>
          </template>
          <template #content>
            <!-- content -->
          </template>
        </Section>

        <!-- Countries search -->
        <Section>
          <template #header>
            <div class="flex justify-between items-center">
              <h2 class="text-xl font-bold">Countries</h2>
            </div>
          </template>
          <template #content>
            <!-- content -->
          </template>
        </Section>

      </div>

      <!-- Right Column -->
      <div class="col-span-1 lg:col-span-2 ">
        <div class="grid grid-cols-1 gap-5">
          <div class="border border-gray-300 rounded-lg p-4 flex flex-row items-center gap-2">
            <Icon icon="material-symbols:search" class=" text-xl text-gray-400" />
            <input type="text" placeholder="Search for freelancers..." class="w-full outline-none border-none"
              @focus="handleInputFocus" />
          </div>
          <div>
            <nav class="flex space-x-4" aria-label="Tabs">
              <template v-for="tab in tabs" :key="tab.name">
                <a href="#" @click.prevent="setActiveTab(tab.name)"
                  :class="tab.current ? 'bg-primary/30 text-primary' : 'text-gray-500 hover:text-gray-700'"
                  class="px-3 py-2 font-medium text-sm rounded-md">
                  {{ tab.name }}
                </a>
              </template>
            </nav>
          </div>

          <div v-if="tabs[0].current" class="flex flex-col gap-4">
            <div v-for="(freelancer, idx) in freelancers" :key="idx">
              <FreelancerCard @profile="freelancerProfile" :freelancer="freelancer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>