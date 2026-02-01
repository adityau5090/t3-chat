import ActiveChatLoader from '@/modules/messages/components/active-chat-loader';
import MessageViewWithForm from '@/modules/messages/components/message-view-with-form';

import React from 'react'

const Page = async ({params}) => {
    const { chatId } = await params;
    console.log(chatId);
  return (
    <>
      <ActiveChatLoader chatId={chatId} />
      <MessageViewWithForm chatId={chatId} />
    </>
  )
}

export default Page
