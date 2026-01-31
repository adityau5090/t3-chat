"use client"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import React, { useEffect, useState } from 'react'
import { Send } from 'lucide-react'

const ChatMessageForm = ({initialMessage, onMessageChange}) => {

    const [message, setMessage] = useState(initialMessage ?? "")

    useEffect(() => {
        if(initialMessage){
            // setMessage(initialMessage)
            onMessageChange?.("")
        }
    },[initialMessage, onMessageChange])

    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            console.log("Message sent ", e);
        } catch (error) {
            console.log(error);
        }
    }
    
  return (
    <div className='w-full max-w-3xl mx-auto px-4 pb-6 mb-5'>
      <form onSubmit={handleSubmit}>
        <div className='relative rounded-2xl border-1 shadow-sm transition-all'>
            <Textarea 
            value={message}
            onChange={(e)=>setMessage(e.target.value)}
            placeholder="Type your message here..."
            className={"min-h-15 max-h-50 resize-none rounded-b-none rounded-t-2xl border-0 bg-transparent px-4 py-3 text-base focus-visible:ring-0 focus-visible:ring-offset-0"}
            onKeyDown={(e)=>{
                if(e.key === "Enter" && !e.shiftKey){
                    e.preventDefault();
                    handleSubmit(e)
                }
            }}
            />

            <div className='flex items-center justify-between gap-2 px-3 py-2 border-t'>
                {/* Model Selector */}
                <div className='flex items-center gap-1'>
                    <Button
                    variant='outline'>
                        Select a model
                    </Button>
                </div>

                <Button
            type="submit"
            disabled={!message.trim()}
            size="sm"
            variant={message.trim() ? "default" : "ghost"}
            className={"h-8 w-8 p-0 rounded-full"} >
                <Send className="h-4 w-4" />
                <span className='sr-only'>Send messages</span>
            </Button>
            </div>

            
        </div>
      </form>
    </div>
  )
}

export default ChatMessageForm
