<script lang="ts" setup>
const tabs = [
  { name: 'Submitted Proposals', href: '/my-contract/submitted-proposals', current: true },
  { name: 'Invites', href: '/my-contract/invitations', current: false },
  { name: 'Pending Offers', href: '/my-contract/pending-offers', current: false },
  { name: 'Active Jobs', href: '/my-contract/active-jobs', current: false },
  { name: 'Completed Jobs', href: '/my-contract/completed-jobs', current: false },
];
</script>

<template>
  <Tab :tabs="tabs"></Tab>
</template>
