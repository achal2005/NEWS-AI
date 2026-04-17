'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth'

interface QuizQuestion {
    id: string
    question: string
    options: string[]
    correct_answer: string
    hint?: string
    points_value: number
}

interface Quiz {
    id: string
    week_start: string
    week_end: string
    questions: QuizQuestion[]
}

interface QuizListItem {
    id: string
    week_start: string
    week_end: string
    question_count: number
    is_active: boolean
}

export default function QuizPage() {
    const { token } = useAuth()
    const [quizzes, setQuizzes] = useState<QuizListItem[]>([])
    const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null)
    const [currentQ, setCurrentQ] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
    const [answerResult, setAnswerResult] = useState<'correct' | 'incorrect' | null>(null)
    const [score, setScore] = useState(0)
    const [answers, setAnswers] = useState<{ question_id: string; selected_answer: string }[]>([])
    const [phase, setPhase] = useState<'list' | 'playing' | 'results'>('list')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [streak, setStreak] = useState(0)

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                // Ensure a weekly quiz exists (auto-generates if none)
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quiz/weekly`, { cache: 'no-store' })

                // Now list all available quizzes
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quiz/list`, { cache: 'no-store' })
                if (res.ok) {
                    const data = await res.json()
                    setQuizzes(data.quizzes || data || [])
                }
            } catch (err) {
                console.error('Failed to fetch quizzes:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchQuizzes()
    }, [])

    const startQuiz = useCallback(async (quizId: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quiz/${quizId}`, { cache: 'no-store' })
            if (res.ok) {
                const data = await res.json()
                setActiveQuiz(data)
                setCurrentQ(0)
                setScore(0)
                setAnswers([])
                setStreak(0)
                setPhase('playing')
            }
        } catch (err) {
            console.error('Failed to start quiz:', err)
        }
    }, [])

    const handleAnswer = (answer: string) => {
        if (selectedAnswer) return
        setSelectedAnswer(answer)

        const question = activeQuiz?.questions[currentQ]
        const isCorrect = answer === question?.correct_answer

        setAnswerResult(isCorrect ? 'correct' : 'incorrect')
        if (isCorrect) {
            setScore(prev => prev + (question?.points_value || 20))
            setStreak(prev => prev + 1)
        } else {
            setStreak(0)
        }

        setAnswers(prev => [...prev, {
            question_id: question?.id || '',
            selected_answer: answer,
        }])

        // Auto-advance after delay (longer if hint is shown)
        const delay = question?.hint ? 2800 : 1500;
        setTimeout(() => {
            if (activeQuiz && currentQ < activeQuiz.questions.length - 1) {
                setCurrentQ(prev => prev + 1)
                setSelectedAnswer(null)
                setAnswerResult(null)
            } else {
                setPhase('results')
            }
        }, delay)
    }

    const submitQuiz = async () => {
        if (!token || !activeQuiz) return
        setSubmitting(true)
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quiz/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    quiz_id: activeQuiz.id,
                    answers,
                }),
            })
        } catch (err) {
            console.error('Failed to submit quiz:', err)
        } finally {
            setSubmitting(false)
        }
    }

    const letterLabels = ['A', 'B', 'C', 'D']

    // ── LIST VIEW ──
    if (phase === 'list') {
        return (
            <div className="flex-1 flex flex-col">
                <header className="h-20 border-b-3 border-ink flex items-center justify-between px-8 bg-white/50">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-black uppercase tracking-tight font-sans">Pop Quiz</h2>
                        <span className="bg-ink text-primary px-2 py-1 text-xs font-mono font-bold">
                            <span className="material-symbols-outlined text-sm align-middle mr-1">bolt</span>
                            TEST YOUR KNOWLEDGE
                        </span>
                    </div>
                </header>

                <div className="flex-1 p-8">
                    <div className="max-w-3xl mx-auto space-y-4">
                        {loading ? (
                            <div className="text-center py-20">
                                <span className="material-symbols-outlined text-6xl text-ink/20 animate-pulse">quiz</span>
                                <p className="font-mono text-sm text-ink/60 mt-4">Loading quizzes...</p>
                            </div>
                        ) : quizzes.length === 0 ? (
                            <div className="text-center py-20 border-3 border-ink border-dashed p-12 bg-white">
                                <span className="material-symbols-outlined text-6xl text-ink/20">quiz</span>
                                <h3 className="font-display font-bold text-2xl mt-4">No Quizzes Available</h3>
                                <p className="font-mono text-sm text-ink/60 mt-2">
                                    Check back later — new quizzes drop weekly.
                                </p>
                            </div>
                        ) : (
                            quizzes.map((quiz) => (
                                <button
                                    key={quiz.id}
                                    onClick={() => startQuiz(quiz.id)}
                                    className="brutal-card w-full text-left bg-white border-3 border-ink shadow-hard p-6 flex items-center justify-between group"
                                >
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="bg-primary border-2 border-ink px-2 py-0.5 text-xs font-bold shadow-hard-sm">
                                                {quiz.question_count} QUESTIONS
                                            </span>
                                            {quiz.is_active && (
                                                <span className="flex items-center gap-1 text-xs font-mono text-alert font-bold">
                                                    <span className="w-2 h-2 rounded-full bg-alert animate-pulse" />
                                                    LIVE
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-display font-bold text-xl group-hover:underline decoration-primary decoration-3">
                                            Weekly Quiz: {new Date(quiz.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {new Date(quiz.week_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </h3>
                                    </div>
                                    <span className="material-symbols-outlined text-3xl group-hover:text-primary transition-colors">
                                        play_circle
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>
        )
    }

    // ── RESULTS VIEW ──
    if (phase === 'results') {
        const totalPossible = activeQuiz?.questions.reduce((sum, q) => sum + (q.points_value || 20), 0) || 0
        const pct = totalPossible > 0 ? Math.round((score / totalPossible) * 100) : 0

        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="relative w-full max-w-lg">
                    <div className="absolute inset-0 translate-x-3 translate-y-3 bg-ink border-3 border-ink" />
                    <div className="relative bg-canvas border-3 border-ink shadow-hard overflow-hidden">
                        <div className="bg-primary border-b-3 border-ink p-8 text-center">
                            <span className="material-symbols-outlined text-6xl mb-4 block">
                                {pct >= 80 ? 'emoji_events' : pct >= 50 ? 'thumb_up' : 'sentiment_neutral'}
                            </span>
                            <h2 className="font-display font-black text-4xl">
                                {pct >= 80 ? 'EXCELLENT!' : pct >= 50 ? 'NICE WORK!' : 'KEEP LEARNING!'}
                            </h2>
                        </div>
                        <div className="p-8 text-center">
                            <div className="lcd-text text-6xl font-black mb-2">{pct}%</div>
                            <p className="font-mono text-sm text-ink/60 mb-6">
                                {score} / {totalPossible} POINTS
                            </p>
                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={async () => { await submitQuiz(); setPhase('list') }}
                                    disabled={submitting}
                                    className="px-6 py-3 bg-ink text-primary border-3 border-ink font-bold shadow-hard hover:bg-primary hover:text-ink transition-colors"
                                >
                                    {submitting ? 'SAVING...' : 'SAVE & EXIT'}
                                </button>
                                <button
                                    onClick={() => setPhase('list')}
                                    className="px-6 py-3 bg-white border-3 border-ink font-bold shadow-hard hover:bg-paper-accent transition-colors"
                                >
                                    BACK TO LIST
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ── PLAYING VIEW ──
    const question = activeQuiz?.questions[currentQ]
    if (!question) return null

    return (
        <div className="flex-1 flex items-center justify-center p-4 md:p-8 relative">
            {/* Background Grid */}
            <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#121212 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

            <div className="relative w-full max-w-2xl z-10">
                {/* Depth shadow card */}
                <div className="absolute inset-0 translate-x-3 translate-y-3 bg-ink border-3 border-ink" />

                {/* Main Card */}
                <div className="relative bg-canvas border-3 border-ink shadow-hard overflow-hidden flex flex-col">
                    {/* Card Header */}
                    <header className="flex items-center justify-between border-b-[4px] border-ink bg-white p-4 md:px-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center bg-primary border-2 border-ink shadow-hard-sm">
                                <span className="material-symbols-outlined text-ink text-xl font-bold">flash_on</span>
                            </div>
                            <div>
                                <h2 className="font-mono text-sm font-bold tracking-tight text-ink uppercase leading-none">
                                    POP_QUIZ
                                </h2>
                                <p className="text-xs font-mono text-ink/60 mt-0.5">
                                    Q. {String(currentQ + 1).padStart(2, '0')} / {String(activeQuiz?.questions.length || 0).padStart(2, '0')}
                                </p>
                            </div>
                        </div>

                        {streak > 1 && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-ink text-primary rounded-full border-2 border-transparent">
                                <span className="material-symbols-outlined text-sm">local_fire_department</span>
                                <span className="font-mono text-xs font-bold tracking-wider">STREAK: {streak}X</span>
                            </div>
                        )}
                    </header>

                    {/* Timer Bar */}
                    <div className="relative w-full h-10 bg-paper-grey border-b-[4px] border-ink flex items-center px-4 overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-orange-500 to-red-600 animate-fuse-burn w-full origin-left z-0" />
                        <div className="relative z-10 flex justify-between w-full font-mono text-xs font-bold tracking-wider text-white mix-blend-difference">
                            <span>FUSE_TIMER_ACTIVE</span>
                            <span>SCORE: {score}</span>
                        </div>
                    </div>

                    {/* Question Area */}
                    <div className="p-6 md:p-10 flex flex-col gap-8 bg-canvas">
                        <h1 className="font-display text-2xl md:text-4xl font-medium leading-[1.1] text-ink text-center md:text-left">
                            {question.question}
                        </h1>

                        {/* Answer Options */}
                        <div className="grid grid-cols-1 gap-4 w-full">
                            {question.options.map((option, i) => {
                                const isSelected = selectedAnswer === option
                                const isCorrect = answerResult && option === question.correct_answer
                                const isWrong = answerResult === 'incorrect' && isSelected

                                let bgClass = 'bg-white group-hover:bg-paper-accent'
                                let labelBg = 'bg-ink text-canvas group-hover:bg-primary group-hover:text-ink'
                                let extraClass = ''

                                if (isCorrect) {
                                    bgClass = 'bg-primary'
                                    labelBg = 'bg-white text-ink'
                                } else if (isWrong) {
                                    bgClass = 'bg-alert'
                                    labelBg = 'bg-white text-ink'
                                    extraClass = 'animate-shake'
                                }

                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleAnswer(option)}
                                        disabled={!!selectedAnswer}
                                        className={`group relative w-full text-left outline-none focus:outline-none ${extraClass} ${!selectedAnswer ? 'transition-transform active:translate-y-1 active:shadow-none hover:-translate-y-1 hover:shadow-hard' : ''
                                            }`}
                                    >
                                        <div className="absolute inset-0 bg-ink translate-x-1 translate-y-1" />
                                        <div className={`relative flex items-center gap-4 ${bgClass} border-3 border-ink p-4 transition-colors`}>
                                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center font-mono text-lg font-bold border-2 border-ink transition-colors ${labelBg}`}>
                                                {letterLabels[i]}
                                            </div>
                                            <span className="font-sans text-lg font-bold text-ink">{option}</span>
                                            {isCorrect && (
                                                <span className="material-symbols-outlined ml-auto text-2xl animate-bounce">check_circle</span>
                                            )}
                                            {isWrong && (
                                                <span className="material-symbols-outlined ml-auto text-2xl">close</span>
                                            )}
                                        </div>
                                    </button>
                                )
                            })}
                        </div>

                        {/* Hint */}
                        {selectedAnswer && question.hint && (
                            <div className="border-3 border-ink border-dashed bg-highlight/10 p-4 font-mono text-sm">
                                <span className="font-bold">HINT:</span> {question.hint}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-paper-accent border-t-[4px] border-ink p-3 flex justify-between items-center font-mono text-xs uppercase tracking-wider text-ink/70">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span>QUIZ_ACTIVE</span>
                        </div>
                        <span>PTS: {question.points_value || 20}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
