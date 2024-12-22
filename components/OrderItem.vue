<template>
  <div class="flex flex-col border border-gray-200 rounded-lg p-4">
    <!-- Order Header -->
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4"
    >
      <div class="mb-4 sm:mb-0">
        <p class="text-sm text-gray-500">Order number</p>
        <p class="text-lg font-medium text-gray-900">{{ order.id }}</p>
      </div>
      <div class="mb-4 sm:mb-0">
        <p class="text-sm text-gray-500">Date placed</p>
        <p class="text-lg font-medium text-gray-900">{{ order.date }}</p>
      </div>
      <div class="mb-4 sm:mb-0">
        <p class="text-sm text-gray-500">Total Amount</p>
        <p class="text-lg font-medium text-gray-900">
          ${{ calculateOrderTotal(order.items) }}
        </p>
      </div>
      <div class="flex space-x-4">
        <button
          class="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md"
        >
          View Order
        </button>
        <button
          class="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md"
        >
          View Invoice
        </button>
      </div>
    </div>
    <!-- Order Items -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div
        v-for="item in order.items"
        :key="item.id"
        class="flex items-center border border-gray-200 rounded-lg p-4"
      >
        <img
          :src="item.imageSrc"
          alt=""
          class="w-20 h-20 object-cover rounded-md"
        />
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-900">{{ item.name }}</p>
          <p class="text-sm text-gray-500">{{ item.variant }}</p>
          <p class="text-sm font-medium text-gray-900">${{ item.price }}</p>
          <p class="text-sm text-gray-500">Quantity: {{ item.quantity }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";

defineProps<{
  order: {
    id: string;
    date: string;
    items: Array<{
      id: number;
      name: string;
      variant: string | null;
      price: number;
      quantity: number;
      imageSrc: string;
    }>;
  };
  calculateOrderTotal: (
    items: Array<{ price: number; quantity: number }>
  ) => string;
}>();
</script>
