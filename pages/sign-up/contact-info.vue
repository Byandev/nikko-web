<script setup lang="ts">
import { Icon } from '@iconify/vue/dist/iconify.js';
import { authStore } from '~/store/authStore';
import type { ApiErrorResponse } from '~/types/api/response/error';
import type { Media as MediaResponse } from '~/types/models/Media';
import { ref } from 'vue';

const defaultAvatar = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
const router = useRouter();

const { user } = storeToRefs(authStore());

const { updateUser } = authStore();

const avatarUrl = ref<string | undefined>(user.value.avatar.original_url ?? defaultAvatar);

const { sendRequest: sendRequest } = useSubmit<{ data: MediaResponse }, ApiErrorResponse>();

const contactInfo = ref({
    streetAddress: '',
    city: '',
    stateCode: '',
    countryCode: '',
    postal: '',
    phoneNumber: ''
});

async function previewAvatar(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
        avatarUrl.value = URL.createObjectURL(file);
    }

    const formData = new FormData();
    formData.append('file', file);

    // Upload image and Get the ID
    const UploadImageResponse = await sendRequest('/v1/medias', {
        method: 'POST',
        body: formData,
    });

    await sendRequest(`/v1/auth/profile`, {
        method: 'PUT',
        body: JSON.stringify({
            avatar: UploadImageResponse.data.id,
        }),
    });

    await updateUser();

    avatarUrl.value = UploadImageResponse.data.original_url;
}

const handleSubmit = async () => {

    const response = await sendRequest(`/v1/auth/profile`, {
        method: 'PUT',
        body: JSON.stringify({
            street_address: contactInfo.value.streetAddress,
            city: contactInfo.value.city,
            state_code: contactInfo.value.stateCode,
            country_code: contactInfo.value.countryCode,
            postal: contactInfo.value.postal,
            phone_number: contactInfo.value.phoneNumber,
        }),
    });
    
    console.log('Contact info updated:', response);

    if (user.value.accounts[0].type === 'CLIENT') {
        return router.push('/client-dashboard');
    } else {
        return router.push('/sign-up/add-details');
    }
};
</script>

<template>
    <div class="my-10 max-w-2xl lg:mx-auto bg-white border border-gray-300 rounded-lg py-10 px-4 sm:px-16 mx-5">
        <div class="text-center">
            <h1 class="text-2xl font-bold mb-4">Provide your contact details below</h1>
            <p class="text-gray-600 mb-6">Your contact information is kept confidential and is solely used for billing
                purposes to ensure you get paid promptly.</p>
        </div>

        <form @submit.prevent="handleSubmit">
            <!-- Avatar -->
            <div class="mt-4 flex flex-col items-center justify-center">
                <div class="mt-4">
                    <img :src="avatarUrl" alt="Avatar Preview"
                        class="h-32 w-32 rounded-full object-cover border-2 border-gray-300">
                </div>
                <label for="avatar" class="block text-sm font-medium text-gray-700 mt-4">Upload Avatar</label>
                <div class="flex justify-center">
                    <input type="file" id="avatar" @change="previewAvatar"
                        class="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
                </div>
            </div>

            <!-- Street Address -->
            <div class="mt-4">
                <label for="street-address" class="block text-sm font-medium leading-6 text-gray-900">
                    Street Address <span class="text-red-500">*</span>
                </label>
                <div class="mt-2">
                    <div
                        class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                        <Icon icon="mdi:home" :ssr="true" />
                        <input type="text" id="street-address" name="street-address" v-model="contactInfo.streetAddress" required
                            class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                    </div>
                </div>
            </div>

            <div class="flex flex-col sm:flex-row gap-5 mt-4">
                <!-- Country -->
                <div class="w-full sm:w-1/2">
                    <label for="country" class="block text-sm font-medium leading-6 text-gray-900">
                        Country Code <span class="text-red-500">*</span></label>
                    <div class="mt-2">
                        <div
                            class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                            <Icon icon="mdi:earth" :ssr="true" />
                            <input type="text" id="country" name="country" v-model="contactInfo.countryCode" required
                                class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                        </div>
                    </div>
                </div>

                <!-- City -->
                <div class="w-full sm:w-1/2">
                    <label for="city" class="block text-sm font-medium leading-6 text-gray-900">
                        City <span class="text-red-500">*</span></label>
                    <div class="mt-2">
                        <div
                            class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                            <Icon icon="mdi:city" :ssr="true" />
                            <input type="text" id="city" name="city" v-model="contactInfo.city" required
                                class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex flex-col sm:flex-row gap-5 mt-4">
                <!-- Postal Code -->
                <div class="w-full sm:w-1/2">
                    <label for="postal-code" class="block text-sm font-medium leading-6 text-gray-900">Postal
                        Code</label>
                    <div class="mt-2">
                        <div
                            class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                            <Icon icon="mdi:mailbox" :ssr="true" />
                            <input type="text" id="postal-code" name="postal-code" v-model="contactInfo.postal" required
                                class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                        </div>
                    </div>
                </div>

                <!-- State Code -->
                <div class="w-full sm:w-1/2">
                    <label for="state-code" class="block text-sm font-medium leading-6 text-gray-900">
                        State Code <span class="text-red-500">*</span></label>
                    <div class="mt-2">
                        <div
                            class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                            <Icon icon="mdi:map-marker" :ssr="true" />
                            <input type="text" id="state-code" name="state-code" v-model="contactInfo.stateCode" required
                                class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                        </div>
                    </div>
                </div>
            </div>

            <!-- Phone Number -->
            <div class="w-full mt-4">
                    <label for="phone-number" class="block text-sm font-medium leading-6 text-gray-900">Phone
                        Number</label>
                    <div class="mt-2">
                        <div
                            class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                            <Icon icon="mdi:phone" :ssr="true" />
                            <input type="text" id="phone-number" name="phone-number" v-model="contactInfo.phoneNumber" required
                                class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0">
                        </div>
                    </div>
                </div>
            <span class="block text-sm font-medium leading-6 text-gray-700 mt-2">
                Please provide your phone number for updates regarding your profile.
            </span>

            <Button type="submit" :isWide="true" text="Next" background="primary" foreground="white"
                class="mt-8"></Button>

        </form>
    </div>
</template>