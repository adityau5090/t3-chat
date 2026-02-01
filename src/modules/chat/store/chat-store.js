import { create } from "zustand";

export const useChatStore = create((set, get) => ({
    activeChatId: null,
    chats:[],
    messages:[],

    setActiveChatId:(chatId)=>set({activeChatId:chatId}),
    setChats:(chats)=>set({ chats }),
    setMessages:(messages)=>set({ messages }),

    addChat: (chat)=>set({ chats: [chat, ...get().chats]}),
    addMessage: (message)=>set({ messages: [...get().messages, message]}),

    clearMessages: ()=>set({ messages: [] }),
}))