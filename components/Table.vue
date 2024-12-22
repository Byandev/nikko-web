<template>
    <div class="bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-300">
                    <thead>
                        <tr>
                            <th v-for="column in columns" :key="column.name" scope="col"
                                class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                {{ column.name }}
                            </th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                        <tr v-for="row in rows" :key="row.email">
                            <slot :row="row"></slot>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Row {
    [key: string]: any;
}

interface Column {
    name: string;
    isAction?: boolean;
}

defineProps<{
    columns: Column[],
    rows: Row[]
}>();
</script>
