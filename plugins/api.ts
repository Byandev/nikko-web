export default defineNuxtPlugin(() => {
    const requestHeaders: HeadersInit = new Headers();
    requestHeaders.set('Content-Type', 'application/json');

    const $api = $fetch.create({
        baseURL: useRuntimeConfig().public["apiURL"],
        headers: {
            Accept: 'application/json',
        },
        onRequest({options}) {
            const accessToken = useCookie('auth:token');

            if (accessToken.value) {
                options.headers = new Headers(options.headers || {});
                options.headers.set('Authorization', `Bearer ${accessToken.value}`);
            }
        },
        async onResponseError({response}) {
            console.log(response._data.message)
        },
    });

    return {
        provide: {
            api: $api,
        },
    };
});
