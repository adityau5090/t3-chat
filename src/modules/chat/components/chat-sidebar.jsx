"use client"
import React, { Fragment, useMemo } from 'react'
import Link from 'next/link'
import UserButton from '@/modules/authentication_module/components/user-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { PlusIcon, SearchIcon, MenuIcon, EllipsisIcon, Trash } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'
import { useChatStore } from '../store/chat-store'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { DeleteChatModal } from './modal/chat-delete-modal'


const ChatSideBar = ({user, chats}) => {

  const {activeChatId} = useChatStore();

  const [isModelOpen, setIsModelOpen] = useState(false)
  const [selectedChatId, setSelectedChatId] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")

  const fileteredChats = useMemo(() => {
    if(!searchQuery.trim()){
      return chats;
    }

     const query = searchQuery.toLowerCase();
     return chats.filter(chat => {
      chat.title?.toLowerCase().includes(query) ||
      chat.message?.some(msg => msg.content?.toLowerCase().includes(query))
     })
  },[chats,searchQuery])

  // Group chats by data (today, yesterday, inMonth, inYear)

  const groupChats = useMemo(()=> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const groups = {
      today: [],
      yesterday: [],
      lastWeek: [],
      older: [],
    }

    fileteredChats.forEach(chat => {
      const chatDate = new Date(chat.createdAt);
      
      if(chatDate >= today){
        groups.today.push(chat);
      } else if (chatDate >= yesterday){
        groups.yesterday.push(chat);
      } else if (chatDate >= lastWeek){
        groups.lastWeek.push(chat);
      } else {
        groups.older.push(chat);
      }
    })

    return groups;
  }, [fileteredChats])
  
  const onDelete = (e, chatId) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedChatId(chatId)
    setIsModelOpen(true)

  }

  const renderChatList = (chatList) => {
    if(chatList.length === 0) return null;

    return chatList.map((chat) => (

      <Fragment key={chat.id}>
      <Link 
  
      href={`chat/${chat.id}`}
      className={cn("block rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors", chat.id === activeChatId && "bg-sidebar-accent")}
      >
        <div className='flex flex-row justify-center items-center gap-2'>
          <span className='truncate flex-1'>{chat.title}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
              variant='ghost'
              size="icon"
              className={"h-6 w-6 group-hover:opacity-100 hover:bg-sidebar-accent-foreground/10"}
              onClick={(e)=> e.preventDefault()}
              >
                <EllipsisIcon className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className={"flex flex-row gap-2 cursor-pointer"} 
              onClick={(e) => onDelete(e, chat.id)}>
                <Trash className='h-4 w-4 text-red-500' />
                <span className='text-red-500'>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          
        </div>
      </Link>

      <DeleteChatModal chatId={chat.id} isModalOpen={isModelOpen} setIsModalOpen={setIsModelOpen} />

      </Fragment>
    ))
  }
  return (
    <div className='flex h-full w-64 flex-col border-r border-border bg-sidebar'>
      <div className='flex items-center justify-between px-4 py-3'>
        <div className='flex items-center gap-2'>
            <Image src={"/logo.svg"} alt="logo" width={100} height={100} />
        </div>
      </div>

      <div className='p-4'>
        <Link href={"/"}>
            <Button className={"w-full"}>
                <PlusIcon className='mr-2 h-4 w-4' />
                New Chat
            </Button>
        </Link>
      </div>

      <div className='px-4 pb-4'>
        <div className='relative'>
            <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input 
            placeholder="Search your chat..."
            className={"pl-9 bg-siderbar-accent border-sidebar-border pr-8"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value) }
            />
        </div>
      </div>

      <div className='flex-1 overflow-y-auto px-2'>
        {fileteredChats.length === 0 ? (<div className='text-center text-sm text-muted-foreground py-8'>
         No chats yet
        </div>) : (
          <>
          {groupChats.today.length > 0 && ( 
            <div className='mb-4'>
              <div className='mb-2 px-2 text-sm font-semibold text-muted-foreground'>Today</div>
            {renderChatList(groupChats.today)}
            </div>
          )}
          {groupChats.yesterday.length > 0 && ( 
            <div className='mb-4'>
              <div className='mb-2 px-2 text-xs font-semibold text-muted-foreground'>Yesterday</div>
            {renderChatList(groupChats.yesterday)}
            </div>
          )}
          {groupChats.lastWeek.length > 0 && ( 
            <div className='mb-4'>
              <div className='mb-2 px-2 text-xs font-semibold text-muted-foreground'>Last 7 Days</div>
            {renderChatList(groupChats.lastWeek)}
            </div>
          )}
          {groupChats.older.length > 0 && ( 
            <div className='mb-4'>
              <div className='mb-2 px-2 text-xs font-semibold text-muted-foreground'>Older</div>
            {renderChatList(groupChats.older)}
            </div>
          )}
          </>
        )}
      </div>

      <div className='p-4 flex items-center gap-3 border-t border-sidebar-border'>
        <UserButton user={user} />
        <span className='flex-1 text-xs text-sidebar-foreground fitkitten'>
            {user.email}
        </span>
      </div>

    </div>
  )
}

export default ChatSideBar
