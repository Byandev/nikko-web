import { type PaginatedList, initialPaginatedList } from "~/types/models/Pagination";
import type { Project } from "~/types/models/Project";
import { accountStore } from "~/store/accountStore";

export function useJobs() {
    const { account } = storeToRefs(accountStore());
    const jobs = ref<PaginatedList<Project>>(initialPaginatedList);
    const isJobsLoading = ref(false);
    const { $api } = useNuxtApp();

    const fetchJobs = async (page = 1) => {
        try {
            isJobsLoading.value = true;
            const response = await $api(`v1/client/projects?page=${page}`, {
                method: 'GET',
                headers: account?.value?.id ? {
                    'X-ACCOUNT-ID': account.value.id.toString(),
                } : undefined,
            });
            jobs.value = response as PaginatedList<Project>;
            console.log("Fetched jobs:", jobs.value);
        } catch (error) {
            console.error("Error fetching cards data:", error);
        } finally {
            isJobsLoading.value = false;
        }
    };

    const fetchJob = async (id: number) => {
        try {
            isJobsLoading.value = true;
            const response = await $api(`v1/client/projects/${id}`, {
                method: 'GET',
                headers: account?.value?.id ? {
                    'X-ACCOUNT-ID': account.value.id.toString(),
                } : undefined,
            });
            return response as Project;
        } catch (error) {
            console.error("Error fetching card data:", error);
        } finally {
            isJobsLoading.value = false;
        }
    };

    return {
        jobs,
        isJobsLoading,
        fetchJobs,
        fetchJob,
    };
}