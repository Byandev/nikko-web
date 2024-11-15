<script lang="ts" setup>
const tabs = [
  { name: 'Submitted Proposals', href: '/my-contract/submitted-proposals', current: true },
  { name: 'Invites', href: '/my-contract/invitations', current: false },
  { name: 'Active Proposals', href: '#', current: false },
  { name: 'Pending Offers', href: '#', current: false },
  { name: 'Active Jobs', href: '#', current: false },
  { name: 'Completed Jobs', href: '#', current: false },
];
</script>

<template>
  <Tab :tabs="tabs"></Tab>
</template>
