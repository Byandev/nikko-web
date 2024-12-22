<template>
  <div class="bg-white">
    <div
      class="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8"
    >
      <h1 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        Order History
      </h1>
      <div class="mt-12">
        <ul role="list" class="divide-y divide-gray-200">
          <li v-for="order in orderHistory" :key="order.id" class="py-6">
            <OrderItem
              :order="order"
              :calculateOrderTotal="calculateOrderTotal"
            />
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import OrderItem from "@/components/OrderItem.vue";

const orderHistory = ref([
  {
    id: "123456",
    date: "December 2, 2024",
    items: [
      {
        id: 1,
        name: "Product A",
        variant: null,
        price: 102.25,
        quantity: 1,
        imageSrc: "https://via.placeholder.com/100",
      },
      {
        id: 2,
        name: "Product B",
        variant: null,
        price: 150.0,
        quantity: 2,
        imageSrc: "https://via.placeholder.com/100",
      },
    ],
  },
  {
    id: "789012",
    date: "January 15, 2025",
    items: [
      {
        id: 3,
        name: "Product C",
        variant: "Large",
        price: 75.0,
        quantity: 1,
        imageSrc: "https://via.placeholder.com/100",
      },
      {
        id: 4,
        name: "Product D",
        variant: "Medium",
        price: 200.0,
        quantity: 1,
        imageSrc: "https://via.placeholder.com/100",
      },
    ],
  },
  {
    id: "345678",
    date: "February 20, 2025",
    items: [
      {
        id: 5,
        name: "Product E",
        variant: "Small",
        price: 50.0,
        quantity: 3,
        imageSrc: "https://via.placeholder.com/100",
      },
      {
        id: 6,
        name: "Product F",
        variant: "Extra Large",
        price: 300.0,
        quantity: 1,
        imageSrc: "https://via.placeholder.com/100",
      },
    ],
  },
]);

const calculateOrderTotal = (items: any) => {
  return items
    .reduce(
      (total: number, item: { price: number; quantity: number }) =>
        total + item.price * item.quantity,
      0
    )
    .toFixed(2);
};
</script>
