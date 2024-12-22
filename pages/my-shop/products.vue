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
                            <Table :columns="columns" :rows="rows">
                                <template #default="{ row }">
                                    <td
                                        class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                        {{ row.id }}
                                    </td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {{ row.totalAmount }}
                                    </td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {{ row.customer }}
                                    </td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {{ row.date }}
                                    </td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        <div :class="{
                                            'inline-block px-2 py-1 rounded': true,
                                            'bg-yellow-100 text-gray-500': row.status === 'Pending',
                                            'bg-blue-100 text-gray-500': row.status === 'Shipped',
                                            'bg-green-100 text-green-500': row.status === 'Completed',
                                            'bg-red-100 text-red-500': row.status === 'Cancelled'
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
interface Row {
    id: number;
    totalAmount: string;
    customer: string;
    date: string;
    status: string;
}

interface Column {
    name: string;
    isAction?: boolean;
}

const tabs = [
    { name: "Home", href: "/my-shop/home", current: true },
    { name: "Products", href: "/my-shop/products", current: false },
    {
        name: "Orders",
        href: "/my-shop/orders",
        current: false,
    },
];

const rows: Row[] = [
    { id: 1, totalAmount: '$100.00', customer: 'Lindsay Walton', date: '2024-12-22', status: 'Completed' },
    { id: 2, totalAmount: '$250.00', customer: 'Courtney Henry', date: '2024-12-21', status: 'Pending' },
    { id: 3, totalAmount: '$300.00', customer: 'Tom Cook', date: '2024-12-20', status: 'Shipped' },
    { id: 4, totalAmount: '$75.00', customer: 'Whitney Francis', date: '2024-12-19', status: 'Cancelled' }
];

const columns: Column[] = [
    { name: 'ID' },
    { name: 'Total Amount' },
    { name: 'Customer' },
    { name: 'Date' },
    { name: 'Status' }
];
</script>
