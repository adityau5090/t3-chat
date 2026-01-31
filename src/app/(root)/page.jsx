
import { currentUser } from "@/modules/authentication_module/actions";
import ChatMessageView from "@/modules/chat/components/chat-message-view";

export default async function Home(){
  
  const user = await currentUser();
  return (
    <ChatMessageView user={user} />
  );
}
