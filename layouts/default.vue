<template>
    <div class="h-screen">
        <header class="flex flex-row justify-between border-b-2 border-gray-200 text-white p-4">
            <img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg" alt="Dummy Logo"
                width="50" height="50">
            <div class="flex justify-end space-x-4">
              <NuxtLink to="/login" class="text-black font-bold py-2 px-4 rounded">
                Log in
              </NuxtLink>
              <NuxtLink to="/register" class="bg-primary rounded-full text-white font-bold py-2 px-4">
                Sign up
              </NuxtLink>
            </div>
        </header>
        <slot/>
    </div>
</template>
