<script lang="ts" setup>
import { email, minLength, required, sameAs } from "@vuelidate/validators";
import { useSubmit } from "~/composables/useSubmit";
import type { AuthenticationResponse } from "~/types/api/response/auth";
import type { ApiErrorResponse } from "~/types/api/response/error";
import { Icon } from '@iconify/vue';
import { AccountType } from '~/types/models/Account';

const router = useRouter();
const route = useRoute();
const { getSession } = useAuth()
const { setToken } = useAuthState()

const { sendRequest: signUp } = useSubmit<AuthenticationResponse, ApiErrorResponse>()

interface RegisterForm {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirmation: string;
  account_type: AccountType;
  accept_policy: boolean;
}

const RegisterForm = ref<RegisterForm>({
  email: '',
  first_name: '',
  last_name: '',
  password: '',
  password_confirmation: '',
  account_type: AccountType.FREELANCER,
  accept_policy: false,
});

const RegisterRules = {
  first_name: { required },
  last_name: { required },
  email: { required, email },
  password: { required, minLength: minLength(6) },
  password_confirmation: { required, sameAsRef: sameAs(computed(() => RegisterForm.value.password)) },
  account_type: { required },
  accept_policy: { required },
};

const { formRef, v$ } = useValidation(RegisterForm, RegisterRules);

const isLoading = ref(false);

const submitForm = async () => {

  v$.value.$touch();
  if (v$.value.$invalid) return;

  try {
    isLoading.value = true;
    const response = await signUp('/v1/auth/register', {
      method: 'POST',
      body: {
        email: RegisterForm.value.email,
        first_name: RegisterForm.value.first_name,
        last_name: RegisterForm.value.last_name,
        password: RegisterForm.value.password,
        password_confirmation: RegisterForm.value.password_confirmation,
        account_type: RegisterForm.value.account_type,
      },
    });

    setToken(response?.access_token as string)

    await getSession()

    await router.push("/email-verification");
  } catch (error) {
    console.error(error as ApiErrorResponse)
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="flex items-center justify-center p-4 sm:p-10">
    <div class="flex flex-1 flex-col justify-center lg:flex-none">
      <div class="mx-auto w-full h-full lg:h-[700px] max-w-4xl bg-white rounded-2xl border-2 border-gray-200">
        <div class="flex flex-col lg:flex-row h-full">
          <!-- Left Image Section -->
          <Transition name="slide-fade">
            <div class="relative hidden lg:flex items-center justify-center w-full mb-4 lg:mb-0 h-full ">
              <img
                src="https://img.freepik.com/free-vector/abstract-paper-style-background_23-2150744372.jpg?t=st=1728313230~exp=1728316830~hmac=316229e5374994fe112e4883f479fc29b623d4a231fb6305c6534814b7f3e76e&w=996"
                alt="Side Image" class="w-full h-full object-cover rounded-tl-2xl rounded-bl-2xl bg-primary">
              <div class="absolute text-center text-white px-4">
                <h3 class="text-xl font-bold leading-9 tracking-tight mb-3"> Already signed up?</h3>
                <p class="mb-5">
                  Login to your account so you can continue <br> building and editing your onboarding flows.
                </p>
                <NuxtLink to="/login" class=" text-white font-bold py-3 px-14 rounded-2xl border-2">
                  LOG IN
                </NuxtLink>
              </div>
            </div>
          </Transition>

          <!-- Right Form Section -->
          <Transition name="slide-fade">
            <div class="flex flex-col px-4 py-7 sm:px-10 justify-center w-full lg:w-5/6 h-full">
              <!-- Tabs Navigation for Mobile -->
              <div class="block lg:hidden mb-4">
                <div class="flex justify-around border-b border-gray-200">
                  <NuxtLink to="/login" :class="{
                    'border-b-2 border-primary text-primary': route.path === '/login',
                    'py-2 px-4 text-sm font-medium text-gray-700 focus:outline-none focus:border-indigo-500': true
                  }">
                    Login
                  </NuxtLink>
                  <NuxtLink to="/register" :class="{
                    'border-b-2 border-primary text-primary': route.path === '/register',
                    'py-2 px-4 text-sm font-medium text-gray-700 focus:outline-none focus:border-indigo-500': true
                  }">
                    Sign Up
                  </NuxtLink>
                </div>
              </div>

              <div class="mx-auto w-full max-w-sm lg:w-96">
                <div>
                  <h2 class="text-2xl font-bold leading-9 tracking-tight text-gray-900">Create an account</h2>
                </div>

                <div class="mt-8">
                  <div>
                    <form class="space-y-6" method="POST" @submit.prevent="submitForm">
                      <div>
                        <label class="block text-sm font-medium leading-6 text-gray-900" for="account_type">Choose
                          Type</label>
                        <div class="mt-2">
                          <select id="account_type" v-model="formRef.account_type"
                            :class="{ 'ring-red-300': v$.account_type.$error, 'ring-gray-300': !v$.account_type.$error }"
                            class="block w-full rounded-md border-0 py-1.5 px-2 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                            <option v-for="(account, index) in AccountType" :key="index" :value="account">I am a {{
                              useCapitalize(account) }}</option>
                          </select>
                          <span v-if="v$.account_type.$error" class="text-red-900 text-sm">{{
                            v$.account_type.$errors[0].$message }}</span>
                        </div>
                      </div>

                      <div class="flex flex-col sm:flex-row gap-5">
                        <div>
                          <label class="block text-sm font-medium leading-6 text-gray-900" for="first_name">First
                            Name</label>
                          <div class="mt-2">
                            <div
                              class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                              <Icon icon="mdi:user" :ssr="true" />
                              <input id="first_name" v-model="formRef.first_name"
                                :class="{ 'ring-red-300': v$.first_name.$error, 'ring-gray-300': !v$.first_name.$error }"
                                class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none ring-0"
                                type="text">
                            </div>
                            <span v-if="v$.first_name.$error" class="text-red-900 text-sm">{{
                              v$.first_name.$errors[0].$message }}</span>
                          </div>
                        </div>

                        <div>
                          <label class="block text-sm font-medium leading-6 text-gray-900" for="last_name">Last
                            Name</label>
                          <div class="mt-2">
                            <div
                              class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                              <Icon icon="mdi:user" :ssr="true" />
                              <input id="last_name" v-model="formRef.last_name"
                                :class="{ 'ring-red-300': v$.last_name.$error, 'ring-gray-300': !v$.last_name.$error }"
                                class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none"
                                type="text">
                            </div>
                            <span v-if="v$.last_name.$error" class="text-red-900 text-sm">{{
                              v$.last_name.$errors[0].$message }}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label class="block text-sm font-medium leading-6 text-gray-900" for="email">Email</label>
                        <div class="mt-2">
                          <div
                            class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                            <Icon icon="mdi:email" :ssr="true" />
                            <input id="email" v-model="formRef.email" autocomplete="email"
                              :class="{ 'ring-red-300': v$.email.$error, 'ring-gray-300': !v$.email.$error }"
                              class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none"
                              type="email">
                          </div>
                          <span v-if="v$.email.$error" class="text-red-900 text-sm">{{ v$.email.$errors[0].$message
                            }}</span>
                        </div>
                      </div>

                      <div>
                        <label class="block text-sm font-medium leading-6 text-gray-900" for="password">New
                          Password</label>
                        <div class="mt-2">
                          <div
                            class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                            <Icon icon="mdi:lock" :ssr="true" />
                            <input id="password" v-model="formRef.password" autocomplete="current-password"
                              :class="{ 'ring-red-300': v$.password.$error, 'ring-gray-300': !v$.password.$error }"
                              class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none"
                              type="password">
                          </div>
                          <span v-if="v$.password.$error" class="text-red-900 text-sm">{{
                            v$.password.$errors[0].$message }}</span>
                        </div>
                      </div>

                      <div>
                        <label class="block text-sm font-medium leading-6 text-gray-900"
                          for="password_confirmation">Confirm Password</label>
                        <div class="mt-2">
                          <div
                            class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                            <Icon icon="mdi:lock-check" :ssr="true" />
                            <input id="password_confirmation" v-model="formRef.password_confirmation" autocomplete="new-password"
                              :class="{ 'ring-red-300': v$.password_confirmation.$error, 'ring-gray-300': !v$.password_confirmation.$error }"
                              class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none"
                              type="password">
                          </div>
                          <span v-if="v$.password_confirmation.$error" class="text-red-900 text-sm">{{
                            v$.password_confirmation.$errors[0].$message }}</span>
                        </div>
                      </div>

                      <div>
                        <label class="flex items-center text-sm font-medium leading-6 text-gray-900"
                          for="accept_policy">
                          <input id="accept_policy" v-model="formRef.accept_policy" type="checkbox"
                            :class="{ 'ring-red-300': v$.accept_policy.$error, 'ring-gray-300': !v$.accept_policy.$error }"
                            class="mr-2 rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500">
                          I accept the policy and terms of service and Privacy Policy
                        </label>
                        <span v-if="v$.accept_policy.$error" class="text-red-900 text-sm">{{
                          v$.accept_policy.$errors[0].$message }}</span>
                      </div>

                      <div>
                        <Button text="Sign Up" background="primary" foreground="white" :is-loading="isLoading"
                          :is-wide="true" type="submit" />
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>