import { cn } from "@/lib/utils";

type TextareaProps = React.ComponentProps<"textarea"> & {
  disableFocusRing?: boolean;
};

function Textarea({ className, disableFocusRing, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        !disableFocusRing &&
          "focus-visible:border-ring focus-visible:ring-ring/50",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
