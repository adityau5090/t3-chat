"use server"

import { db } from "@/lib/db"
import { currentUser } from "@/modules/authentication_module/actions"
import { MessageRole, MessageType } from "@/generated/prisma"
import { revalidatePath } from "next/cache"



export const createChatWithMessage = async (values) => {
    try {
        const user = await currentUser();

        if(!user){
            return {
                success: false,
                message: "Unauthorized user"
            }
        }

        const {content, model } = values;

        if(!content || !content.trim()){
            return {
                success: false,
                message: "Message content is required"
            }
        }

        const title = content.slice(0, 50) + (content.length > 50 ? "..." : "")

        const chat = await db.chat.create({
            data:{
                title,
                model,
                userId: user.id,
                message: {
                    create: {
                        content,
                        messageRole: MessageRole.USER,
                        messageType: MessageType.NORMAL,
                        model
                    }
                }
            },
            include:{
                message: true
            }
        })

        revalidatePath("/");

        return {success: true, message:"Chat created successfully", data:chat}
    } catch (error) {
        console.error("Error creating chat : ", error);
        return {
            success: false,
            message: "Failed to create chat"
        }
    }
}

export const getAllChats = async () => {
    try {
        const user = await currentUser();

        if(!user){
            return {
                success: false,
                message: "Unauthorized access"
            }
        }

        const chats = await db.chat.findMany({
            where: {
                userId: user.id
            },
            include: {
                message: true
            },
            orderBy: {
                createdAt: "desc"
            }
        })

        return {
            success: true,
            message: "Chat fetched successfully",
            data: chats
        }
    } catch (error) {
        console.error("Error fetching chats : ", error);
        return {
            success: false,
            message: "Failed to fetch chats from db"
        }
    }
}

export const deleteChat = async (chatId) => {
    try {
       const user = await currentUser();
        if(!user){
            return {
                success: false,
                message: "Unauthorized access"
            }
        } 

        const chat = await db.chat.findUnique({
            where: {
                id : chatId,
                userId: user.id
            }
        })

        if(!chat){
            return {
                success: false,
                message : "chat not found"
            }
        }

        await db.chat.delete({
            where: {
                id: chatId,
            }
        })

        revalidatePath("/  ");

        return {
            success: true,
            message: "Chat successfully deleted"
        }
    } catch (error) {
        console.error("Error deleting chat :", error);
        return {
            success: false,
            message: "Failed to delete chat"
        }
    }
}

export const getChatById = async (chatId) => {
    try {
        const user = await currentUser();

        if(!user){
            return{
                success: true,
                message: "Unauthorized user"
            }
        }

        const chat = await db.chat.findUnique({
            where: {
                id: chatId,
                userId : user.id
            },
            include: {
                message: true
            }
        })

        return {
            success: true,
            message: "Chat fetched successfully",
            data: chat
        }
    } catch (error) {
        console.error("Error fetching chat : ", error);
        return {
            success: false,
            message: "Failed to fetch chat"
        }
    }
}