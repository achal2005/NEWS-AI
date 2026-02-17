'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Check, Award, ArrowRight, RotateCcw, ChevronLeft, Calendar } from 'lucide-react'
import { useAuth } from '@/lib/auth'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface QuizQuestion {
    id: string
    question: string
    options: string[]
    points_value: number
}

interface QuizData {
    id: string
    week_start: string
    week_end: string
    questions: QuizQuestion[]
}

interface QuizResult {
    score: number
    max_score: number
    points_earned: number
    correct_answers: number
    total_questions: number
}

interface QuizListItem {
    id: string
    week_start: string
    week_end: string
    question_count: number
}

function formatDateRange(start: string, end: string) {
    const s = new Date(start + 'T00:00:00')
    const e = new Date(end + 'T00:00:00')
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
    return `${s.toLocaleDateString('en-US', opts)} – ${e.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`
}

export default function QuizPage() {
    const { token, isAuthenticated } = useAuth()
    const [quizList, setQuizList] = useState<QuizListItem[]>([])
    const [quiz, setQuiz] = useState<QuizData | null>(null)
    const [currentQ, setCurrentQ] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [result, setResult] = useState<QuizResult | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [view, setView] = useState<'list' | 'quiz'>('list')

    useEffect(() => {
        fetchQuizList()
    }, [isAuthenticated])

    const fetchQuizList = async () => {
        setLoading(true)
        try {
            const headers: Record<string, string> = {}
            if (token) headers['Authorization'] = `Bearer ${token}`

            const res = await fetch(`${apiUrl}/api/quiz/list`, {
                headers,
                cache: 'no-store'
            })
            if (res.ok) {
                const data = await res.json()
                setQuizList(data.quizzes || [])
                if ((data.quizzes || []).length === 0) {
                    setError('No quizzes available yet.')
                }
            } else {
                // Fallback: try the old weekly endpoint
                await fetchWeeklyQuiz()
                return
            }
        } catch {
            // Fallback: try weekly
            await fetchWeeklyQuiz()
            return
        } finally {
            setLoading(false)
        }
    }

    const fetchWeeklyQuiz = async () => {
        try {
            const headers: Record<string, string> = {}
            if (token) headers['Authorization'] = `Bearer ${token}`

            const res = await fetch(`${apiUrl}/api/quiz/weekly`, {
                headers,
                cache: 'no-store'
            })
            if (res.ok) {
                const data = await res.json()
                if (data.questions && data.questions.length > 0) {
                    setQuiz(data)
                    setView('quiz')
                } else {
                    setError('No quiz questions available yet.')
                }
            } else {
                setError('Unable to load quiz. Please try again later.')
            }
        } catch {
            setError('Unable to load quiz. Please try again later.')
        } finally {
            setLoading(false)
        }
    }

    const loadQuiz = async (quizId: string) => {
        setLoading(true)
        setError(null)
        try {
            const headers: Record<string, string> = {}
            if (token) headers['Authorization'] = `Bearer ${token}`

            const res = await fetch(`${apiUrl}/api/quiz/${quizId}`, {
                headers,
                cache: 'no-store'
            })
            if (res.ok) {
                const data = await res.json()
                if (data.questions && data.questions.length > 0) {
                    setQuiz(data)
                    setCurrentQ(0)
                    setAnswers({})
                    setResult(null)
                    setView('quiz')
                } else {
                    setError('This quiz has no questions yet.')
                }
            } else {
                setError('Unable to load this quiz.')
            }
        } catch {
            setError('Unable to load quiz. Please try again later.')
        } finally {
            setLoading(false)
        }
    }

    const selectAnswer = (questionId: string, option: string) => {
        if (result) return
        setAnswers(prev => ({ ...prev, [questionId]: option }))
    }

    const nextQuestion = () => {
        if (quiz && currentQ < quiz.questions.length - 1) {
            setCurrentQ(currentQ + 1)
        }
    }

    const prevQuestion = () => {
        if (currentQ > 0) setCurrentQ(currentQ - 1)
    }

    const submitQuiz = async () => {
        if (!quiz) return
        setSubmitting(true)

        try {
            const answerList = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
                question_id: questionId,
                selected_answer: selectedAnswer,
            }))

            const res = await fetch(`${apiUrl}/api/quiz/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ answers: answerList }),
            })
            if (res.ok) {
                const data = await res.json()
                setResult(data)
            } else {
                setResult({
                    score: 0,
                    max_score: quiz.questions.length * 20,
                    points_earned: 0,
                    correct_answers: 0,
                    total_questions: quiz.questions.length,
                })
            }
        } catch {
            setResult({
                score: 0,
                max_score: quiz.questions.length * 20,
                points_earned: 0,
                correct_answers: 0,
                total_questions: quiz.questions.length,
            })
        } finally {
            setSubmitting(false)
        }
    }

    const resetQuiz = () => {
        setCurrentQ(0)
        setAnswers({})
        setResult(null)
    }

    const backToList = () => {
        setView('list')
        setQuiz(null)
        setCurrentQ(0)
        setAnswers({})
        setResult(null)
        setError(null)
    }

    // ─── Loading ───
    if (loading) {
        return (
            <div className="min-h-screen px-gutter py-12">
                <div className="max-w-reading mx-auto animate-pulse">
                    <div className="h-8 rounded w-48 mb-4" style={{ backgroundColor: 'var(--paper-sunken)' }} />
                    <div className="h-4 rounded w-64 mb-8" style={{ backgroundColor: 'var(--paper-sunken)' }} />
                    <div className="editorial-card p-8">
                        <div className="h-6 rounded w-3/4 mb-6" style={{ backgroundColor: 'var(--paper-sunken)' }} />
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-12 rounded" style={{ backgroundColor: 'var(--paper-sunken)' }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ─── Quiz List View ───
    if (view === 'list') {
        if (error || quizList.length === 0) {
            return (
                <div className="min-h-screen px-gutter py-12 flex items-center justify-center">
                    <div className="editorial-card p-12 text-center max-w-sm">
                        <BookOpen className="w-10 h-10 mx-auto mb-4" style={{ color: 'var(--ink-muted)' }} />
                        <h2 className="font-serif text-xl mb-2" style={{ color: 'var(--ink)' }}>
                            No Quizzes Available
                        </h2>
                        <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
                            {error || 'Check back later for new quizzes.'}
                        </p>
                    </div>
                </div>
            )
        }

        return (
            <div className="min-h-screen px-gutter py-12">
                <div className="max-w-reading mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <BookOpen className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                            <h1 className="font-serif text-2xl font-bold" style={{ color: 'var(--ink)' }}>
                                {new Date().toLocaleDateString('en-US', { month: 'long' })} Quizzes
                            </h1>
                        </div>
                        <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
                            Test your knowledge on {new Date().toLocaleDateString('en-US', { month: 'long' })}&apos;s biggest headlines
                        </p>
                    </motion.div>

                    <div className="space-y-4">
                        {quizList.map((q, idx) => (
                            <motion.button
                                key={q.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => loadQuiz(q.id)}
                                className="w-full text-left editorial-card p-6 group hover:shadow-md transition-all duration-300"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calendar className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                                            <span
                                                className="text-xs font-semibold uppercase tracking-wider"
                                                style={{ color: 'var(--accent)' }}
                                            >
                                                Week {idx + 1}
                                            </span>
                                        </div>
                                        <h3
                                            className="font-serif text-lg font-bold mb-1 group-hover:text-[var(--accent)] transition-colors"
                                            style={{ color: 'var(--ink)' }}
                                        >
                                            {formatDateRange(q.week_start, q.week_end)}
                                        </h3>
                                        <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
                                            {q.question_count} questions · {q.question_count * 20} points possible
                                        </p>
                                    </div>
                                    <ArrowRight
                                        className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        style={{ color: 'var(--accent)' }}
                                    />
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    // ─── Error / no quiz ───
    if (error || !quiz) {
        return (
            <div className="min-h-screen px-gutter py-12 flex items-center justify-center">
                <div className="editorial-card p-12 text-center max-w-sm">
                    <BookOpen className="w-10 h-10 mx-auto mb-4" style={{ color: 'var(--ink-muted)' }} />
                    <h2 className="font-serif text-xl mb-2" style={{ color: 'var(--ink)' }}>
                        No Quiz Available
                    </h2>
                    <p className="text-sm mb-6" style={{ color: 'var(--ink-muted)' }}>
                        {error || 'Check back later for the weekly quiz.'}
                    </p>
                    <button onClick={backToList} className="btn-outline text-xs">
                        <ChevronLeft className="w-4 h-4" />
                        Back to Quizzes
                    </button>
                </div>
            </div>
        )
    }

    // ─── Results view ───
    if (result) {
        const percentage = result.max_score > 0
            ? Math.round((result.score / result.max_score) * 100)
            : 0
        return (
            <div className="min-h-screen px-gutter py-12">
                <div className="max-w-reading mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="editorial-card p-8 md:p-12 text-center"
                    >
                        <div
                            className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                            style={{
                                backgroundColor: percentage >= 70 ? 'var(--success)' : percentage >= 40 ? 'var(--warning)' : 'var(--danger)',
                                color: 'var(--paper)',
                            }}
                        >
                            <Award className="w-8 h-8" />
                        </div>

                        <h2 className="font-serif text-3xl font-bold mb-2" style={{ color: 'var(--ink)' }}>
                            {percentage >= 70 ? 'Excellent!' : percentage >= 40 ? 'Good Effort!' : 'Keep Learning!'}
                        </h2>

                        <p className="text-sm mb-8" style={{ color: 'var(--ink-muted)' }}>
                            {result.correct_answers} of {result.total_questions} correct — {result.score} / {result.max_score} points
                        </p>

                        {/* Score bar */}
                        <div className="max-w-xs mx-auto mb-8">
                            <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--paper-sunken)' }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                                    className="h-full rounded-full"
                                    style={{
                                        backgroundColor: percentage >= 70 ? 'var(--success)' : percentage >= 40 ? 'var(--warning)' : 'var(--danger)',
                                    }}
                                />
                            </div>
                            <p className="text-xs mt-2 font-semibold" style={{ color: 'var(--ink-muted)' }}>
                                {percentage}% score
                            </p>
                        </div>

                        {result.points_earned > 0 && (
                            <p className="text-sm font-semibold mb-8" style={{ color: 'var(--accent)' }}>
                                +{result.points_earned} points earned!
                            </p>
                        )}

                        <div className="flex gap-3 justify-center">
                            <button onClick={resetQuiz} className="btn-outline text-xs">
                                <RotateCcw className="w-4 h-4" />
                                Try Again
                            </button>
                            <button onClick={backToList} className="btn-outline text-xs">
                                <ChevronLeft className="w-4 h-4" />
                                All Quizzes
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        )
    }

    // ─── Quiz view ───
    const question = quiz.questions[currentQ]
    const progress = ((currentQ + 1) / quiz.questions.length) * 100
    const allAnswered = quiz.questions.every(q => answers[q.id] !== undefined)

    return (
        <div className="min-h-screen px-gutter py-12">
            <div className="max-w-reading mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <button
                        onClick={backToList}
                        className="flex items-center gap-1 text-xs font-medium mb-4 transition-colors"
                        style={{ color: 'var(--ink-muted)' }}
                    >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Back to Quizzes
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <BookOpen className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                        <h1 className="font-serif text-2xl font-bold" style={{ color: 'var(--ink)' }}>
                            {formatDateRange(quiz.week_start, quiz.week_end)}
                        </h1>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
                        Question {currentQ + 1} of {quiz.questions.length}
                    </p>
                </motion.div>

                {/* Progress Bar */}
                <div className="h-1 rounded-full mb-8 overflow-hidden" style={{ backgroundColor: 'var(--paper-sunken)' }}>
                    <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: 'var(--ink)' }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.4 }}
                    />
                </div>

                {/* Question Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQ}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                        className="editorial-card p-6 md:p-8 mb-6"
                    >
                        <h3 className="font-serif font-bold text-lg mb-6" style={{ color: 'var(--ink)' }}>
                            {question.question}
                        </h3>

                        <div className="space-y-2">
                            {question.options.map((opt, idx) => {
                                const selected = answers[question.id] === opt
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => selectAnswer(question.id, opt)}
                                        className="w-full text-left p-4 rounded-sm text-sm transition-all"
                                        style={{
                                            backgroundColor: selected ? 'var(--ink)' : 'var(--paper-sunken)',
                                            color: selected ? 'var(--paper)' : 'var(--ink)',
                                            border: `1.5px solid ${selected ? 'var(--ink)' : 'var(--border)'}`,
                                        }}
                                    >
                                        <span className="font-medium mr-3" style={{ opacity: 0.5 }}>
                                            {String.fromCharCode(65 + idx)}.
                                        </span>
                                        {opt}
                                    </button>
                                )
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={prevQuestion}
                        disabled={currentQ === 0}
                        className="text-sm font-medium disabled:opacity-30 transition-opacity"
                        style={{ color: 'var(--ink-muted)' }}
                    >
                        ← Previous
                    </button>

                    <div className="flex gap-1.5">
                        {quiz.questions.map((q, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentQ(i)}
                                className="w-2.5 h-2.5 rounded-full transition-all"
                                style={{
                                    backgroundColor: answers[q.id] !== undefined
                                        ? 'var(--ink)'
                                        : i === currentQ
                                            ? 'var(--accent)'
                                            : 'var(--border)',
                                }}
                            />
                        ))}
                    </div>

                    {currentQ < quiz.questions.length - 1 ? (
                        <button
                            onClick={nextQuestion}
                            className="text-sm font-medium flex items-center gap-1"
                            style={{ color: 'var(--ink)' }}
                        >
                            Next <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={submitQuiz}
                            disabled={!allAnswered || submitting}
                            className="btn-primary text-xs disabled:opacity-40"
                        >
                            {submitting ? 'Submitting...' : 'Submit'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
