import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format price to remove decimal points when they are .00
 * @param price - The price to format
 * @returns Formatted price string without unnecessary decimal points
 */
export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) return "Price not available";
  
  // Convert to number and check if it's a whole number
  const numPrice = Number(price);
  if (Number.isInteger(numPrice)) {
    return `Rs. ${numPrice.toLocaleString("en-IN")}`;
  }
  
  // If it has decimals, check if they're just .00
  const rounded = Math.round(numPrice * 100) / 100;
  if (rounded === Math.floor(rounded)) {
    return `Rs. ${Math.floor(rounded).toLocaleString("en-IN")}`;
  }
  
  // If it has actual decimal values, show them
  return `Rs. ${rounded.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
