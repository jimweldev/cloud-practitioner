import { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate } from "react-router"
import { exams } from "../data/exams"
import { Button, buttonVariants } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Checkbox } from "../components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group"
import { Label } from "../components/ui/label"
import {
  ArrowLeft,
  ArrowRight,
  Shuffle,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from "lucide-react"
import { Switch } from "../components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog"

interface QuestionResult {
  questionId: number
  userAnswer: string[]
  isCorrect: boolean
  submitted: boolean
}

export default function ExamTakingPage() {
  const { examId } = useParams()
  const navigate = useNavigate()
  const exam = exams.find((e) => e.id === examId)

  const [randomize, setRandomize] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string[]>>({})
  const [questionResults, setQuestionResults] = useState<
    Record<number, QuestionResult>
  >({})
  const [showRestartDialog, setShowRestartDialog] = useState(false)

  // Use useMemo to create shuffled questions without causing re-renders
  const questions = useMemo(() => {
    if (!exam) return []
    return randomize
      ? // eslint-disable-next-line react-hooks/purity
        [...exam.questions].sort(() => Math.random() - 0.5)
      : exam.questions
  }, [exam, randomize])

  // Initialize results when questions change
  useEffect(() => {
    const initialResults: Record<number, QuestionResult> = {}
    questions.forEach((q) => {
      initialResults[q.id] = {
        questionId: q.id,
        userAnswer: [],
        isCorrect: false,
        submitted: false,
      }
    })
    setQuestionResults(initialResults)
    setAnswers({})
    setCurrentIndex(0)
  }, [questions])

  // If exam doesn't exist, show error
  if (!exam) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="mb-4 text-2xl font-bold">Exam not found</h1>
        <Button onClick={() => navigate("/")}>Back to Exams</Button>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="mb-4 text-2xl font-bold">No questions available</h1>
        <Button onClick={() => navigate("/")}>Back to Exams</Button>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const currentResult = questionResults[currentQuestion?.id]

  // Safety check for currentQuestion
  if (!currentQuestion) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="mb-4 text-2xl font-bold">Question not found</h1>
        <Button onClick={() => navigate("/")}>Back to Exams</Button>
      </div>
    )
  }

  const isMultipleChoice = currentQuestion.correct.length > 1
  const isSubmitted = currentResult?.submitted || false

  const handleAnswer = (value: string) => {
    if (isSubmitted) return // Prevent answers after submission

    if (isMultipleChoice) {
      const currentAnswers = answers[currentQuestion.id] || []
      if (currentAnswers.includes(value)) {
        setAnswers({
          ...answers,
          [currentQuestion.id]: currentAnswers.filter((a) => a !== value),
        })
      } else {
        setAnswers({
          ...answers,
          [currentQuestion.id]: [...currentAnswers, value],
        })
      }
    } else {
      setAnswers({
        ...answers,
        [currentQuestion.id]: [value],
      })
    }
  }

  const handleSubmitQuestion = () => {
    const userAnswer = answers[currentQuestion.id] || []
    const isCorrect =
      userAnswer.length === currentQuestion.correct.length &&
      userAnswer.every((a) => currentQuestion.correct.includes(a))

    setQuestionResults({
      ...questionResults,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        userAnswer: userAnswer,
        isCorrect: isCorrect,
        submitted: true,
      },
    })
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentIndex((i) => Math.max(0, i - 1))
  }

  const restartExam = () => {
    // Reset all state
    setAnswers({})
    setCurrentIndex(0)
    setShowRestartDialog(false)

    // Reset question results
    const initialResults: Record<number, QuestionResult> = {}
    questions.forEach((q) => {
      initialResults[q.id] = {
        questionId: q.id,
        userAnswer: [],
        isCorrect: false,
        submitted: false,
      }
    })
    setQuestionResults(initialResults)
  }

  // Check if current question is answered
  const isCurrentQuestionAnswered = () => {
    return answers[currentQuestion.id] && answers[currentQuestion.id].length > 0
  }

  // Calculate progress
  const answeredCount = Object.values(questionResults).filter(
    (r) => r.submitted
  ).length
  const correctCount = Object.values(questionResults).filter(
    (r) => r.isCorrect
  ).length

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="container mx-auto max-w-3xl py-4 sm:px-6 sm:py-8">
        {/* Header with Restart Button - Mobile Optimized */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-2 sm:justify-start">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Exit
            </Button>

            <AlertDialog
              open={showRestartDialog}
              onOpenChange={setShowRestartDialog}
            >
              <AlertDialogTrigger
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Restart
              </AlertDialogTrigger>
              <AlertDialogContent className="w-[90%] max-w-md rounded-lg">
                <AlertDialogHeader>
                  <AlertDialogTitle>Restart Exam?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will reset all your answers and progress. Are you sure
                    you want to continue?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                  <AlertDialogCancel className="w-full sm:w-auto">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={restartExam}
                    className="w-full sm:w-auto"
                  >
                    Restart
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <div className="text-sm whitespace-nowrap">
              <span className="font-medium text-green-600">
                {correctCount} correct
              </span>
              <span className="mx-1">/</span>
              <span className="font-medium">{answeredCount} answered</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="randomize"
                checked={randomize}
                onCheckedChange={setRandomize}
                disabled={answeredCount > 0}
              />
              <Label
                htmlFor="randomize"
                className="flex cursor-pointer items-center gap-1 text-sm"
              >
                <Shuffle className="h-4 w-4" /> Randomize
              </Label>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="mb-2 flex justify-between text-xs text-muted-foreground sm:text-sm">
            <span>
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span>
              {Math.round((answeredCount / questions.length) * 100)}% Complete
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-secondary">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{
                width: `${(answeredCount / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question Card */}
        <Card className="overflow-hidden">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg sm:text-xl">
                  {currentQuestion.question}
                </CardTitle>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  {isMultipleChoice
                    ? "Select all that apply"
                    : "Select one answer"}
                </p>
              </div>
              {isSubmitted && (
                <div
                  className={`flex items-center self-start ${
                    currentResult.isCorrect ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {currentResult.isCorrect ? (
                    <>
                      <CheckCircle2 className="mr-1 h-5 w-5 sm:h-6 sm:w-6" />
                      <span className="text-sm font-medium sm:text-base">
                        Correct!
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-1 h-5 w-5 sm:h-6 sm:w-6" />
                      <span className="text-sm font-medium sm:text-base">
                        Incorrect
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            {/* Options */}
            {isMultipleChoice ? (
              <div className="space-y-3 sm:space-y-4">
                {currentQuestion.options.map((option) => {
                  const isSelected =
                    answers[currentQuestion.id]?.includes(option.id) || false
                  const isCorrect = currentQuestion.correct.includes(option.id)

                  let optionClass =
                    "flex items-start space-x-3 p-3 rounded-lg border transition-colors"

                  if (isSubmitted) {
                    if (isCorrect) {
                      optionClass +=
                        " border-green-200 bg-green-50 dark:bg-green-950/20"
                    } else if (isSelected && !isCorrect) {
                      optionClass +=
                        " border-red-200 bg-red-50 dark:bg-red-950/20"
                    }
                  }

                  return (
                    <div key={option.id} className={optionClass}>
                      <Checkbox
                        id={`${currentQuestion.id}-${option.id}`}
                        checked={isSelected}
                        onCheckedChange={() => handleAnswer(option.id)}
                        disabled={isSubmitted}
                        className="mt-0.5"
                      />
                      <Label
                        htmlFor={`${currentQuestion.id}-${option.id}`}
                        className={`flex-1 cursor-pointer text-sm sm:text-base ${
                          isSubmitted ? "cursor-default" : ""
                        }`}
                      >
                        <span className="mr-2 font-medium">{option.id}.</span>
                        <span className="wrap-break-word">{option.text}</span>
                        {isSubmitted && isCorrect && (
                          <span className="ml-2 block text-xs font-medium text-green-600 sm:inline">
                            (Correct answer)
                          </span>
                        )}
                      </Label>
                    </div>
                  )
                })}
              </div>
            ) : (
              <RadioGroup
                value={answers[currentQuestion.id]?.[0] || ""}
                onValueChange={handleAnswer}
                className="space-y-3 sm:space-y-2"
                disabled={isSubmitted}
              >
                {currentQuestion.options.map((option) => {
                  const isSelected =
                    answers[currentQuestion.id]?.[0] === option.id
                  const isCorrect = currentQuestion.correct.includes(option.id)

                  let optionClass =
                    "flex items-start space-x-3 p-3 rounded-lg border transition-colors"

                  if (isSubmitted) {
                    if (isCorrect) {
                      optionClass +=
                        " border-green-200 bg-green-50 dark:bg-green-950/20"
                    } else if (isSelected && !isCorrect) {
                      optionClass +=
                        " border-red-200 bg-red-50 dark:bg-red-950/20"
                    }
                  }

                  return (
                    <Label
                      key={option.id}
                      className={`cursor-pointer ${optionClass}`}
                      htmlFor={`${currentQuestion.id}-${option.id}`}
                    >
                      <RadioGroupItem
                        value={option.id}
                        id={`${currentQuestion.id}-${option.id}`}
                        disabled={isSubmitted}
                        className="mt-0.5"
                      />
                      <span
                        className={`flex-1 text-sm sm:text-base ${
                          isSubmitted ? "cursor-default" : ""
                        }`}
                      >
                        <span className="mr-2 font-medium">{option.id}.</span>
                        <span className="wrap-break-word">{option.text}</span>
                        {isSubmitted && isCorrect && (
                          <span className="ml-2 block text-xs font-medium text-green-600 sm:inline">
                            (Correct answer)
                          </span>
                        )}
                      </span>
                    </Label>
                  )
                })}
              </RadioGroup>
            )}

            {/* Action Buttons - Mobile Optimized */}
            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:justify-between sm:gap-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="order-2 w-full sm:order-1 sm:w-auto"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>

              <div className="order-1 flex w-full flex-col gap-2 sm:order-2 sm:w-auto sm:flex-row">
                {!isSubmitted ? (
                  <Button
                    onClick={handleSubmitQuestion}
                    disabled={!isCurrentQuestionAnswered()}
                    className="w-full bg-green-600 hover:bg-green-700 sm:w-auto"
                  >
                    Submit Answer
                  </Button>
                ) : null}

                {currentIndex < questions.length - 1 ? (
                  <Button
                    onClick={handleNext}
                    disabled={!isSubmitted}
                    className="w-full sm:w-auto"
                  >
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  isSubmitted && (
                    <Button
                      onClick={() => navigate("/")}
                      className="w-full sm:w-auto"
                    >
                      Finish Review
                    </Button>
                  )
                )}
              </div>
            </div>

            {/* Question navigation dots */}
            <div className="mt-6 border-t pt-4 sm:mt-8">
              <div className="grid grid-cols-5 gap-2 sm:flex sm:flex-wrap">
                {questions.map((question, index) => {
                  const result = questionResults[question.id]
                  const isAnswered = result?.submitted || false
                  const isCorrect = result?.isCorrect || false

                  let dotClass =
                    "h-10 w-full sm:h-8 sm:w-8 rounded-md sm:rounded-full text-xs sm:text-sm font-medium transition-colors "

                  if (index === currentIndex) {
                    dotClass += "ring-2 ring-primary ring-offset-2 "
                  }

                  if (isAnswered) {
                    if (isCorrect) {
                      dotClass += "bg-green-500 text-white hover:bg-green-600"
                    } else {
                      dotClass += "bg-red-500 text-white hover:bg-red-600"
                    }
                  } else {
                    dotClass +=
                      "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={dotClass}
                      title={`Question ${index + 1}${isAnswered ? (isCorrect ? " - Correct" : " - Incorrect") : " - Not answered"}`}
                    >
                      {index + 1}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Summary when all questions are answered */}
            {answeredCount === questions.length && (
              <div className="mt-6 rounded-lg bg-primary/10 p-4">
                <h3 className="mb-2 font-semibold">Exam Summary</h3>
                <p className="text-sm">
                  You got{" "}
                  <span className="font-bold text-green-600">
                    {correctCount}
                  </span>{" "}
                  out of <span className="font-bold">{questions.length}</span>{" "}
                  questions correct (
                  {Math.round((correctCount / questions.length) * 100)}%)
                </p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={restartExam}
                    className="w-full sm:w-auto"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" /> Restart Exam
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate("/")}
                    className="w-full sm:w-auto"
                  >
                    Back to Exams
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
