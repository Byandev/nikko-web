<template>
  <div class="bg-white">
    <div
      class="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8"
    >
      <div class="flex items-end gap-5">
        <h1 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Order Details:
        </h1>
        <span class="text-2xl text-gray-500">#{{ route.params.orderId }}</span>
      </div>
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
                        @click="removeFromCart(product)"
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
        </section>

        <!-- Order summary -->
        <section
          aria-labelledby="summary-heading"
          class="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
        >
          <h2 id="summary-heading" class="text-lg font-medium text-gray-900">
            Order summary
          </h2>

          <dl class="mt-6 space-y-4">
            <div class="flex items-center justify-between">
              <dt class="text-sm text-gray-600">Subtotal</dt>
              <dd class="text-sm font-medium text-gray-900">${{ subtotal }}</dd>
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
                ${{ subtotal + 9.99 }}
              </dd>
            </div>
          </dl>

          <!-- Payment method -->
          <div class="mt-6">
            <h3 class="text-lg font-medium text-gray-900">Payment Method</h3>
            <div class="mt-2 p-4 border border-gray-200 rounded-md bg-white">
              <p class="font-medium text-gray-700">Mastercard</p>
              <p class="mt-1 text-gray-500">
                {{ _.replace(paymentMethod.card_number, /^(\d{3})/, "***") }}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronDownIcon, ShoppingCartIcon } from "@heroicons/vue/16/solid";
import { QuestionMarkCircleIcon, XMarkIcon } from "@heroicons/vue/20/solid";
import { useCartStore } from "~/store/cartStore";
import { usePaymentMethodStore } from "~/store/paymentMethodStore";
import _ from "lodash";

const { cart, subtotal } = storeToRefs(useCartStore());
const { removeFromCart, appendToCart } = useCartStore();
const router = useRouter();
const route = useRoute();

const checkoutOrder = () => {
  router.push("/check-out");
};

// Add paymentMethod to the component's state
const { paymentMethod } = storeToRefs(usePaymentMethodStore());
</script>
