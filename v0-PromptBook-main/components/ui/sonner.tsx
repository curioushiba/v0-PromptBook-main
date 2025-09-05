"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-black group-[.toaster]:border-4 group-[.toaster]:border-black group-[.toaster]:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group-[.toaster]:rounded-xl group-[.toaster]:font-bold",
          description: "group-[.toast]:text-gray-600 group-[.toast]:font-medium",
          actionButton:
            "group-[.toast]:bg-black group-[.toast]:text-white group-[.toast]:border-2 group-[.toast]:border-black group-[.toast]:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-[.toast]:font-bold group-[.toast]:uppercase group-[.toast]:text-xs",
          cancelButton:
            "group-[.toast]:bg-white group-[.toast]:text-black group-[.toast]:border-2 group-[.toast]:border-black group-[.toast]:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-[.toast]:font-bold group-[.toast]:uppercase group-[.toast]:text-xs",
          error:
            "group-[.toaster]:bg-red-200 group-[.toaster]:text-red-800 group-[.toaster]:border-red-800 group-[.toaster]:shadow-[8px_8px_0px_0px_rgba(153,27,27,1)]",
          success:
            "group-[.toaster]:bg-green-200 group-[.toaster]:text-green-800 group-[.toaster]:border-green-800 group-[.toaster]:shadow-[8px_8px_0px_0px_rgba(22,101,52,1)]",
          warning:
            "group-[.toaster]:bg-yellow-200 group-[.toaster]:text-yellow-800 group-[.toaster]:border-yellow-800 group-[.toaster]:shadow-[8px_8px_0px_0px_rgba(133,77,14,1)]",
          info:
            "group-[.toaster]:bg-blue-200 group-[.toaster]:text-blue-800 group-[.toaster]:border-blue-800 group-[.toaster]:shadow-[8px_8px_0px_0px_rgba(30,64,175,1)]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }