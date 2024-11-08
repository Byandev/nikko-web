import { type PaginatedList, initialPaginatedList } from "~/types/models/Pagination";
import type { Project } from "~/types/models/Project";
import { accountStore } from "~/store/accountStore";

export function useProject() {
    const { account } = storeToRefs(accountStore());
    const projects = ref<PaginatedList<Project>>(initialPaginatedList);
    const isProjectsLoading = ref(false);
    const { $api } = useNuxtApp();

    const fetchProjects = async (page = 1, path: string) => {
        try {
            isProjectsLoading.value = true;
            const response = await $api(`${path}?page=${page}`, {
                method: 'GET',
                headers: account?.value?.id ? {
                    'X-ACCOUNT-ID': account.value.id.toString(),
                } : undefined,
            });
            projects.value = response as PaginatedList<Project>;
        } catch (error) {
            console.error("Error fetching cards data:", error);
        } finally {
            isProjectsLoading.value = false;
        }
    };

    const fetchProject = async (id: number, path: string) => {
        try {
            isProjectsLoading.value = true;
            const response = await $api(`${path}/${id}`, {
                method: 'GET',
                headers: account?.value?.id ? {
                    'X-ACCOUNT-ID': account.value.id.toString(),
                } : undefined,
            });
            return response as Project;
        } catch (error) {
            console.error("Error fetching card data:", error);
        } finally {
            isProjectsLoading.value = false;
        }
    };

    return {
        projects,
        isProjectsLoading,
        fetchProjects,
        fetchProject,
    };
}