<script setup lang="ts">
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { Proposal } from '~/types/models/Proposal';
import { accountStore } from '~/store/accountStore';
import _ from 'lodash';
import { Icon } from '@iconify/vue';
import { helpers, required } from '@vuelidate/validators';
import type { Contract } from '~/types/models/Contract';

const { account } = storeToRefs(accountStore());
const route = useRoute();
const { data: proposal, fetchData: fetchProposal, pending: isLoading } = useFetchData<{ data: Proposal }, ApiErrorResponse>();
const { sendRequest: sendOffer, pending: isSubmitting } = useSubmit<{ data: Contract }, ApiErrorResponse>();

const requestHeaders = computed<HeadersInit | undefined>(() =>
    account.value?.id ? { 'X-ACCOUNT-ID': account.value.id.toString() } : undefined
);

const avatarUrl = computed(
    () => proposal.value?.data.project.account.user?.avatar?.original_url ??
        'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
);

const name = computed(
    () => proposal.value?.data.project.account.user.first_name && proposal.value?.data.project.account.user.last_name ?
        `${proposal.value?.data.project.account.user.first_name} ${proposal.value?.data.project.account.user.first_name}` :
        'No name provided'
);

const location = computed(
    () => proposal.value?.data.project.account.user.country_code ?? 'No location provided'
);

const bio = computed(
    () => proposal.value?.data.project.account.bio ?? 'No bio provided'
);

const showAllDescription = ref(false);
const hasLongDescription = computed(() => (proposal.value?.data.project.description?.length ?? 0) > 300);

const openEditProjectModal = ref<boolean>(false)
const selectedFieldToEdit = ref<string>('')
const modalHeader = ref<string>('')

onMounted(async () => {
    await fetchProposal(`v1/client/proposals/${route.params.proposalId}`, {
        headers: requestHeaders.value
    });
});

const form = ref<{ amount: number | null; end_date: string }>({
    amount: null,
    end_date: ''
});

const rules = {
    amount: { required: helpers.withMessage('Amount is required', required) },
    end_date: { required: helpers.withMessage('End date is required', required) },
};

const { v$ } = useValidation(form, rules);


const router = useRouter();
const submitOffer = async () => {
    v$.value.$touch();
    if (v$.value.$invalid) return;

    try {
        const response = await sendOffer(!proposal.value?.data.contract ? `/v1/client/contracts` : `/v1/client/contracts/${proposal.value.data.contract.id}`, {
            method: !proposal.value?.data.contract ? 'POST' : 'PUT',
            headers: requestHeaders.value,
            body: {
                proposal_id: proposal.value?.data.id,
                amount: form.value.amount,
                end_date: form.value.end_date
            }
        });

        await router.push(`/send-offer/${proposal.value?.data.id}/hire/${response.data.id}`); 

    }catch (error) {
        console.error(error);
    }
}

const goback = () => {
    router.push(`/projects/${proposal.value?.data.project.id}/proposals`);
}
</script>

<template>
    <EditProjectModal :project="proposal?.data.project" :header="modalHeader" :isOpen="openEditProjectModal"
        :toEdit="selectedFieldToEdit" @toggle-open="openEditProjectModal = $event" />
    <div class="my-8 lg:mx-auto mx-5">
        <div class="max-w-6xl grid grid-cols-1 gap-4 mt-5 mx-auto">
            <div class="w-full justify-between flex-row flex">
                <h1 class="text-4xl font-medium whitespace-nowrap">Send a offer</h1>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="pb-6 md:pb-8 ring-1 ring-gray-300 p-4 rounded-md flex flex-col items-center h-fit">
                    <img :src="avatarUrl" :alt="name" class="w-16 h-16 rounded-full">
                    <h2 class="text-lg font-medium mt-4">{{ name }}</h2>
                    <p v-if="bio" class="text-sm text-gray-500 mt-1">{{ bio }}</p>
                    <p v-if="location" class="text-sm text-gray-500 mt-1">Location: {{ location }}</p>
                </div>

                <div class="col-span-1 md:col-span-3 ring-1 ring-gray-300 rounded-md">
                    <div class="pt-5 pb-5 px-5 border-b-2" v-if="proposal?.data.project.title && !isLoading">
                        <div class="flex items-center justify-between">
                            <p class="text-xl font-bold">{{ proposal?.data.project.title }}</p>
                            <Icon icon="akar-icons:edit" class="text-gray-500 text-xl hover:cursor-pointer" @click="{
                                openEditProjectModal = true;
                                selectedFieldToEdit = 'title';
                                modalHeader = 'Title';
                            }" />
                        </div>
                    </div>

                    <div v-else class="pt-5 pb-5 px-5 border-b-2">
                        <div class="animate-pulse">
                            <div class="h-6 bg-gray-300 rounded w-32"></div>
                        </div>
                    </div>

                    <div class="py-5 px-5 border-b-2" v-if="proposal?.data.project.description">
                        <div class="flex items-center justify-between">
                            <h4 class="font-semibold">Description:</h4>
                            <Icon icon="akar-icons:edit" class="text-gray-500 text-xl hover:cursor-pointer" @click="{
                                openEditProjectModal = true;
                                selectedFieldToEdit = 'description';
                                modalHeader = 'Description';
                            }" />
                        </div>
                        <p class="">
                            {{ hasLongDescription && showAllDescription ? proposal.data.project.description :
                            proposal.data.project.description?.slice(0, 300) }}
                        </p>
                        <p class="underline text-primary" v-if="hasLongDescription"
                            @click="showAllDescription = !showAllDescription">
                            {{ showAllDescription ? 'Show Less' : 'Show more' }}
                        </p>
                    </div>

                    <div v-else class="pt-5 pb-5 px-5 border-b-2">
                        <div class="animate-pulse">
                            <div class="h-6 bg-gray-300 rounded w-32 mb-3"></div>
                            <div class="h-6 bg-gray-300 rounded w-56"></div>
                        </div>
                    </div>

                    <div class="py-5 px-5 border-b-2 space-y-5">
                        <div v-if="proposal?.data.project.skills && proposal?.data.project.skills.length">
                            <div class="flex items-center justify-between">
                                <div class="font-medium">Skills:</div>
                                <Icon icon="akar-icons:edit" class="text-gray-500 text-xl hover:cursor-pointer" @click="{
                                    openEditProjectModal = true;
                                    selectedFieldToEdit = 'skills';
                                    modalHeader = 'Skills';
                                }" />
                            </div>
                            <div class="flex flex-wrap gap-1">
                                <span v-for="(skill, index) in proposal?.data.project.skills" :key="index"
                                    class="bg-primary/15 text-primary text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                                    {{ skill.name }}
                                </span>
                            </div>
                        </div>

                        <div v-else>
                            <div class="animate-pulse">
                                <div class="h-6 bg-gray-300 rounded w-32 mb-3"></div>
                                <div class="h-6 bg-gray-300 rounded w-56"></div>
                            </div>
                        </div>

                        <div v-if="proposal?.data.project.length">
                            <div class="flex items-center justify-between">
                                <h4 class="font-semibold">Project length:</h4>
                                <Icon icon="akar-icons:edit" class="text-gray-500 text-xl hover:cursor-pointer" @click="{
                                    openEditProjectModal = true;
                                    selectedFieldToEdit = 'length';
                                    modalHeader = 'Project length';
                                }" />
                            </div>
                            <p>{{ _.capitalize(_.startCase(proposal?.data.project.length)) }}</p>
                        </div>

                        <div v-else>
                            <div class="animate-pulse">
                                <div class="h-6 bg-gray-300 rounded w-32 mb-3"></div>
                                <div class="h-6 bg-gray-300 rounded w-56"></div>
                            </div>
                        </div>

                        <div v-if="proposal?.data.project.experience_level">
                            <div class="flex items-center justify-between">
                                <h4 class="font-semibold">Experience Level:</h4>
                                <Icon icon="akar-icons:edit" class="text-gray-500 text-xl hover:cursor-pointer" @click="{
                                    openEditProjectModal = true;
                                    selectedFieldToEdit = 'experience_level';
                                    modalHeader = 'Experience Level';
                                }" />
                            </div>
                            <p>{{ _.capitalize(_.startCase(proposal?.data.project.experience_level)) }}</p>
                        </div>

                        <div v-else>
                            <div class="animate-pulse">
                                <div class="h-6 bg-gray-300 rounded w-32 mb-3"></div>
                                <div class="h-6 bg-gray-300 rounded w-56"></div>
                            </div>
                        </div>
                    </div>
                    <div class="py-5 px-5 border-b-2 space-y-5">
                        <div v-if="proposal?.data.project.languages && proposal?.data.project.languages.length">
                            <div class="flex items-center justify-between">
                                <h4 class="font-semibold">Language:</h4>
                                <Icon icon="akar-icons:edit" class="text-gray-500 text-xl hover:cursor-pointer" @click="{
                                    openEditProjectModal = true;
                                    selectedFieldToEdit = 'languages';
                                    modalHeader = 'Languages';
                                }" />
                            </div>
                            <div class="flex flex-wrap gap-1">
                                <span v-for="(skill, index) in proposal?.data.project.languages" :key="index"
                                    class="bg-primary/15 text-primary text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                                    {{ skill.name }}
                                </span>
                            </div>
                        </div>

                        <div v-else>
                            <div class="animate-pulse">
                                <div class="h-6 bg-gray-300 rounded w-32 mb-3"></div>
                                <div class="h-6 bg-gray-300 rounded w-56"></div>
                            </div>
                        </div>
                    </div>
                    <form @submit.prevent="submitOffer">
                        <div class="py-5 px-5 space-y-5">
                            <div class="flex flex-col gap-5">
                                <div>
                                    <div class="flex items-center justify-between">
                                        <h4 class="font-semibold">Amount:</h4>
                                    </div>
                                    <input v-model="form.amount" type="number" class="w-full mt-2 p-2 border rounded-md"
                                        placeholder="Enter amount" />
                                    <span v-if="v$.amount.$error" class="text-red-900 text-sm">{{
                                        v$.amount.$errors[0].$message
                                        }}</span>
                                </div>
                                <div>
                                    <div class="flex items-center justify-between">
                                        <h4 class="font-semibold">End Date:</h4>
                                    </div>
                                    <input v-model="form.end_date" type="date"
                                        class="w-full mt-2 p-2 border rounded-md" />
                                    <span v-if="v$.end_date.$error" class="text-red-900 text-sm">{{
                                        v$.end_date.$errors[0].$message
                                    }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="w-full flex justify-end py-5 gap-2 px-4">
                            <Button text="Cancel" @click="goback" foreground="primary" background="white" type="button"
                                class="ring-1 ring-primary" />
                            <Button :isLoading="isSubmitting" text="Send Offer" foreground="white" background="primary" type="submit" />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>