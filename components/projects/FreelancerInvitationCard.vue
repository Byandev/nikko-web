<script setup lang="ts">
import type { Account } from '~/types/models/Account';


const emit = defineEmits<{
    (e: 'hire', id: number): void;
}>();

const defaultAvatarUrl = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

const props = defineProps<{
    freelancer: Account
}>();

const { freelancer } = toRefs(props)

</script>

<template>
    <div class="bg-white hover:bg-gray-100 ring-1 ring-gray-300 rounded-md hover:cursor-pointer flex divide-x text-sm text-gray-800">
        <div class="w-9/12 px-5 py-5 space-y-4">
            <div class="flex flex-row justify-between gap-4">
                <div class="flex flex-row gap-3 items-center">
                    <img :src="props.freelancer.user?.avatar?.original_url || defaultAvatarUrl" alt="profile"
                        class="w-16 h-16 rounded-full">
                    <div class="flex flex-col justify-center">
                        <span class="text-lg font-bold" v-if="props.freelancer.user">
                            {{ props.freelancer.user.first_name || 'No name provided' }} {{
                                props.freelancer.user.last_name || '' }}
                        </span>
                        <span class="text-sm text-gray-500" v-if="props.freelancer.user">{{ props.freelancer.title
                            }}</span>
                    </div>
                </div>
            </div>
            <div v-if="props.freelancer.skills && props.freelancer.skills.length > 0" class="mt-4 w-full">
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

        <div class="w-3/12 divide-y p-4 flex flex-col item-center gap-2 justify-center">
            <Button @click="emit('hire', freelancer.id)" text="Hire" type="button" background="primary"
                foreground="white" />
        </div>
    </div>
</template>
