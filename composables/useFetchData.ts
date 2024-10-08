import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack';

export function useFetchData<ResponseType, ErrorType = unknown>() {
    const pending = ref(false);
    const data = ref<ResponseType | null>(null);
    const error = ref<ErrorType | null>(null);
    const { $api } = useNuxtApp();

    async function fetchData(
        request: NitroFetchRequest,
        opts?: NitroFetchOptions<NitroFetchRequest, 'get'> | undefined
    ) {
        try {
            pending.value = true;
            data.value = await $api<ResponseType>(request, opts);
        } catch (e) {
            error.value = e as ErrorType;
        } finally {
            pending.value = false;
        }
    }

    return {
        pending,
        data,
        error,
        fetchData,
    };
}