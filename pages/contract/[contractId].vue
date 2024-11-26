<script setup lang="ts">
import type { ApiErrorResponse } from '~/types/api/response/error';
import { accountStore } from '~/store/accountStore';
import _ from 'lodash';
import { Icon } from '@iconify/vue';
import { helpers, required } from '@vuelidate/validators';
import type { Contract } from '~/types/models/Contract';

const { account } = storeToRefs(accountStore());
const route = useRoute();
const { data: contract, fetchData: fetchContract, pending: isLoading } = useFetchData<{ data: Contract }, ApiErrorResponse>();
const { sendRequest: updateOffer, pending: isSubmitting } = useSubmit<{ data: Contract }, ApiErrorResponse>();

const requestHeaders = computed<HeadersInit | undefined>(() =>
    account.value?.id ? { 'X-ACCOUNT-ID': account.value.id.toString() } : undefined
);


const avatarUrl = computed(
    () => contract.value?.data.account.user?.avatar?.original_url ??
        'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
);

const name = computed(
    () => contract.value?.data.account.user.first_name && contract.value?.data.account.user.last_name ?
        `${contract.value?.data.account.user.first_name} ${contract.value?.data.account.user.last_name}` :
        'No name provided'
);

const location = computed(
    () => contract.value?.data.account.user.country_code ?? 'No location provided'
);

const bio = computed(
    () => contract.value?.data.account.bio ?? 'No bio provided'
);

const showAllDescription = ref(false);
const hasLongDescription = computed(() => (contract.value?.data.proposal.project.description?.length ?? 0) > 300);

const openEditProjectModal = ref<boolean>(false)
const selectedFieldToEdit = ref<string>('')
const modalHeader = ref<string>('')

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

const handleUpdate = async () => {
    v$.value.$touch();
    if (v$.value.$invalid) return;

    try {
        await updateOffer(`/v1/client/contracts/${contract?.value?.data.id}`, {
            method: 'PUT',
            headers: requestHeaders.value,
            body: {
                proposal_id: contract.value?.data.id,
                amount: form.value.amount,
                end_date: form.value.end_date
            }
        });

        await router.push(`/projects/${contract.value?.data.proposal.project.id}/proposals`);

    } catch (error) {
        console.error(error);
    }
}

const handleDelete = async () => {
    try {
        await updateOffer(`/v1/client/contracts/${contract?.value?.data.id}`, {
            method: 'DELETE',
            headers: requestHeaders.value
        });

        await router.push(`/projects/${contract.value?.data.proposal.project.id}/proposals`);

    } catch (error) {
        console.error(error);
    }
}

const goback = () => {
    router.push(`/projects/${contract.value?.data.proposal.project.id}/proposals`);
}

onMounted(async () => {
    await fetchContract(`v1/client/contracts/${route.params.contractId}?include=account.user.avatar`, {
        headers: requestHeaders.value
    });
    form.value.amount = contract.value?.data.amount ?? null;
    form.value.end_date = contract.value?.data.end_date ?? '';
});

const showDeleteConfirmation = ref(false);
</script>

<template>
    <DeleteConfirmationModal :showModal="showDeleteConfirmation" @confirm="handleDelete"
        @close="showDeleteConfirmation = false" />
    <EditProjectModal :project="contract?.data.proposal.project" :header="modalHeader" :isOpen="openEditProjectModal"
        :toEdit="selectedFieldToEdit" @toggle-open="openEditProjectModal = $event" />
    <div class="my-8 lg:mx-auto mx-5">
        <div class="max-w-6xl grid grid-cols-1 gap-4 mt-5 mx-auto">
            <div class="w-full justify-between flex-row flex">
                <h1 class="text-4xl font-medium whitespace-nowrap">Update offer</h1>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="pb-6 md:pb-8 ring-1 ring-gray-300 p-4 rounded-md flex flex-col items-center h-fit">
                    <img :src="avatarUrl" :alt="name" class="w-16 h-16 rounded-full">
                    <h2 class="text-lg font-medium mt-4">{{ name }}</h2>
                    <p v-if="bio" class="text-sm text-gray-500 mt-1">{{ bio }}</p>
                    <p v-if="location" class="text-sm text-gray-500 mt-1">Location: {{ location }}</p>
                </div>

                <div class="col-span-1 md:col-span-3 ring-1 ring-gray-300 rounded-md">
                    <div class="pt-5 pb-5 px-5 border-b-2" v-if="contract?.data.proposal.project.title && !isLoading">
                        <div class="flex items-center justify-between">
                            <p class="text-xl font-bold">{{ contract?.data.proposal.project.title }}</p>
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

                    <div class="py-5 px-5 border-b-2" v-if="contract?.data.proposal.project.description">
                        <div class="flex items-center justify-between">
                            <h4 class="font-semibold">Description:</h4>
                            <Icon icon="akar-icons:edit" class="text-gray-500 text-xl hover:cursor-pointer" @click="{
                                openEditProjectModal = true;
                                selectedFieldToEdit = 'description';
                                modalHeader = 'Description';
                            }" />
                        </div>
                        <p class="">
                            {{ hasLongDescription && showAllDescription ? contract.data.proposal.project.description :
                            contract.data.proposal.project.description?.slice(0, 300) }}
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
                        <div
                            v-if="contract?.data.proposal.project.skills && contract?.data.proposal.project.skills.length">
                            <div class="flex items-center justify-between">
                                <div class="font-medium">Skills:</div>
                                <Icon icon="akar-icons:edit" class="text-gray-500 text-xl hover:cursor-pointer" @click="{
                                    openEditProjectModal = true;
                                    selectedFieldToEdit = 'skills';
                                    modalHeader = 'Skills';
                                }" />
                            </div>
                            <div class="flex flex-wrap gap-1">
                                <span v-for="(skill, index) in contract?.data.proposal.project.skills" :key="index"
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

                        <div v-if="contract?.data.proposal.project.length">
                            <div class="flex items-center justify-between">
                                <h4 class="font-semibold">Project length:</h4>
                                <Icon icon="akar-icons:edit" class="text-gray-500 text-xl hover:cursor-pointer" @click="{
                                    openEditProjectModal = true;
                                    selectedFieldToEdit = 'length';
                                    modalHeader = 'proposal.Project length';
                                }" />
                            </div>
                            <p>{{ _.capitalize(_.startCase(contract?.data.proposal.project.length)) }}</p>
                        </div>

                        <div v-else>
                            <div class="animate-pulse">
                                <div class="h-6 bg-gray-300 rounded w-32 mb-3"></div>
                                <div class="h-6 bg-gray-300 rounded w-56"></div>
                            </div>
                        </div>

                        <div v-if="contract?.data.proposal.project.experience_level">
                            <div class="flex items-center justify-between">
                                <h4 class="font-semibold">Experience Level:</h4>
                                <Icon icon="akar-icons:edit" class="text-gray-500 text-xl hover:cursor-pointer" @click="{
                                    openEditProjectModal = true;
                                    selectedFieldToEdit = 'experience_level';
                                    modalHeader = 'Experience Level';
                                }" />
                            </div>
                            <p>{{ _.capitalize(_.startCase(contract?.data.proposal.project.experience_level)) }}</p>
                        </div>

                        <div v-else>
                            <div class="animate-pulse">
                                <div class="h-6 bg-gray-300 rounded w-32 mb-3"></div>
                                <div class="h-6 bg-gray-300 rounded w-56"></div>
                            </div>
                        </div>
                    </div>
                    <div class="py-5 px-5 border-b-2 space-y-5">
                        <div
                            v-if="contract?.data.proposal.project.languages && contract?.data.proposal.project.languages.length">
                            <div class="flex items-center justify-between">
                                <h4 class="font-semibold">Language:</h4>
                                <Icon icon="akar-icons:edit" class="text-gray-500 text-xl hover:cursor-pointer" @click="{
                                    openEditProjectModal = true;
                                    selectedFieldToEdit = 'languages';
                                    modalHeader = 'Languages';
                                }" />
                            </div>
                            <div class="flex flex-wrap gap-1">
                                <span v-for="(skill, index) in contract?.data.proposal.project.languages" :key="index"
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
                    <form @submit.prevent="handleUpdate">
                        <div class="py-5 px-5 space-y-5">
                            <div class="flex flex-col gap-5">
                                <div>
                                    <div class="flex items-center justify-between">
                                        <h4 class="font-semibold">Amount:</h4>
                                    </div>
                                    <input
                                        :disabled="contract?.data.status === 'ACTIVE' || contract?.data.status === 'COMPLETED'"
                                        v-model="form.amount" type="number" class="w-full mt-2 p-2 border rounded-md"
                                        placeholder="Enter amount" />
                                    <span v-if="v$.amount.$error" class="text-red-900 text-sm">{{
                                        v$.amount.$errors[0].$message
                                        }}</span>
                                </div>
                                <div>
                                    <div class="flex items-center justify-between">
                                        <h4 class="font-semibold">End Date:</h4>
                                    </div>
                                    <input :disabled="contract?.data.status === 'COMPLETED'" v-model="form.end_date"
                                        type="date" class="w-full mt-2 p-2 border rounded-md" />
                                    <span v-if="v$.end_date.$error" class="text-red-900 text-sm">{{
                                        v$.end_date.$errors[0].$message
                                        }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="w-full flex justify-end py-5 gap-2 px-4">
                            <Button v-if="contract?.data.status === 'PENDING'" text="Delete Offer" foreground="red-600"
                                background="red-700" type="button" @click="showDeleteConfirmation= true"
                                class="ring-1 ring-red-600" />
                            <Button :text="contract?.data.status === 'COMPLETED' ? 'Close': 'Cancel'" @click="goback"
                                foreground="primary" background="white" type="button" class="ring-1 ring-primary" />
                            <Button v-if="contract?.data.status !== 'COMPLETED'" :isLoading="isSubmitting"
                                text="Update Offer" foreground="white" background="primary" type="submit" />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>