<template>
    <div class="my-8 lg:mx-auto mx-5 max-w-7xl ring-1 ring-gray-300 rounded-md h-full">
        <div class="flex flex-col lg:flex-row h-full">
            <!-- Sidebar -->
            <div class="w-full lg:w-1/3 flex flex-col gap-4 h-full">
                <!-- Search Bar -->
                <div class="p-4 bg-gray-50 border-b">
                    <input type="text" placeholder="Search or start new chat"
                        class="w-full p-2 border rounded-lg focus:outline-none focus:ring focus:ring-green-400" />
                </div>

                <!-- Chat List -->
                <div class="overflow-y-auto flex-grow">
                    <div v-for="chat in chats" :key="chat.id" @click="selectChat(chat)"
                        :class="['flex items-center p-4 border-b cursor-pointer', selectedChat && selectedChat.id === chat.id ? 'bg-gray-200' : 'hover:bg-gray-200']">
                        <img :src="chat.image" alt="User" class="w-12 h-12 rounded-full mr-4" />
                        <div class="flex-1">
                            <div class="text-lg font-semibold">{{ chat.name }}</div>
                            <div class="text-sm text-gray-600 truncate">{{ chat.preview }}</div>
                        </div>
                        <div class="text-xs text-gray-500">{{ chat.time }}</div>
                    </div>
                </div>
            </div>

            <!-- Chat Section -->
            <div class="w-full lg:w-2/3 bg-gray-50 flex flex-col h-full border-l-2 border-r-2">
                <div v-if="selectedChat" class="flex flex-col flex-grow h-full">
                    <!-- Chat Header -->
                    <div class="flex items-center p-4 bg-gray-200 border-b">
                        <img :src="selectedChat.image" alt="User" class="w-10 h-10 rounded-full mr-4" />
                        <div class="flex-1">
                            <div class="text-lg font-semibold">{{ selectedChat.name }}</div>
                            <div class="text-sm text-gray-600">Online</div>
                        </div>
                        <div class="space-x-2">
                            <button class="p-2 rounded hover:bg-gray-300">Search</button>
                            <button class="p-2 rounded hover:bg-gray-300">Menu</button>
                        </div>
                    </div>

                    <!-- Chat Messages -->
                    <div class="flex-1 p-4 overflow-y-auto">
                        <div class="space-y-4">
                            <div v-for="(message, index) in messages" :key="index">
                                <div v-if="message.sentBy === 'other'" class="flex justify-start">
                                    <div class="bg-white p-3 rounded-lg shadow w-max">
                                        <p>{{ message.text }}</p>
                                        <span class="text-xs text-gray-500">{{ message.time }}</span>
                                    </div>
                                </div>
                                <div v-else class="flex justify-end">
                                    <div class="bg-green-100 p-3 rounded-lg shadow w-max">
                                        <p>{{ message.text }}</p>
                                        <span class="text-xs text-gray-500">{{ message.time }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Chat Input -->
                    <div class="flex items-center p-4 bg-gray-200 border-t">
                        <input type="text" v-model="newMessage" placeholder="Type a message"
                            class="flex-1 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-green-400" />
                        <button @click="sendMessage"
                            class="ml-4 p-2 bg-green-500 text-white rounded-full hover:bg-green-600">
                            Send
                        </button>
                    </div>
                </div>
                <div v-else class="flex items-center justify-center flex-grow">
                    <p class="text-gray-500">Select a chat to start messaging</p>
                </div>
            </div>

            <!-- Profile Section -->
            <div class="w-full lg:w-1/3 bg-gray-50 flex flex-col h-full p-4 border-l">
                <div v-if="selectedChat" class="flex flex-col items-center">
                    <img :src="selectedChat.image" alt="User" class="w-24 h-24 rounded-full mb-4" />
                    <div class="text-lg font-semibold">{{ selectedChat.name }}</div>
                    <div class="text-sm text-gray-600 mb-4">Online</div>
                    <div class="text-sm text-gray-600">{{ selectedChat.preview }}</div>
                </div>
                <div v-else class="flex items-center justify-center flex-grow">
                    <p class="text-gray-500">Select a chat to view profile</p>
                </div>
            </div>
        </div>
    </div>
</template>



<script setup lang="ts">
import { ref } from "vue";

// Chat list
const chats = ref([
    {
        id: 1,
        name: "John Doe",
        preview: "Hello! How are you?",
        time: "10:30 AM",
        image: "https://i.pravatar.cc/150?img=8",
    },
    {
        id: 2,
        name: "Jane Smith",
        preview: "Are we still meeting later?",
        time: "9:15 AM",
        image: "https://i.pravatar.cc/150?img=9",
    },
]);

// Messages for the selected chat
const messages = ref([
    { text: "Hello, how are you?", time: "10:30 AM", sentBy: "other" },
    { text: "I'm good, thank you!", time: "10:31 AM", sentBy: "self" },
]);

// Selected chat
const selectedChat = ref<typeof chats.value[0] | null>(null);

// New message text
const newMessage = ref("");

// Select chat function
function selectChat(chat: typeof chats.value[0]) {
    selectedChat.value = chat;
}

// Send message function
function sendMessage() {
    if (newMessage.value.trim() === "") return;

    messages.value.push({
        text: newMessage.value,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        sentBy: "self",
    });

    newMessage.value = "";
}
</script>
