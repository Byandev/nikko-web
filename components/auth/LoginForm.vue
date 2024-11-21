<script lang="ts" setup>
import { email, required, helpers } from "@vuelidate/validators";
import { useSubmit } from "~/composables/useSubmit";
import type { AuthenticationResponse } from "~/types/api/response/auth";
import type { ApiErrorResponse } from "~/types/api/response/error";
import { Icon } from "@iconify/vue";
import { accountStore } from "~/store/accountStore";

const router = useRouter();
const route = useRoute();
const { getSession } = useAuth();
const { setToken } = useAuthState();
const { account } = storeToRefs(accountStore());

const form = ref<{ email: string; password: string; remember_me: boolean }>({
  email: "",
  password: "",
  remember_me: false,
});

const rules = computed(() => ({
  email: {
    required: helpers.withMessage("Email is required", required),
    email,
  },
  password: {
    required: helpers.withMessage("Password is required", required),
  },
}));

const { v$, $externalResults } = useValidation(form, rules);

const { sendRequest: logIn, pending: isLoading } = useSubmit<
  AuthenticationResponse,
  ApiErrorResponse
>();

const submitForm = async () => {
  v$.value.$touch();
  if (v$.value.$invalid) return;

  try {
    const response = await logIn("/v1/auth/login", {
      method: "POST",
      body: {
        email: form.value.email,
        password: form.value.password,
      },
    });

    account.value = response.user.accounts[0];
    setToken(response?.access_token as string);

    await getSession();

    if (account.value.type === "FREELANCER") {
      await router.push("/find-work");
    } else if (account.value.type === "CLIENT") {
      await router.push("/find-freelancer");
    }
  } catch (error) {
    $externalResults.value = (error as ApiErrorResponse)?.data?.errors || {};
  }
};
</script>

<template>
  <div class="flex items-center justify-center p-4 sm:p-10">
    <div class="flex flex-1 flex-col justify-center lg:flex-none">
      <div class="mx-auto w-full h-full lg:h-[700px] max-w-4xl bg-white rounded-2xl border-2 border-gray-200">
        <div class="flex flex-col lg:flex-row-reverse h-full">
          <!-- Left Image Section -->
          <Transition name="slide-fade" appear>
            <div class="relative hidden lg:flex items-center justify-center w-full mb-4 lg:mb-0 h-full">
              <img
                src="https://img.freepik.com/free-vector/abstract-paper-style-background_23-2150744372.jpg?t=st=1728313230~exp=1728316830~hmac=316229e5374994fe112e4883f479fc29b623d4a231fb6305c6534814b7f3e76e&w=996"
                alt="Side Image" class="w-full h-full object-cover rounded-tr-2xl rounded-br-2xl bg-primary" />
              <div class="absolute text-center text-white px-4">
                <h3 class="text-xl font-bold leading-9 tracking-tight mb-3">
                  Don’t Have an Account yet?
                </h3>
                <p class="mb-5">
                  Let’s get you all set up so you can start creating your first onboarding experience.
                </p>
                <NuxtLink to="/register" class="text-white font-bold py-3 px-14 rounded-2xl border-2">
                  SIGN UP
                </NuxtLink>
              </div>
            </div>
          </Transition>

          <!-- Right Form Section -->
          <Transition name="slide-fade" appear>
            <div class="flex flex-col px-4 py-7 sm:px-10 justify-center w-full lg:w-5/6 h-full">
              <div class="mx-auto w-full max-w-sm lg:w-96">
                <h2 class="text-2xl font-bold leading-9 tracking-tight text-gray-900">
                  Log in to Your Account
                </h2>

                <div class="mt-8">
                  <form class="space-y-6" method="POST" @submit.prevent="submitForm">
                    <div>
                      <label class="block text-sm font-medium leading-6 text-gray-900" for="email">
                        Email
                      </label>
                      <div class="mt-2">
                        <div
                          class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                          <Icon icon="mdi:email" />
                          <input id="email" v-model="form.email" autocomplete="email"
                            class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none"
                            :class="{ 'ring-red-300': v$.email.$error }" type="email" />
                        </div>
                        <span v-if="v$.email.$error" class="text-red-900 text-sm">
                          {{ v$.email.$errors[0].$message }}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm font-medium leading-6 text-gray-900" for="password">
                        Password
                      </label>
                      <div class="mt-2">
                        <div
                          class="flex flex-row items-center px-2 rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                          <Icon icon="mdi:lock" />
                          <input id="password" v-model="form.password" autocomplete="current-password"
                            class="block w-full px-2 placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none"
                            :class="{ 'ring-red-300': v$.password.$error }" type="password" />
                        </div>
                        <span v-if="v$.password.$error" class="text-red-900 text-sm">
                          {{ v$.password.$errors[0].$message }}
                        </span>
                      </div>
                    </div>

                    <div class="flex flex-row justify-between">
                      <label class="flex items-center text-sm font-medium leading-6 text-gray-900">
                        <input id="remember_me" v-model="form.remember_me" type="checkbox"
                          class="mr-2 rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500" />
                        Remember me
                      </label>
                      <NuxtLink to="/forgot-password" class="text-primary text-sm font-medium">
                        Forgot your password?
                      </NuxtLink>
                    </div>

                    <div>
                      <Button text="Log In" background="primary" foreground="white" :is-loading="isLoading"
                        :is-wide="true" type="submit" />
                    </div>
                  </form>
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
