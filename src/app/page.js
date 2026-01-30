import Image from "next/image";
import { Button } from "@/components/ui/button";
import { currentUser } from "@/modules/authentication_module/actions";
import UserButton from "@/modules/authentication_module/components/user-button";

export default async function Home(){
  
  const user = await currentUser();
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Button>Hello World</Button>
      <UserButton user={user} />
    </div>
  );
}
