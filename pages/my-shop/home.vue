<template>
  <div class="bg-white">
    <div class="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
      <h1 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        My Shop
      </h1>
      <div class="mt-12">
        <Tab :tabs="tabs">
          <div class="bg-white shadow sm:rounded-lg">
            <div class="px-4 py-5 sm:px-6">
              <!-- Statistics Section -->
              <div class="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
                <div v-for="stat in statistics" :key="stat.name"
                  class="flex flex-col items-center justify-center border p-4 rounded-lg shadow">
                  <p class="text-sm font-medium text-gray-500">{{ stat.name }}</p>
                  <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
                </div>
              </div>
            </div>
          </div>
        </Tab>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const tabs = [
  { name: "Home", href: "/my-shop/home", current: true },
  { name: "Products", href: "/my-shop/products", current: false },
  {
    name: "Orders",
    href: "/my-shop/orders",
    current: false,
  },
];

const statistics = [
  { name: "Active Products", value: "XX" },
  { name: "Total Orders", value: "XX" },
  { name: "Total Sales", value: "XX" },
  { name: "Statistics 4", value: "XX" },
  { name: "Statistics 5", value: "XX" },
];
</script>