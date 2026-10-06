import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const pageWrap =
  "mx-auto w-full max-w-lg px-4 pb-24 pt-6 sm:max-w-2xl lg:max-w-6xl lg:px-8"
export const pageWrapY =
  "mx-auto w-full max-w-lg px-4 py-8 pb-24 sm:max-w-2xl lg:max-w-6xl lg:px-8"
