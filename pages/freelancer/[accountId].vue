<template>
    <div class="my-8 lg:mx-auto mx-5">
        <ProfileDisplay class="max-w-6xl mx-auto " />
        <div class="max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-4 mt-5 mx-auto ">

            <!-- Left Column -->
            <div class="col-span-1">
                <Section>
                    <template #header>
                        <div class="flex justify-between items-center">
                            <h2 class="text-xl font-bold">Statistics</h2>
                        </div>
                    </template>
                    <template #content>
                        <div class="flex flex-row justify-evenly">
                            <div class="flex flex-col justify-center items-center">
                                <span class="text-lg text-red-400 font-bold">0</span>
                                <span>Total Hours</span>
                            </div>
                            <div class="flex flex-col justify-center items-center">
                                <span class="text-lg text-red-400 font-bold">0</span>
                                <span>Completed Jobs</span>
                            </div>
                            <div class="flex flex-col justify-center items-center">
                                <span class="text-lg text-red-400 font-bold">0</span>
                                <span>Total Earnings</span>
                            </div>
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
                                <h2 class="text-xl font-bold">About</h2>
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
                                <h2 class="text-xl font-bold">Feedback & History</h2>
                            </div>
                        </template>
                        <template #content>
                            <div class="mt-4">
                                <p class="text-gray-500">Feedback & History Section</p>
                            </div>
                        </template>
                    </Section>
                </div>
            </div>
        </div>
    </div>
</template>