'use client'

import { useState, useEffect, useRef } from 'react'

interface TypewriterTextProps {
    text: string
    speed?: number
    delay?: number
    onComplete?: () => void
    className?: string
}

export function TypewriterText({
    text,
    speed = 18,
    delay = 300,
    onComplete,
    className = '',
}: TypewriterTextProps) {
    const [displayedText, setDisplayedText] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [isComplete, setIsComplete] = useState(false)
    const indexRef = useRef(0)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        // Reset when text changes
        setDisplayedText('')
        setIsComplete(false)
        indexRef.current = 0

        const startTimeout = setTimeout(() => {
            setIsTyping(true)
        }, delay)

        return () => {
            clearTimeout(startTimeout)
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [text, delay])

    useEffect(() => {
        if (!isTyping || isComplete || !text) return

        const type = () => {
            if (indexRef.current < text.length) {
                // Type faster through spaces and punctuation
                const char = text[indexRef.current]
                const nextSpeed = char === ' ' ? speed * 0.3
                    : ['.', ',', '!', '?', ':'].includes(char) ? speed * 3
                        : speed + Math.random() * speed * 0.5

                setDisplayedText(text.slice(0, indexRef.current + 1))
                indexRef.current++

                // Clear any existing timeout before setting a new one
                if (timeoutRef.current) clearTimeout(timeoutRef.current)
                timeoutRef.current = setTimeout(type, nextSpeed)
            } else {
                setIsTyping(false)
                setIsComplete(true)
                onComplete?.()
            }
        }

        type()

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [isTyping, text, speed, onComplete, isComplete])

    return (
        <span className={className}>
            {displayedText}
            {!isComplete && (
                <span className="typewriter-cursor" />
            )}
        </span>
    )
}
