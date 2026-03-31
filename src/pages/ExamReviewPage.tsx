import { useParams, useNavigate } from "react-router"
import { useState } from "react"
import { exams } from "../data/exams"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import {
  ArrowLeft,
  AlertCircle,
  Info,
  Eye,
  EyeOff,
  XCircle,
} from "lucide-react"
import { Switch } from "../components/ui/switch"
import { Label } from "../components/ui/label"

export default function ExamReviewPage() {
  const { examId } = useParams()
  const navigate = useNavigate()
  const exam = exams.find((e) => e.id === examId)
  const [showDistractors, setShowDistractors] = useState(true)

  if (!exam) {
    return <div>Exam not found</div>
  }

  // Check if any question has distractor analysis
  const hasAnyDistractors = exam.questions.some(
    (q) => q.distractorAnalysis && Object.keys(q.distractorAnalysis).length > 0
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Exams
        </Button>

        {hasAnyDistractors && (
          <div className="flex items-center gap-3 rounded-lg border bg-card p-2 px-4">
            <div className="flex items-center gap-2">
              {showDistractors ? (
                <Eye className="h-4 w-4 text-primary" />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              )}
              <Label
                htmlFor="distractor-toggle"
                className="cursor-pointer text-sm"
              >
                Show Distractor Explanations
              </Label>
              <Switch
                id="distractor-toggle"
                checked={showDistractors}
                onCheckedChange={setShowDistractors}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {showDistractors ? "Explanations visible" : "Hidden"}
            </div>
          </div>
        )}
      </div>

      <h1 className="mb-2 text-3xl font-bold">{exam.title} - Review</h1>
      <p className="mb-8 text-muted-foreground">
        Review all questions before starting
      </p>

      <div className="space-y-4">
        {exam.questions.map((question, index) => {
          const hasDistractorAnalysis =
            question.distractorAnalysis &&
            Object.keys(question.distractorAnalysis).length > 0

          return (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  Question {index + 1}: {question.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Options */}
                  {question.options.map((option) => {
                    const isCorrect = question.correct.includes(option.id)
                    const analysis = question.distractorAnalysis?.[option.id]
                    const isDistractor = !isCorrect && analysis
                    const shouldShowAnalysis = showDistractors && isDistractor

                    return (
                      <div key={option.id} className="space-y-1">
                        <div
                          className={`rounded-lg border p-3 transition-colors ${
                            isCorrect
                              ? "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
                              : isDistractor
                                ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/20"
                                : "border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <span
                                className={`mr-2 font-medium ${
                                  isCorrect
                                    ? "text-green-700 dark:text-green-400"
                                    : isDistractor
                                      ? "text-red-700 dark:text-red-400"
                                      : ""
                                }`}
                              >
                                {option.id}.
                              </span>
                              <span
                                className={
                                  isDistractor
                                    ? "text-red-800 dark:text-red-300"
                                    : ""
                                }
                              >
                                {option.text}
                              </span>
                            </div>
                            <div className="ml-2 flex-shrink-0">
                              {isCorrect && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/50 dark:text-green-300">
                                  ✓ Correct Answer
                                </span>
                              )}
                              {isDistractor && !showDistractors && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/50 dark:text-red-300">
                                  <XCircle className="h-3 w-3" />
                                  Incorrect
                                </span>
                              )}
                              {isDistractor && showDistractors && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/50 dark:text-red-300">
                                  <AlertCircle className="h-3 w-3" />
                                  Distractor
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Show distractor analysis when toggle is on */}
                        {shouldShowAnalysis && analysis && (
                          <div className="ml-6 rounded-lg border-l-4 border-l-amber-500 bg-amber-50 p-3 text-sm dark:bg-amber-950/20">
                            <div className="flex items-start gap-2">
                              <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                              <div className="space-y-1.5">
                                <p className="font-semibold text-amber-800 dark:text-amber-300">
                                  Why this is incorrect:
                                </p>
                                <p className="text-amber-700 dark:text-amber-400">
                                  {analysis.reason}
                                </p>
                                <div className="mt-1 flex flex-wrap gap-2">
                                  {analysis.isFakeService && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/50 dark:text-red-300">
                                      🚫 Not a Real AWS Service
                                    </span>
                                  )}
                                  {analysis.isRealButWrongPurpose && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/50 dark:text-orange-300">
                                      ⚠️ Real Service, Wrong Purpose
                                    </span>
                                  )}
                                </div>
                                {analysis.correctAlternative && (
                                  <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                                    💡{" "}
                                    <span className="font-medium">
                                      Correct alternative:
                                    </span>{" "}
                                    {analysis.correctAlternative}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Show summary based on toggle state */}
                  {hasDistractorAnalysis && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted/50 p-2 text-xs text-muted-foreground">
                      <Info className="h-3 w-3 flex-shrink-0" />
                      {showDistractors ? (
                        <span>
                          ✅ Incorrect options are highlighted in{" "}
                          <span className="font-medium text-red-600">red</span>{" "}
                          with detailed explanations.
                        </span>
                      ) : (
                        <span>
                          🔍 Distractor explanations are hidden. Toggle on to
                          see why incorrect options are wrong.
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Button size="lg" onClick={() => navigate(`/exam/${examId}/take`)}>
          Start Exam
        </Button>
        {hasAnyDistractors && (
          <Button
            size="lg"
            variant="outline"
            onClick={() => setShowDistractors(!showDistractors)}
          >
            {showDistractors ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Hide Explanations
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Show Explanations
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
