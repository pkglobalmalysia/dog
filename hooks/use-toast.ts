import { toast as sonnerToast } from "sonner"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export const useToast = () => {
  const toast = ({ title, description, variant }: ToastProps) => {
    if (variant === "destructive") {
      sonnerToast.error(title || "Error", {
        description,
      })
    } else {
      sonnerToast.success(title || "Success", {
        description,
      })
    }
  }

  return { toast }
}
