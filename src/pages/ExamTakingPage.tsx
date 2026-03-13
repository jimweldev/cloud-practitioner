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
      <div className="container mx-auto py-8 text-center">
        <h1 className="mb-4 text-2xl font-bold">Exam not found</h1>
        <Button onClick={() => navigate("/")}>Back to Exams</Button>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="container mx-auto py-8 text-center">
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
      <div className="container mx-auto py-8 text-center">
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
    <div className="container mx-auto max-w-3xl py-8">
      {/* Header with Restart Button */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate("/")}>
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
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Restart Exam?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset all your answers and progress. Are you sure
                  you want to continue?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={restartExam}>
                  Restart
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm">
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
              className="flex cursor-pointer items-center gap-1"
            >
              <Shuffle className="h-4 w-4" /> Randomize
            </Label>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="mb-2 flex justify-between text-sm text-muted-foreground">
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
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl">
                {currentQuestion.question}
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {isMultipleChoice
                  ? "Select all that apply"
                  : "Select one answer"}
              </p>
            </div>
            {isSubmitted && (
              <div
                className={`ml-4 flex items-center ${
                  currentResult.isCorrect ? "text-green-600" : "text-red-600"
                }`}
              >
                {currentResult.isCorrect ? (
                  <>
                    <CheckCircle2 className="mr-1 h-6 w-6" />
                    <span className="font-medium">Correct!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="mr-1 h-6 w-6" />
                    <span className="font-medium">Incorrect</span>
                  </>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Options */}
          {isMultipleChoice ? (
            <div className="space-y-4">
              {currentQuestion.options.map((option) => {
                const isSelected =
                  answers[currentQuestion.id]?.includes(option.id) || false
                const isCorrect = currentQuestion.correct.includes(option.id)

                let optionClass =
                  "flex items-center space-x-2 p-3 rounded-lg border transition-colors"

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
                    />
                    <Label
                      htmlFor={`${currentQuestion.id}-${option.id}`}
                      className={`flex-1 cursor-pointer text-base ${
                        isSubmitted ? "cursor-default" : ""
                      }`}
                    >
                      <span className="mr-2 font-medium">{option.id}.</span>
                      {option.text}
                      {isSubmitted && isCorrect && (
                        <span className="ml-2 text-xs font-medium text-green-600">
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
              className="space-y-2"
              disabled={isSubmitted}
            >
              {currentQuestion.options.map((option) => {
                const isSelected =
                  answers[currentQuestion.id]?.[0] === option.id
                const isCorrect = currentQuestion.correct.includes(option.id)

                let optionClass =
                  "flex items-center space-x-2 p-3 rounded-lg border transition-colors"

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
                    />
                    <span
                      className={`flex-1 text-base ${
                        isSubmitted ? "cursor-default" : ""
                      }`}
                    >
                      <span className="mr-2 font-medium">{option.id}.</span>
                      {option.text}
                      {isSubmitted && isCorrect && (
                        <span className="ml-2 text-xs font-medium text-green-600">
                          (Correct answer)
                        </span>
                      )}
                    </span>
                  </Label>
                )
              })}
            </RadioGroup>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              Previous
            </Button>

            <div className="flex gap-2">
              {!isSubmitted ? (
                <Button
                  onClick={handleSubmitQuestion}
                  disabled={!isCurrentQuestionAnswered()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Submit Answer
                </Button>
              ) : null}

              {currentIndex < questions.length - 1 ? (
                <Button onClick={handleNext} disabled={!isSubmitted}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                isSubmitted && (
                  <Button onClick={() => navigate("/")}>Finish Review</Button>
                )
              )}
            </div>
          </div>

          {/* Question navigation dots */}
          <div className="mt-8 flex flex-wrap gap-2 border-t pt-4">
            {questions.map((question, index) => {
              const result = questionResults[question.id]
              const isAnswered = result?.submitted || false
              const isCorrect = result?.isCorrect || false

              let dotClass =
                "h-8 w-8 rounded-full text-xs font-medium transition-colors "

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

          {/* Summary when all questions are answered */}
          {answeredCount === questions.length && (
            <div className="mt-6 rounded-lg bg-primary/10 p-4">
              <h3 className="mb-2 font-semibold">Exam Summary</h3>
              <p className="text-sm">
                You got{" "}
                <span className="font-bold text-green-600">{correctCount}</span>{" "}
                out of <span className="font-bold">{questions.length}</span>{" "}
                questions correct (
                {Math.round((correctCount / questions.length) * 100)}%)
              </p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={restartExam}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Restart Exam
                </Button>
                <Button size="sm" onClick={() => navigate("/")}>
                  Back to Exams
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
