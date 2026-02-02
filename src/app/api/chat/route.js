import { convertToModelMessages, streamText, tool } from "ai";
import { db } from "@/lib/db";
import { MessageRole, MessageType } from "@/generated/prisma";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { CHAT_SYSTEM_PROMPT } from "@/lib/prompt";

const provider = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY
})

const convertStoreMessageToUI = (msg) => {
    try {
        let parts = msg.content;
        if (typeof parts === "string") {
            try {
                parts = JSON.parse(parts);
            } catch {
                parts = [{ type: "text", text: parts }];
            }
        }

        if (parts.length === 0) return null;
        console.log("Parts : ", parts);
        return {
            id: msg.id,
            role: msg.MessageRole.toLowerCase(),
            parts: parts,
            createdAt: msg.createdAt
        }
    } catch (error) {
        return {
            id: msg.id,
            role: msg.messageRole.toLowerCase(),
            parts: [{ type: "text", text: msg.content }],
            createdAt: msg.createdAt
        }
    }
}

const extractPartAsJSON = (message) => {
    if (message.parts && Array.isArray(message.parts)) {
        return JSON.stringify(message.parts)
    }

    const content = message.content || "";
    return JSON.stringify([{ type: "text", text: content }])
}

export async function POST(req) {
    try {
        const { chatId, messages: newMessages, model, skipUserMessage } = await req.json();

        const previousMessages = chatId ? await db.message.findMany({
            where: { chatId },
            orderBy: {
                createdAt: "asc"
            }
        }) : [];

        const uiMessages = previousMessages
            .map(convertStoreMessageToUI)
            .filter(msg => msg != null)

        const normalizedNewMessages = Array.isArray(newMessages) ? newMessages : [newMessages]

        console.log("📊 Previous messages:", uiMessages.length);
        console.log("📊 New messages:", normalizedNewMessages.length);

        const allUIMessages = [...uiMessages, ...normalizedNewMessages]
        const cleanedUIMessages = allUIMessages.map(msg => ({
            ...msg,
            parts: msg.parts.filter(p => p.type === "text"),
        }))
        let modelMessages;

        try {
            modelMessages = await convertToModelMessages(cleanedUIMessages);

            console.log(
                "🧪 Model message types:",
                modelMessages.map(m => ({
                    role: m.role,
                    contentType: typeof m.content,
                })))


        } catch (conversionError) {
            modelMessages = allUIMessages.map(msg => ({
                role: msg.role,
                content: msg.parts
                    .filter(p => p.type === 'text')
                    .map(p => p.text)
                    .join('\n')
            })).filter(m => m.content);
        }

        console.log("🤖 Final model messages:", JSON.stringify(modelMessages, null, 2));

        const result = streamText({
            model: provider.chat(model),
            messages: modelMessages,
            system: CHAT_SYSTEM_PROMPT,
        })

        return result.toUIMessageStreamResponse({
            sendReasoning: true,
            originalMessages: allUIMessages,
            onFinish: async ({ responseMessage }) => {
                try {
                    const messageToSave = []

                    if (!skipUserMessage) {
                        const latestUserMessage = normalizedNewMessages[normalizedNewMessages.length - 1];

                        if (latestUserMessage?.role === "user") {
                            const userPartsJSON = extractPartAsJSON(latestUserMessage);

                            messageToSave.push({
                                chatId,
                                content: userPartsJSON,
                                messageRole: MessageRole.USER,
                                model,
                                messageType: MessageType.NORMAL
                            })
                        }
                    }

                    if (responseMessage?.parts && responseMessage.parts.length > 0) {
                        const assistantPartsJSON = extractPartAsJSON(responseMessage);

                        messageToSave.push({
                            chatId,
                            content: assistantPartsJSON,
                            messageRole: MessageRole.ASSISTANT,
                            model,
                            messageType: MessageType.NORMAL
                        })

                    }

                    if (messageToSave.length > 0) {
                        await db.message.createMany({
                            data: messageToSave
                        })
                    }
                } catch (error) {
                    console.error("Error saving message : ", error);
                }
            }
        })
    } catch (error) {
        console.error("❌ API Route Error:", error)

        return new Response(
            JSON.stringify({
                error: error.message || "Internal server error",
                details: error.toString()
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" }
            }
        )
    }
}