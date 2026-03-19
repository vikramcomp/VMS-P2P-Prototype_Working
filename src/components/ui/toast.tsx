'use client';

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { X, CheckCircle, AlertCircle, XCircle, AlertTriangle } from "lucide-react"

import { cn } from "@/utils/cn"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-4 right-4 z-[100] flex max-h-screen w-full flex-col p-4 md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & {
    variant?: 'default' | 'destructive' | 'success' | 'warning'
  }
>(({ className, variant = 'default', ...props }, ref) => {
  const variantClasses = {
    default: "border-gray-200 bg-white text-gray-900 shadow-lg",
    destructive: "border-red-200 bg-red-50 text-red-900 shadow-lg shadow-red-100/50",
    success: "border-green-200 bg-green-50 text-green-900 shadow-lg shadow-green-100/50",
    warning: "border-amber-200 bg-amber-50 text-amber-900 shadow-lg shadow-amber-100/50",
  }

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
      case 'destructive':
        return <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
      default:
        return <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
    }
  }

  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(
        "group pointer-events-auto relative flex w-full items-start space-x-3 overflow-hidden rounded-lg border-l-4 p-4 pr-8 transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {getIcon()}
      <div className="flex-1 min-w-0">
        {props.children}
      </div>
    </ToastPrimitives.Root>
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-red-200 group-[.destructive]:hover:border-red-300 group-[.destructive]:hover:bg-red-100 group-[.destructive]:text-red-700 group-[.destructive]:focus:ring-red-400 group-[.success]:border-green-200 group-[.success]:hover:border-green-300 group-[.success]:hover:bg-green-100 group-[.success]:text-green-700 group-[.success]:focus:ring-green-400 group-[.warning]:border-amber-200 group-[.warning]:hover:border-amber-300 group-[.warning]:hover:bg-amber-100 group-[.warning]:text-amber-700 group-[.warning]:focus:ring-amber-400",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-gray-400 opacity-0 transition-opacity hover:text-gray-600 focus:opacity-100 focus:outline-none focus:ring-1 focus:ring-gray-400 group-hover:opacity-100 group-[.destructive]:text-red-400 group-[.destructive]:hover:text-red-600 group-[.destructive]:focus:ring-red-400 group-[.success]:text-green-400 group-[.success]:hover:text-green-600 group-[.success]:focus:ring-green-400 group-[.warning]:text-amber-400 group-[.warning]:hover:text-amber-600 group-[.warning]:focus:ring-amber-400",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold leading-5 mb-1", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm leading-5 opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}