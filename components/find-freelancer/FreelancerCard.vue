<script setup lang="ts">

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

const emit = defineEmits<{
    (e: 'profile', user: Account): void;
}>();

defineProps<{ 
    freelancer: Account 
}>();
</script>

<template>
    <div class="border rounded-lg p-4">
        <div class="flex flex-row justify-between gap-4">
            <div class="flex flex-row gap-3">
                <img :src="freelancer.user.avatar?.original_url" alt="Freelancer" class="w-16 h-16 rounded-full" />
                <div class="flex flex-col justify-center">
                    <span class="text-lg font-bold">{{ freelancer.user.first_name }} {{ freelancer.user.last_name }}</span>
                    <span class="text-sm text-gray-500">{{ freelancer.title }}</span>
                </div>
            </div>
            <div class="flex flex-col gap-3">
                <Button @click="emit('profile',freelancer)"  text="View Profile" type="button" background="primary" foreground="white"/>
            </div>
        </div>
        <div class="mt-4 w-full">
            <label for="profileTitle" class="block text-sm font-medium leading-6 text-gray-900">
                Skills
            </label>
            <div class="mt-2 flex flex-row gap-2 flex-wrap">
                <div v-for="(skill, idx) in freelancer.skills" :key="`selected-skill-${skill.id}`">
                    <span
                        class="inline-flex items-center gap-x-0.5 rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        {{ skill.name }}
                    </span>
                </div>
            </div>
        </div>
        <div class="mt-4">
            <p class="text-gray-600 text-sm">{{ freelancer.bio }}</p>
        </div>
    </div>
</template>