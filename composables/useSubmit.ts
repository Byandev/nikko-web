import type {NitroFetchOptions, NitroFetchRequest} from 'nitropack';

export function useSubmit<ResponseType, ErrorType = unknown>() {
    const pending = ref(false);
    const {$api} = useNuxtApp();

    async function sendRequest(
        request: NitroFetchRequest,
        opts?: NitroFetchOptions<NitroFetchRequest, 'patch' | 'post' | 'put' | 'delete'> | undefined
    ) {
        try {
            pending.value = true;
            return await $api<ResponseType>(request, opts)
        } catch (e) {
            throw e as ErrorType
        } finally {
            pending.value = false;
        }
    }

    return {
        pending,
        sendRequest,
    };
}
