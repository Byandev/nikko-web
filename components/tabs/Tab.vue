<template>
    <div class="max-w-4xl mx-auto">
        <div class="sm:hidden">
            <label for="tabs" class="sr-only">Select a tab</label>
            <select id="tabs" name="tabs"
                class="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                @change="handleTabChange">
                <option v-for="tab in tabs" :key="tab.name" :value="tab.href" :selected="tab.current">{{ tab.name }}
                </option>
            </select>
        </div>
        <div class="hidden sm:block">
            <nav class="isolate flex divide-x divide-gray-200 rounded-lg shadow" aria-label="Tabs">
                <NuxtLink v-for="(tab, tabIdx) in tabs" :key="tab.name" :to="tab.href"
                    :class="[tab.current ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700', tabIdx === 0 ? 'rounded-l-lg' : '', tabIdx === tabs.length - 1 ? 'rounded-r-lg' : '', 'group relative min-w-0 flex-1 overflow-hidden bg-white px-4 py-4 text-center text-sm font-medium hover:bg-gray-50 focus:z-10']"
                    :aria-current="tab.current ? 'page' : undefined">
                    <span>{{ tab.name }}</span>
                    <span aria-hidden="true"
                        :class="[tab.current ? 'bg-indigo-500' : 'bg-transparent', 'absolute inset-x-0 bottom-0 h-0.5']" />
                </NuxtLink>
            </nav>
        </div>
        <!-- Slot for additional content -->
        <div class="mt-4">
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';

interface Tab {
    name: string;
    href: string;
    current: boolean;
}

const props = defineProps<{
    tabs: Tab[];
}>();

const route = useRoute();
const tabs = ref(props.tabs);

const router = useRouter();

const handleTabChange = (event: Event) => {
    const selectedTab = (event.target as HTMLSelectElement).value;
    router.push(selectedTab);
};

// Watch for changes in the route and update the current tab
watch(
    () => route.path,
    (newPath) => {
        tabs.value.forEach(tab => {
            tab.current = tab.href === newPath;
        });
    },
    { immediate: true }
);
</script>