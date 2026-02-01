import { convertToModelMessages, streamText, tool } from "ai";
import { db } from "@/lib/db";
import { MessageRole, MessageType } from "@/generated/prisma";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { CHAT_SYSTEM_PROMPT } from "@/lib/prompt";

const provider = createOpenRouter({
    apiKey:process.env.OPENROUTER_API_KEY
})

const convertStoreMessageToUI = (msg) => {
    try {
        const parts = JSON.parse(msg.content);
        const validParts = parts.filter(part => part.type === "text");

        if(validParts.length === 0) return null;

        return {
            id: msg.id,
            role: msg.MessageRole.toLowerCase(),
            parts: validParts,
            createdAt: msg.createdAt 
        }
    } catch (error) {
        return {
            id: msg.id,
            role: msg.MessageRole.toLowerCase(),
            parts: [{ type: "text", text: msg.content }],
            createdAt: msg.createdAt 
        }
    }
}

const extractPartAsJSON = () => {
    if(message.parts && Array.isArray(message.parts)){
        return JSON.stringify(message.parts)
    }

    const content = message.content || "";
    return JSON.stringify([{ type: "text", text: content}])
}

export async function POST(req) {
    try {
        const {chatId, messages:newMessages, model, skipUserMessage} = await req.json();

        const previousMessages = chatId ? await db.chat.findMany({
            where:{chatId},
            orderBy:{
                createdAt:"asc"
            }
        }) : [];

        const uiMessages = previousMessages.map(convertStoreMessageToUI)
        .filter(msg => msg != null)

        const normalizedNewMessages = Array.isArray(newMessages) ? newMessages : [newMessages]

        const allUIMessages = [...uiMessages, ...normalizedNewMessages]

        let modelMessages;

        try {
            modelMessages = convertToModelMessages(allUIMessages);
        } catch (conversionError) {
            modelMessages = allUIMessages.map(msg => ({
                role: msg.role,
                content: msg.parts
                .filter(p => p.type === 'text')
                .map(p => p.text)
                .join('\n')
            })).filter(m => m.content);
        }
        const result = streamText({
            model: provider.chat(model),
            messages: modelMessages,
            system: CHAT_SYSTEM_PROMPT,  
        })

        return result.toUIMessageStreamResponse({
            sendReasoning: true,
            originalMessages: allUIMessages,
            onFinish: async ({responseMessage}) => {
                try {
                    const messageToSave = []

                    if(!skipUserMessage){
                        const latestUserMessage = normalizedNewMessages[normalizedNewMessages.length - 1];

                        if(latestUserMessage?.role === "user"){
                            const userPartsJSON = extractPartAsJSON(latestUserMessage);

                            messageToSave.push({chatId,
                            content: userPartsJSON,
                            MessageRole: MessageRole.USER,
                            model,
                            MessageType:MessageType.NORMAL 
                            })
                        }
                    }

                    if(responseMessage?.parts && responseMessage.parts.length > 0){
                        const assistanstPartsJSON = extractPartAsJSON(responseMessage);

                        messageToSave.push({
                            chatId,
                            content: assistanstPartsJSON,
                            messageRole: MessageRole.ASSISTANT,
                            model,
                            MessageType: MessageType.NORMAL
                        })

                    }

                    if(messageToSave.length > 0){
                        await db.message.createMany({
                            data:messageToSave
                        })
                    }
                } catch (error) {
                    console.error("Error saving message : ", error);
                    
                    return new Response(
                        JSON.stringify({
                            error: error.message || "Internal server error",
                            details: error.toString()
                        }),
                        {
                            status: 500,
                            headers: { "Content-Type": "application/json"}
                        }
                    )
                }
            }
        })
    } catch (error) {
        console.error("")
    }
}