<template>
  <div class="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
    <a v-for="product in products" :key="product.id" :href="product.href" class="group text-sm" @click="viewProduct(product.id)">
      <img :src="product.imageSrc" :alt="product.imageAlt" class="aspect-square w-full rounded-lg bg-gray-100 object-cover group-hover:opacity-75" />
      <h3 class="mt-4 font-medium text-gray-900">{{ product.name }}</h3>
      <p class="italic text-gray-500">{{ product.availability }}</p>
      <p class="mt-2 font-medium text-gray-900">{{ product.price }}</p>
    </a>
  </div>
</template>

<script setup lang="ts">

const router = useRouter()
const viewProduct = (id: number) => {
  router.push(`/products/${id}`)
}

interface Product {
  id: number;
  name: string;
  href: string;
  price: string;
  availability: string;
  imageSrc: string;
  imageAlt: string;
}

const props = defineProps<{
  products: Product[]
}>()
</script>
