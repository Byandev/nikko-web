import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global  {
    interface Window {
        Pusher: typeof Pusher;
        Echo: Echo<'reverb'>
    }
}

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()

    window.Pusher = Pusher;

    const echo = new Echo<"reverb">({
        broadcaster: 'reverb',
        key: config.public.REVERB_APP_KEY,
        wsHost: config.public.REVERB_HOST,
        wsPort: config.public.REVERB_PORT,
        wssPort: config.public.REVERB_PORT,
        forceTLS: (config.public.REVERB_SCHEME ?? 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
    })

    window.Echo = echo;

    return {
        provide: { echo }
    }
})
