import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const FancyDialog = DialogPrimitive.Root;

const FancyDialogTrigger = DialogPrimitive.Trigger;

const FancyDialogPortal = DialogPrimitive.Portal;

const FancyDialogClose = DialogPrimitive.Close;

const FancyDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
FancyDialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const FancyDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <FancyDialogPortal>
    <FancyDialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-6 bg-gradient-to-br from-background via-background to-primary-soft/30 p-8 shadow-floating duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-2xl border-2 border-primary/20",
        className,
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-2xl pointer-events-none" />
      {children}
      <DialogPrimitive.Close className="absolute right-6 top-6 rounded-full p-2 opacity-70 ring-offset-background transition-all duration-200 hover:opacity-100 hover:bg-accent hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
        <X className="h-5 w-5" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </FancyDialogPortal>
));
FancyDialogContent.displayName = DialogPrimitive.Content.displayName;

const FancyDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-3 text-center relative z-10", className)} {...props} />
);
FancyDialogHeader.displayName = "FancyDialogHeader";

const FancyDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 relative z-10", className)} {...props} />
);
FancyDialogFooter.displayName = "FancyDialogFooter";

const FancyDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-2xl font-bold leading-none tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center justify-center gap-2", className)}
    {...props}
  >
    <Sparkles className="h-6 w-6 text-primary animate-pulse" />
    {children}
    <Sparkles className="h-6 w-6 text-secondary animate-pulse" />
  </DialogPrimitive.Title>
));
FancyDialogTitle.displayName = DialogPrimitive.Title.displayName;

const FancyDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description 
    ref={ref} 
    className={cn("text-muted-foreground text-lg", className)} 
    {...props} 
  />
));
FancyDialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  FancyDialog,
  FancyDialogPortal,
  FancyDialogOverlay,
  FancyDialogClose,
  FancyDialogTrigger,
  FancyDialogContent,
  FancyDialogHeader,
  FancyDialogFooter,
  FancyDialogTitle,
  FancyDialogDescription,
};