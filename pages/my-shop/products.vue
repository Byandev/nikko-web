<template>
    <Modal :modelValue="isModalOpen" @update:modelValue="isModalOpen = $event">
        <template #title>Create New Product</template>
        <template #content>
            <form @submit.prevent="createProduct" class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
                <div class="md:col-span-2">
                    <div class="mb-4">
                        <label for="sku" class="block text-sm font-medium text-gray-700">SKU</label>
                        <input v-model="newProduct.sku" type="text" id="sku"
                            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 ring-1 ring-gray-300"
                            required>
                    </div>
                    <div class="mb-4">
                        <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
                        <input v-model="newProduct.title" type="text" id="title"
                            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 ring-1 ring-gray-300"
                            required>
                    </div>

                </div>
                <div class="mb-4 md:col-span-2">
                    <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                    <textarea v-model="newProduct.description" id="description"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 ring-1 ring-gray-300"
                        required></textarea>
                </div>
                <div class="mb-4">
                    <label for="inventory" class="block text-sm font-medium text-gray-700">Inventory</label>
                    <input v-model="newProduct.inventory" type="number" id="inventory"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 ring-1 ring-gray-300"
                        required>
                </div>
                <div class="mb-4">
                    <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
                    <select v-model="newProduct.status" id="status"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 ring-1 ring-gray-300"
                        required>
                        <option value="Pending">Pending</option>
                        <option value="In Stock">In Stock</option>
                        <option value="Active">Active</option>
                        <option value="Out of Stock">Out of Stock</option>
                    </select>
                </div>
            </form>
        </template>
        <template #actions>
            <div class="flex justify-end space-x-2">
                <Button type="button" text="Cancel" background="white" foreground="primary" :is-wide="false"
                    @click="isModalOpen = false" />
                <Button type="button" text="Create" background="primary" foreground="white" :is-wide="false"
                    @click="isModalOpen = false" />
            </div>
        </template>
    </Modal>

    <div class="bg-white">
        <div class="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
            <h1 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                My Shop
            </h1>
            <div class="mt-12">
                <Tab :tabs="tabs">
                    <div class="bg-white shadow sm:rounded-lg">
                        <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
                            <div class="flex justify-end w-full">
                                <Button text="Create new" type="button" background="primary" foreground="white"
                                    @click="isModalOpen = true" />
                            </div>
                        </div>
                        <div class="overflow-x-auto">
                            <Table :columns="columns" :rows="rows">
                                <template #default="{ row }">
                                    <td class="whitespace-nowrap py-4 px-3 text-sm font-medium text-gray-900">
                                        {{ row.sku }}
                                    </td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {{ row.title }}
                                    </td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {{ row.description }}
                                    </td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {{ row.inventory }}
                                    </td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        <div :class="{
                                            'inline-block px-2 py-1 rounded': true,
                                            'bg-yellow-100 text-gray-500': row.status === 'Pending',
                                            'bg-blue-100 text-gray-500': row.status === 'In Stock',
                                            'bg-green-100 text-green-500': row.status === 'Active',
                                            'bg-red-100 text-red-500': row.status === 'Out of Stock'
                                        }">
                                            {{ row.status }}
                                        </div>
                                    </td>
                                </template>
                            </Table>
                        </div>
                    </div>
                </Tab>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

const isModalOpen = ref(false);

interface Row {
    sku: string;
    title: string;
    description: string;
    inventory: number;
    status: string;
}

interface Column {
    name: string;
    isAction?: boolean;
}

const tabs = [
    { name: "Home", href: "/my-shop/home", current: true },
    { name: "Products", href: "/my-shop/products", current: false },
    { name: "Orders", href: "/my-shop/orders", current: false }
];

const rows: Row[] = [
    { sku: 'SKU001', title: 'Product 1', description: 'Description for Product 1', inventory: 10, status: 'Active' },
    { sku: 'SKU002', title: 'Product 2', description: 'Description for Product 2', inventory: 0, status: 'Out of Stock' },
    { sku: 'SKU003', title: 'Product 3', description: 'Description for Product 3', inventory: 25, status: 'In Stock' },
    { sku: 'SKU004', title: 'Product 4', description: 'Description for Product 4', inventory: 5, status: 'Pending' }
];

const columns: Column[] = [
    { name: 'SKU' },
    { name: 'Title' },
    { name: 'Description' },
    { name: 'Inventory' },
    { name: 'Status' }
];

const newProduct = ref({
    sku: '',
    title: '',
    description: '',
    inventory: 0,
    status: 'Pending'
});

const createProduct = () => {
    rows.push({ ...newProduct.value });
    isModalOpen.value = false;
    newProduct.value = { sku: '', title: '', description: '', inventory: 0, status: 'Pending' };
};
</script>
