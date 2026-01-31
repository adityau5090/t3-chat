import Image from "next/image";
import { Button } from "@/components/ui/button";
import { currentUser } from "@/modules/authentication_module/actions";
import UserButton from "@/modules/authentication_module/components/user-button";
import ChatMessageView from "@/modules/chat/components/chat-message-view";

export default async function Home(){
  
  const user = await currentUser();
  return (
    <ChatMessageView user={user} />
  );
}
