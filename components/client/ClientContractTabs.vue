<script lang="ts" setup>
const tabs = [
    { name: 'Pending Contract', href: '/my-contract/pending-contracts', current: false },
    { name: 'Active Contract', href: '/my-contract/active-contracts', current: false },
    { name: 'Completed Contact', href: '/my-contract/completed-contracts', current: false },
];
</script>

<template>
  <Tab :tabs="tabs"></Tab>
</template>
