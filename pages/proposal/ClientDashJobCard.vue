
<template>
    <div class="job-card bg-white p-5 ring-1 ring-gray-300 rounded-md hover:cursor-pointer flex">
        <div class="flex-1">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
                <h2 class="text-xl font-bold text-gray-800">{{ props.job.title }}</h2>
                <div class="relative mt-2 sm:mt-0" v-if="props.options">
                    <Icon @click="dropdownOpen = !dropdownOpen" icon="mi:options-vertical"
                        class="text-2xl hover:cursor-pointer" />
                    <div v-if="dropdownOpen"
                        class="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                        <button @click="handleEdit"
                            class="flex flex-row px-4 py-2 items-center text-gray-700 hover:bg-gray-100 w-full">
                            <Icon icon="mdi:pencil" class="mr-2" />
                            Edit
                        </button>
                        <button @click="handleDelete"
                            class="flex flex-row px-4 py-2 items-center text-gray-700 hover:bg-gray-100 w-full">
                            <Icon icon="mdi:trash-can" class="mr-2" />
                            Delete
                        </button>
                    </div>
                </div>
            </div>
            <p class="text-gray-600 mb-4">{{ props.job.description }}</p>
            <div class="mt-5 flex flex-col lg:flex-row items-start lg:items-center justify-start lg:justify-between gap-3">
                <div class="flex items-center space-x-2">
                    <span class="text-sm text-gray-500">Experience Level:</span>
                    <span class="text-sm font-medium text-gray-700">{{ _.capitalize(props.job.experience_level) }}</span>
                </div>
                <div class="flex items-center space-x-2 mt-2 lg:mt-0">
                    <span class="text-sm text-gray-500">Project Length:</span>
                    <span class="text-sm font-medium text-gray-700">{{ _.startCase(props.job.length?.toLowerCase() || '') }}</span>
                </div>
            </div>
            <div class="mt-4 flex flex-col sm:flex-row items-start sm:items-center space-x-0 sm:space-x-2" v-if="props.job.languages">
                <span class="text-sm text-gray-500">Languages:</span>
                <div class="flex flex-wrap gap-2 mt-2 sm:mt-0">
                    <span v-for="(language, index) in props.job.languages" :key="index"
                        class="bg-primary/15 text-primary text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                        {{ language.name }}
                    </span>
                </div>
            </div>
            <div class="mt-4 flex flex-col sm:flex-row items-start sm:items-center space-x-0 sm:space-x-2" v-if="props.job.skills">
                <span class="text-sm text-gray-500">Skills:</span>
                <div class="flex flex-wrap gap-2 mt-2 sm:mt-0">
                    <span v-for="(skill, index) in props.job.skills" :key="index"
                        class="bg-primary/15 text-primary text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                        {{ skill.name }}
                    </span>
                </div>
            </div>
            <div class="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <span class="text-lg font-semibold text-gray-800">${{ props.job.estimated_budget }}</span>
                <div class="flex flex-col gap-2 sm:gap-3 mt-2 sm:mt-0">
                    <slot></slot>
                </div>
            </div>
        </div>
        <div class="flex-1">
            <div class="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <span class="text-sm text-gray-500">Status:</span>
                <span class="text-sm font-medium text-gray-700">{{ props.job.status }}</span>
            </div>
        </div>
    </div>
</template>