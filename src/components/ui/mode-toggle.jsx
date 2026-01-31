"use client"
import React from 'react'
import {useTheme} from "next-themes"
import { Button } from './button';
import { MoonIcon, SunIcon} from 'lucide-react';

export const ModeToggle = () => {
    const { theme, setTheme } = useTheme();
  return (
    <Button 
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === 'light' ? "dark" : "light")}
    >
        {theme === "light" ? ( <div className='bg-gray-100 p-1 rounded-tr-lg rounded-bl-lg'><MoonIcon className='size-5' /></div>) : (<div className='bg-gray-700 p-1 rounded-tr-lg rounded-bl-lg'><SunIcon className='size-5' /></div>)}
    </Button>    
  )
}

