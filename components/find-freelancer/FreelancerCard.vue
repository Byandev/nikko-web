<script setup lang="ts">
import type { Freelancer } from '~/types/models/Freelancer';
import { Icon } from '@iconify/vue';


const emit = defineEmits<{
    (e: 'profile', user: Freelancer): void;
    (e: 'save', id: number): void;
    (e: 'unsave', id: number): void;
}>();

const defaultAvatarUrl = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

const props = defineProps<{ 
    freelancer: Freelancer 
}>();

</script>

<template>
    <div class="border rounded-lg p-4">
        <div class="flex flex-row justify-between gap-4">
            <div class="flex flex-row gap-3 items-center">
                <img :src="props.freelancer.user.avatar?.original_url || defaultAvatarUrl" alt="profile" class="w-16 h-16 rounded-full">
                <div class="flex flex-col justify-center">
                    <span class="text-lg font-bold" v-if="props.freelancer.user">{{ props.freelancer.user.first_name }} {{ props.freelancer.user.last_name }}</span>
                    <span class="text-sm text-gray-500" v-if="props.freelancer.user">{{ props.freelancer.title }}</span>
                </div>
            </div>
            <div class="flex flex-col gap-3">
                <Button @click="emit('profile',freelancer)"  text="See Profile" type="button" background="primary" foreground="white"/>
                <div v-if="!props.freelancer.is_saved" @click="emit('save',freelancer.id)" class="flex flex-row justify-center items-center border rounded-lg px-2 py-1 gap-2 hover:cursor-pointer">
                    <Icon icon="mdi:heart" class="text-primary"  />
                    <button class="text-primary">Save</button>
                </div>
                <div v-else @click="emit('unsave',freelancer.id)" class="flex flex-row justify-center items-center border rounded-lg px-2 py-1 gap-2 hover:cursor-pointer">
                    <Icon icon="mdi:heart-outline" class="text-primary" />
                    <button class="text-primary">Unsave</button>
                </div>
            </div>
        </div>
        <div v-if="props.freelancer.skills.length > 0" class="mt-4 w-full">
            <label for="profileTitle" class="block text-sm font-medium leading-6 text-gray-900">
                Skills
            </label>
            <div class="mt-2 flex flex-row gap-2 flex-wrap">
                <div v-for="skill in props.freelancer.skills" :key="`selected-skill-${skill.id}`">
                    <span
                        class="inline-flex items-center gap-x-0.5 rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        {{ skill.name }}
                    </span>
                </div>
            </div>
        </div>
        <div class="mt-4">
            <p class="text-gray-600 text-sm">{{ props.freelancer.bio }}</p>
        </div>
    </div>
</template>
