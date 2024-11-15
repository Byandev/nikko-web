<script lang="ts" setup>
const route = useRoute()
const tabs = [
  { name: 'View Job', href: `/projects/${route.params.projectId}/details`, current: true },
  { name: 'All Proposals', href: `/projects/${route.params.projectId}/proposals`, current: false },
  { name: 'Invite Freelancers', href: `/projects/${route.params.projectId}/invite`, current: false },
  { name: 'Hired', href: `/projects/${route.params.projectId}/hires`, current: false },
];
</script>

<template>
  <Tab :tabs="tabs"></Tab>
</template>
