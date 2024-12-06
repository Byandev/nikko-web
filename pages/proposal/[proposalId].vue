<script setup lang="ts">
import { accountStore } from '~/store/accountStore';
import type { ApiErrorResponse } from '~/types/api/response/error';
import { Icon } from '@iconify/vue';
import {
    Listbox,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
} from '@headlessui/vue';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid';
import _ from 'lodash';
import { Term } from '~/types/models/Project';
import { helpers, required } from '@vuelidate/validators';
import type { Proposal } from '~/types/models/Proposal';
import type { Media } from '~/types/models/Media';


const route = useRoute();
const { account } = storeToRefs(accountStore());
const { data: proposal, fetchData: fetchProposal, pending: isLoading } = useFetchData<{ data: Proposal }, ApiErrorResponse>();
const isEditing = ref(false);

onMounted(async () => {
    await fetchProposal(`v1/${account.value?.type === 'CLIENT'? 'client/' : ''}proposals/${route.params.proposalId}`, {
        headers: account?.value?.id ? {
            'X-ACCOUNT-ID': account.value.id.toString(),
        } : undefined,
    });

    console.log('proposal', proposal.value?.data);

    form.value = {
        cover_letter: proposal?.value?.data.cover_letter ?? '',
        bid: proposal?.value?.data.bid ?? 0,
        length: proposal?.value?.data.length ?? '',
        attachments: proposal?.value?.data.attachments ?? [],
    };
});

interface Form {
    cover_letter: string;
    bid: number;
    length: string;
    attachments: Media[] | File[];
}

const form = ref<Form>({
    cover_letter: '',
    bid: 0,
    length: '',
    attachments: [],
});

const rules = {
    bid: { required: helpers.withMessage('Bid is required', required) },
    length: { required: helpers.withMessage('Duration is required', required) },
    attachments: { required: helpers.withMessage('Attanchments are required', required) },
    cover_letter: { required: helpers.withMessage('Cover letter is required', required) },
};

const { v$ } = useValidation(form, rules)

const selectedFiles = ref<File[]>([]);

const handleClick = () => {
    const fileInput = document.getElementById('file') as HTMLInputElement;
    fileInput.click();
};

const handleRemoveFile = (fileNameToRemove: string) => {
    selectedFiles.value = selectedFiles.value.filter(file => file.name !== fileNameToRemove);
    form.value.attachments = form.value.attachments.filter(attachment => attachment.name !== fileNameToRemove) as File[];
};

const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files) {
        const newFiles = Array.from(target.files);
        selectedFiles.value = selectedFiles.value.concat(newFiles);
        form.value.attachments = form.value.attachments.concat(newFiles) as File[];
    }
};

const { sendRequest: submitProposal, pending: isSubmitting } = useSubmit<{ data: Proposal }, ApiErrorResponse>();
const { sendRequest: uploadMedia, pending: isUploading } = useSubmit<{ data: Media }, ApiErrorResponse>();

const router = useRouter();

const submitForm = async (id: number) => {
    v$.value.$touch();
    if (v$.value.$invalid) return;

    try {
        const uploadPromises = selectedFiles.value.map(file => {
            const formData = new FormData();
            formData.append('file', file);
            return uploadMedia('/v1/medias', {
                method: 'POST',
                body: formData,
            });
        });

        const uploadResponses = await Promise.all(uploadPromises);
        const uploadedAttachments = uploadResponses.map(response => response.data.id);

        // Extract only the id from Media objects
        const mediaData = form.value.attachments
            .filter(file => !(file instanceof File))
            .map(media => (media as Media).id);

        const body = ref({
            project_id: route.params.projectId,
            cover_letter: form.value.cover_letter,
            bid: form.value.bid,
            length: form.value.length,
            attachments: [...uploadedAttachments, ...mediaData]
        });

        await submitProposal(`/v1/proposals/${id}`, {
            method: 'PUT',
            headers: account?.value?.id ? {
                'X-ACCOUNT-ID': account.value.id.toString(),
            } : undefined,
            body: body.value,
        });

        router.push('/my-contract/submitted-proposals');
    } catch (error) {

    }
};

</script>

<template>
    <div class="my-8 lg:mx-auto mx-5">
        <div class="max-w-6xl grid grid-cols-1 gap-4 mt-5 mx-auto">
            <div class="w-full justify-between flex-row flex">
                <h1 class="text-4xl font-medium whitespace-nowrap">{{ account?.type === 'FREELANCER'? 'Review proposal' : 'Your proposal' }}</h1>
                <Button v-if="account?.type === 'FREELANCER'" :text="isEditing? 'Done': 'Edit'" @click="isEditing? isEditing=false: isEditing=true" type="button" foreground="white" background="primary"/>
            </div>
            <div class="flex flex-col gap-4">
                <div class="ring-1 ring-gray-300 rounded-md px-4 md:px-8 my-3 flex-1" v-if="!isLoading && proposal">
                    <header class="py-4 md:py-6">
                        <h2 class="text-xl md:text-2xl mb-2 md:mb-3">Job details</h2>
                    </header>
                    <section class="pb-6 md:pb-8">
                        <div class="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-5">
                            <!-- Left Side -->
                            <div class="md:col-span-8 lg:col-span-9">
                                <h2 class="text-lg md:text-xl mb-4 md:mb-6">{{ proposal.data.project.title ?? 'No title'
                                    }}</h2>
                                <div>
                                    <span class="text-sm">{{ proposal.data.project.description ?? 'No description'
                                        }}</span>
                                </div>
                            </div>
                            <!-- Right Side -->
                            <div class="border-l-0 md:border-l-2 block md:col-span-4 lg:col-span-3 pl-0 md:pl-4"
                                v-if="proposal.data.project.experience_level || proposal.data.length || proposal.data.project.estimated_budget">
                                <ul>
                                    <li class="flex justify-start items-center gap-2 md:gap-3"
                                        v-if="proposal.data.project.experience_level">
                                        <Icon icon="mdi-light:diamond-stone" style="color: black" />
                                        <div class="flex flex-col">
                                            <strong>{{ _.capitalize(proposal.data.project.experience_level) ?? 'Any'
                                                }}</strong>
                                            <small>Experience Level</small>
                                        </div>
                                    </li>
                                    <li class="flex justify-start items-center gap-2 md:gap-3"
                                        v-if="proposal.data.project.estimated_budget">
                                        <Icon icon="fluent-mdl2:money" style="color: black" />
                                        <div class="flex flex-col">
                                            <strong>{{ proposal.data.project.estimated_budget }}</strong>
                                            <small>Estimated Budget</small>
                                        </div>
                                    </li>
                                    <li class="flex justify-start items-center gap-2 md:gap-3"
                                        v-if="proposal.data.length">
                                        <Icon icon="mingcute:time-duration-line" style="color: black" />
                                        <div class="flex flex-col">
                                            <strong>{{ _.startCase(proposal.data.length.toLowerCase()) }}</strong>
                                            <small>Duration</small>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>
                </div>
                <form v-if="proposal?.data.id" @submit.prevent="submitForm(proposal.data.id)">

                    <div class="ring-1 ring-gray-300 rounded-md px-4 md:px-8 my-3 flex-1" v-if="!isLoading && proposal">
                        <header class="py-4 md:py-6">
                            <h3 class="text-base">How long will this proposal takes?</h3>
                        </header>
                        <section class="pb-6 md:pb-8">
                            <Listbox :disabled="!isEditing" v-model="form.length"
                                class="ring-1 ring-gray-300 rounded-md max-w-72">
                                <div class="relative mt-1">
                                    <ListboxButton
                                        class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                        <span class="block truncate">
                                            <span v-if="!form.length">Select a duration</span>
                                            <span v-else>{{ _.startCase(form.length.toLowerCase()) }}</span>
                                        </span>
                                        <span
                                            class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                            <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                                        </span>
                                    </ListboxButton>

                                    <transition leave-active-class="transition duration-100 ease-in"
                                        leave-from-class="opacity-100" leave-to-class="opacity-0">
                                        <ListboxOptions
                                            class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base ring-1 ring-primary ring-opacity-5 focus:outline-none sm:text-sm z-50">
                                            <ListboxOption v-for="(term, index) in Term" v-slot="{ active, selected }"
                                                :key="index" :value="term" as="template">
                                                <li
                                                    :class="[active ? 'bg-primary/10 text-primary' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-10 pr-4']">
                                                    <span
                                                        :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">{{
                                                        _.startCase(term.toLowerCase())
                                                        }}</span>
                                                    <span v-if="selected"
                                                        class="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                                                        <CheckIcon class="h-5 w-5" aria-hidden="true" />
                                                    </span>
                                                </li>
                                            </ListboxOption>
                                        </ListboxOptions>
                                    </transition>
                                </div>
                            </Listbox>
                            <span v-if="v$.length.$error" class="text-red-900 text-sm">{{
                                v$.length.$errors[0].$message }}</span>
                        </section>
                    </div>

                    <div class="ring-1 ring-gray-300 rounded-md px-4 md:px-8 my-3 flex-1" v-if="!isLoading && proposal">
                        <header class="py-4 md:py-6">
                            <h3 class="text-base">Terms</h3>
                        </header>
                        <section class="pb-6 md:pb-8">
                            <div class="flex flex-col gap-4 max-w-72">
                                <label for="hourly_rate" class="text-sm font-medium text-gray-700">Bid</label>
                                <input :disabled="!isEditing" type="number" id="hourly_rate" v-model="form.bid"
                                    class="mt-1 block w-full rounded-md ring-1 ring-gray-300 shadow-sm sm:text-sm p-2"
                                    placeholder="Enter your hourly rate" />
                            </div>
                            <span v-if="v$.length.$error" class="text-red-900 text-sm">{{
                                v$.length.$errors[0].$message }}</span>
                        </section>
                    </div>

                    <div class="ring-1 ring-gray-300 rounded-md px-4 md:px-8 my-3 flex-1" v-if="!isLoading && proposal">
                        <header class="py-4 md:py-6">
                            <h3 class="text-base">Additional details</h3>
                        </header>
                        <section class="pb-6 md:pb-8">
                            <div class="flex flex-col gap-4 h-64">
                                <label for="cover_letter" class="text-sm font-medium text-gray-700">Cover letter</label>
                                <textarea :disabled="!isEditing" id="cover_letter" v-model="form.cover_letter"
                                    class="mt-1 block w-full h-full rounded-md ring-1 ring-gray-300 shadow-sm sm:text-sm p-2"
                                    placeholder="Enter your cover letter"></textarea>
                            </div>
                            <span v-if="v$.cover_letter.$error" class="text-red-900 text-sm">{{
                                v$.cover_letter.$errors[0].$message }}</span>
                        </section>

                        <hr class="border-gray-300" />

                        <header class="py-4 md:py-6">
                            <h3 class="text-base">Attachments</h3>
                        </header>
                        <section class="pb-6 md:pb-8">
                            <div class="flex flex-col gap-4">
                                <div v-if="account?.type === 'FREELANCER'" class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 cursor-pointer"
                                    @click="handleClick">
                                    <Icon icon="mdi:file" :ssr="true" />
                                    <input :disable="!isEditing" type="file" id="file" multiple
                                        @change="handleFileChange" class="hidden" accept="image/*">
                                    <p
                                        class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                                        Click to select a file</p>
                                </div>
                            </div>
                            <div v-if="selectedFiles.length || form.attachments.length" :class="account?.type === 'FREELANCER'? 'mt-5' : ''">
                                <ul class="mt-2 space-y-4">
                                    <li v-for="(image, index) in form.attachments" :key="index"
                                        class="flex items-center justify-between p-2 bg-gray-100 rounded-md shadow-sm">
                                        <div class="flex items-center space-x-2 w-full">
                                            <Icon icon="mdi:file" class="text-gray-500" width="24" height="24" />
                                            <span class="text-sm text-gray-900 truncate max-w-52 lg:max-w-96"
                                                :title="image.name">{{
                                                image.name }}</span>
                                        </div>
                                        <button v-if="account?.type === 'FREELANCER'" @click="handleRemoveFile(String(image.name))"
                                            class="text-red-500 hover:text-red-700">
                                            <Icon icon="mdi:close" width="16" height="16" />
                                        </button>
                                    </li>
                                </ul>
                            </div>
                            <span v-if="v$.attachments.$error" class="text-red-900 text-sm">{{
                                v$.attachments.$errors[0].$message }}</span>
                        </section>
                    </div>
                    <div v-if="account?.type === 'FREELANCER'" class="flex flex-row gap-2 w-full justify-end">
                        <Button text="Update Proposal" type="submit" background="primary" :is-loading="isLoading || isSubmitting || isUploading
                            " foreground="white" />
                        <NuxtLink :to="`/find-work`">
                            <Button text="Cancel" type="button" :is-loading="isLoading || isSubmitting || isUploading"
                                background="white" foreground="primary" />
                        </NuxtLink>
                    </div>
                    <div v-else class="flex justify-end">
                        <Button @click="router.back()" text="Close" type="submit" background="primary" foreground="white" />
                    </div>

                </form>
            </div>
        </div>
    </div>
</template>