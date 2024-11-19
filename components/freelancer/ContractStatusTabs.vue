<script lang="ts" setup>
const tabs = [
    { name: 'Pending Contracts', href: `/my-contract/active-contracts`, current: true },
    { name: 'Active Contracts', href: '#', current: false },
    { name: 'Completed Contracts', href: '#', current: false },
];
</script>

<template>
    <Tab :tabs="tabs"></Tab>
</template>
