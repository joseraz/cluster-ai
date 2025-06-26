
import { useState, useEffect } from "react"

// Custom hook to detect if the user is on a mobile device
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window === "undefined") return

    // Function to check if screen width indicates mobile device
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768) // 768px is typical tablet/mobile breakpoint
    }

    // Initial check
    checkIsMobile()

    // Add event listener for window resize
    window.addEventListener("resize", checkIsMobile)

    // Cleanup event listener on component unmount
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  return isMobile
}
