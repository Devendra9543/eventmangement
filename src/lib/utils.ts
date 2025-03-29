
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  try {
    // Try to parse the date string
    const date = parseISO(dateString)
    // Format the date in a user-friendly way
    return format(date, 'MMM d, yyyy')
  } catch (error) {
    // If parsing fails, return the original string
    console.error("Error formatting date:", error)
    return dateString
  }
}
