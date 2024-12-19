<template>
  <div class="bg-white">
    <div class="mx-auto max-w-7xl overflow-hidden px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div class="flex flex-col lg:flex-row">
        <div class="w-full lg:w-1/4 lg:pr-4">
          <h2 class="text-lg font-medium text-gray-900">Filter by</h2>
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700">Price Range</label>
            <div class="flex mt-1 space-x-2">
              <input type="number" id="min-price" name="min-price" min="0" class="w-1/2 ring-1 ring-gray-300 p-2" placeholder="Min" />
              <span class="self-center">-</span>
              <input type="number" id="max-price" name="max-price" min="0" class="w-1/2 ring-1 ring-gray-300 p-2" placeholder="Max" />
            </div>
          </div>
          
          <div class="mt-4">
            <h3 class="block text-sm font-medium text-gray-700">Category</h3>
            <div class="mt-2">
              <label class="block text-sm text-gray-700">
                <input type="radio" name="category" value="all" class="mr-2" /> All
              </label>
              <label class="block text-sm text-gray-700">
                <input type="radio" name="category" value="bags" class="mr-2" /> Bags
              </label>
              <label class="block text-sm text-gray-700">
                <input type="radio" name="category" value="accessories" class="mr-2" /> Accessories
              </label>
              <label class="block text-sm text-gray-700">
                <input type="radio" name="category" value="clothing" class="mr-2" /> Clothing
              </label>
            </div>
          </div>
        </div>
        <div class="w-full lg:w-3/4 mt-8 lg:mt-0">
          <ProductList :products="products" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

interface Product {
  id: number;
  name: string;
  href: string;
  price: string;
  availability: string;
  imageSrc: string;
  imageAlt: string;
}

const products: Product[] = [
  {
    id: 1,
    name: 'Nomad Pouch',
    href: '#',
    price: '$50',
    availability: 'White and Black',
    imageSrc: 'https://tailwindui.com/plus/img/ecommerce-images/category-page-07-product-01.jpg',
    imageAlt: 'White fabric pouch with white zipper, black zipper pull, and black elastic loop.',
  },
  {
    id: 2,
    name: 'Zip Tote Basket',
    href: '#',
    price: '$140',
    availability: 'Washed Black',
    imageSrc: 'https://tailwindui.com/plus/img/ecommerce-images/category-page-07-product-02.jpg',
    imageAlt: 'Front of tote bag with washed black canvas body, black straps, and tan leather handles and accents.',
  },
  {
    id: 3,
    name: 'Medium Stuff Satchel',
    href: '#',
    price: '$220',
    availability: 'Blue',
    imageSrc: 'https://tailwindui.com/plus/img/ecommerce-images/category-page-07-product-03.jpg',
    imageAlt:
      'Front of satchel with blue canvas body, black straps and handle, drawstring top, and front zipper pouch.',
  },
  {
    id: 4,
    name: 'Leather Wallet',
    href: '#',
    price: '$75',
    availability: 'Brown',
    imageSrc: 'https://tailwindui.com/plus/img/ecommerce-images/category-page-07-product-04.jpg',
    imageAlt: 'Brown leather wallet with multiple card slots and a cash compartment.',
  },
  {
    id: 5,
    name: 'Canvas Backpack',
    href: '#',
    price: '$180',
    availability: 'Green',
    imageSrc: 'https://tailwindui.com/plus/img/ecommerce-images/category-page-07-product-05.jpg',
    imageAlt: 'Green canvas backpack with padded straps and multiple compartments.',
  },
  {
    id: 6,
    name: 'Travel Duffel',
    href: '#',
    price: '$250',
    availability: 'Black',
    imageSrc: 'https://tailwindui.com/plus/img/ecommerce-images/category-page-07-product-06.jpg',
    imageAlt: 'Black travel duffel bag with shoulder strap and side pockets.',
  },
  {
    id: 7,
    name: 'Wool Scarf',
    href: '#',
    price: '$45',
    availability: 'Gray',
    imageSrc: 'https://tailwindui.com/plus/img/ecommerce-images/category-page-07-product-07.jpg',
    imageAlt: 'Gray wool scarf with fringe ends.',
  },
  {
    id: 8,
    name: 'Leather Belt',
    href: '#',
    price: '$60',
    availability: 'Tan',
    imageSrc: 'https://tailwindui.com/plus/img/ecommerce-images/category-page-07-product-08.jpg',
    imageAlt: 'Tan leather belt with silver buckle.',
  },
 
]
</script>