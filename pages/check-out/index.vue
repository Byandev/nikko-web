<template>
  <div class="bg-white">
    <div
      class="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8"
    >
      <h1 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        Shopping Cart
      </h1>
      <div
        class="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16"
      >
        <section aria-labelledby="cart-heading" class="lg:col-span-7">
          <h2 id="cart-heading" class="sr-only">Items in your shopping cart</h2>

          <ul
            role="list"
            class="divide-y divide-gray-200 border-b border-t border-gray-200"
          >
            <li
              v-for="(product, productIdx) in cart"
              :key="product.id"
              class="flex py-6 sm:py-10"
            >
              <div class="shrink-0">
                <img
                  :src="product.imageSrc"
                  class="size-24 rounded-md object-cover sm:size-48"
                />
              </div>

              <div class="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                <div
                  class="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0"
                >
                  <div>
                    <div class="flex justify-between">
                      <h3 class="text-sm">
                        <span
                          class="font-medium text-gray-700 hover:text-gray-800"
                          >{{ product.name }}</span
                        >
                      </h3>
                    </div>
                    <div class="mt-1 flex text-sm">
                      <p v-if="product.variant" class="text-gray-500">
                        {{ product.variant }}
                      </p>
                    </div>
                    <p class="mt-1 text-sm font-medium text-gray-900">
                      ${{ product.price }}
                    </p>
                  </div>

                  <div class="mt-4 sm:mt-0 sm:pr-9">
                    <input
                      type="number"
                      id="quantity"
                      v-model="product.quantity"
                      min="1"
                      class="p-3 block w-20 rounded-md ring-1 ring-gray-300 shadow-sm sm:text-sm"
                    />

                    <div class="absolute right-0 top-0">
                      <button
                        type="button"
                        class="-m-2 inline-flex p-2 text-gray-400 hover:text-gray-500"
                        @click="cartStore.removeFromCart(product)"
                      >
                        <span class="sr-only">Remove</span>
                        <XMarkIcon class="size-5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>

          <!-- Order summary -->
          <section
            aria-labelledby="summary-heading"
            class="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
          >
            <h2 id="summary-heading" class="text-lg font-medium text-gray-900">
              Order summary
            </h2>

            <div class="mt-6 space-y-4">
              <div class="flex items-center justify-between">
                <dt class="text-sm text-gray-600">Subtotal</dt>
                <dd class="text-sm font-medium text-gray-900">
                  ${{ cartStore.subtotal }}
                </dd>
              </div>
              <div
                class="flex items-center justify-between border-t border-gray-200 pt-4"
              >
                <dt class="flex items-center text-sm text-gray-600">
                  <span>Fees</span>
                  <a
                    href="#"
                    class="ml-2 shrink-0 text-gray-400 hover:text-gray-500"
                  >
                    <span class="sr-only"
                      >Learn more about how shipping is calculated</span
                    >
                    <QuestionMarkCircleIcon class="size-5" aria-hidden="true" />
                  </a>
                </dt>
                <dd class="text-sm font-medium text-gray-900">$9.99</dd>
              </div>
              <div
                class="flex items-center justify-between border-t border-gray-200 pt-4"
              >
                <dt class="text-base font-medium text-gray-900">Order total</dt>
                <dd class="text-base font-medium text-gray-900">
                  ${{ cartStore.subtotal + 9.99 }}
                </dd>
              </div>
            </div>
          </section>
        </section>

        <!-- Payment form -->
        <section
          aria-labelledby="summary-heading"
          class="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
        >
          <h2 id="summary-heading" class="text-lg font-medium text-gray-900">
            Payment
          </h2>

          <form class="mt-6 space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700"
                >Email Address</label
              >
              <input
                type="email"
                id="email"
                name="email"
                v-model="paymentMethodInput.email"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-2"
                required
              />
            </div>
            <div>
              <label
                for="name-on-card"
                class="block text-sm font-medium text-gray-700"
                >Name on the Card</label
              >
              <input
                type="text"
                id="name-on-card"
                name="name-on-card"
                v-model="paymentMethodInput.name"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-2"
                required
              />
            </div>
            <div>
              <label
                for="card-number"
                class="block text-sm font-medium text-gray-700"
                >Card Number</label
              >
              <input
                type="text"
                id="card-number"
                name="card-number"
                v-model="paymentMethodInput.card_number"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-2"
                required
              />
            </div>
            <div class="flex gap-5">
              <div>
                <label
                  for="expiration-date"
                  class="block text-sm font-medium text-gray-700"
                  >Expiration Date</label
                >
                <input
                  type="text"
                  id="expiration-date"
                  name="expiration-date"
                  v-model="paymentMethodInput.expiration_date"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-2"
                  required
                />
              </div>
              <div>
                <label
                  for="expiration-date"
                  class="block text-sm font-medium text-gray-700"
                  >CVC</label
                >
                <input
                  type="text"
                  id="cvc"
                  name="cvc"
                  v-model="paymentMethodInput.cvc"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-2"
                  required
                />
              </div>
            </div>

            <div class="mt-6">
              <button
                type="submit"
                class="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 flex items-center justify-center"
              >
                Confirm Payment
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronDownIcon } from "@heroicons/vue/16/solid";
import { QuestionMarkCircleIcon, XMarkIcon } from "@heroicons/vue/20/solid";
import { useCartStore } from "~/store/cartStore";

const paymentMethodInput = ref({
  email: "",
  name: "",
  card_number: "",
  expiration_date: "",
  cvc: "",
});

const { paymentMethod } = storeToRefs(usePaymentMethodStore());
const cartStore = useCartStore();
const { cart } = storeToRefs(cartStore);

const confirmPayment = () => {
  paymentMethod.value = paymentMethodInput.value;
  console.log("Payment confirmed", paymentMethod.value);
};
</script>
