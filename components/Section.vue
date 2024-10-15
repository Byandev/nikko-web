<script setup lang="ts">

</script>

<template>
    <div class="border border-gray-300 rounded-lg">
        <div class=" border-b-2 border-gray-300">
            <div class="p-4">
                <slot name="header" />
            </div>
        </div>
        <div class="p-4">
            <slot name="content"></slot>
        </div>
    </div>
</template>