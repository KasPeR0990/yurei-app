"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface BoxLogoLoadingProps {
  platformName: string
  isLoading?: boolean
  className?: string
}

export default function BoxLogoLoading({ platformName, isLoading = true, className = "" }: BoxLogoLoadingProps) {
  const [activeBox, setActiveBox] = useState(0)
  const [loadingComplete, setLoadingComplete] = useState(false)
  const [dots, setDots] = useState(0)

  // Reset when loading state changes
  useEffect(() => {
    if (isLoading) {
      setLoadingComplete(false)
      setActiveBox(0)
    }
  }, [isLoading])

  // Animate the boxes lighting up one by one
  useEffect(() => {
    if (!isLoading || loadingComplete) return

    const boxInterval = setInterval(() => {
      setActiveBox((prev) => {
        // We have 5 boxes to light up (the 4 corners of the L shape and the bottom square)
        const next = prev + 1
        if (next >= 5) {
          setLoadingComplete(true)
          clearInterval(boxInterval)
          return 0
        }
        return next
      })
    }, 600)

    return () => clearInterval(boxInterval)
  }, [isLoading, loadingComplete])

  // Animate the dots
  useEffect(() => {
    if (loadingComplete) return

    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev + 1) % 4)
    }, 500)

    return () => clearInterval(dotsInterval)
  }, [loadingComplete])

  return (
    <div className={`w-full max-w-xl bg-[#111] border border-[#222] rounded-2xl px-5 py-4 ${className}`}>
      <div className="flex items-center">
        {/* Logo */}
        <div className="w-6 h-6 mr-4 relative">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* L-shaped section broken into 4 parts for animation */}
            <motion.path
              d="M50 30 H135 V75 H95 V115 H50 V30 Z"
              fill={activeBox === 0 || loadingComplete ? "white" : "#333"}
              animate={{ fill: activeBox === 0 || loadingComplete ? "white" : "#333" }}
              transition={{ duration: 0.3 }}
            />
            <motion.path
              d="M135 75 H180 V115 H135 V75 Z"
              fill={activeBox === 1 || loadingComplete ? "white" : "#333"}
              animate={{ fill: activeBox === 1 || loadingComplete ? "white" : "#333" }}
              transition={{ duration: 0.3 }}
            />
            <motion.path
              d="M135 115 H180 V160 H135 V115 Z"
              fill={activeBox === 2 || loadingComplete ? "white" : "#333"}
              animate={{ fill: activeBox === 2 || loadingComplete ? "white" : "#333" }}
              transition={{ duration: 0.3 }}
            />
            <motion.path
              d="M95 115 H135 V160 H95 V115 Z"
              fill={activeBox === 3 || loadingComplete ? "white" : "#333"}
              animate={{ fill: activeBox === 3 || loadingComplete ? "white" : "#333" }}
              transition={{ duration: 0.3 }}
            />

            {/* Middle square (always black) */}
            <path d="M95 75 H135 V115 H95 V75 Z" fill="black" />

            {/* Bottom square */}
            <motion.path
              d="M50 160 H95 V205 H50 V160 Z"
              fill={activeBox === 4 || loadingComplete ? "white" : "#333"}
              animate={{ fill: activeBox === 4 || loadingComplete ? "white" : "#333" }}
              transition={{ duration: 0.3 }}
            />
          </svg>
        </div>

        {/* Text */}
        <div className="text-white text-sm font-light">
          {loadingComplete
            ? `Latest on ${platformName} loaded`
            : `Searching for latest on ${platformName}${".".repeat(dots)}`}
        </div>

        {/* Loading indicator */}
        {!loadingComplete && (
          <div className="flex space-x-1 ml-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-1 h-1 rounded-full transition-opacity duration-300 ${
                  i === dots % 3 ? "bg-white" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        )}

        {/* Complete indicator */}
        {loadingComplete && (
          <div className="ml-3">
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-500"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}