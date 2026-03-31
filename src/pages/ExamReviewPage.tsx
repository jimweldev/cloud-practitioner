import { useParams, useNavigate } from "react-router"
import { exams } from "../data/exams"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { ArrowLeft, AlertCircle, Info } from "lucide-react"

export default function ExamReviewPage() {
  const { examId } = useParams()
  const navigate = useNavigate()
  const exam = exams.find((e) => e.id === examId)

  if (!exam) {
    return <div>Exam not found</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Exams
      </Button>

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

                    return (
                      <div key={option.id} className="space-y-1">
                        <div
                          className={`rounded-lg border p-3 ${
                            isCorrect
                              ? "border-green-200 bg-green-50 dark:bg-green-950/20"
                              : isDistractor
                                ? "border-red-200 bg-red-50 dark:bg-red-950/10"
                                : ""
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <span className="mr-2 font-medium">
                                {option.id}.
                              </span>
                              {option.text}
                            </div>
                            <div className="ml-2 flex-shrink-0">
                              {isCorrect && (
                                <span className="text-sm font-medium text-green-600">
                                  ✓ Correct Answer
                                </span>
                              )}
                              {isDistractor && (
                                <span className="flex items-center gap-1 text-sm font-medium text-red-600">
                                  <AlertCircle className="h-3 w-3" />
                                  Distractor
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Show distractor analysis */}
                        {isDistractor && analysis && (
                          <div className="ml-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm dark:bg-amber-950/20">
                            <div className="flex items-start gap-2">
                              <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                              <div className="space-y-1">
                                <p className="font-medium text-amber-800 dark:text-amber-300">
                                  Why this is incorrect:
                                </p>
                                <p className="text-amber-700 dark:text-amber-400">
                                  {analysis.reason}
                                </p>
                                {analysis.isFakeService && (
                                  <div className="mt-1 flex items-center gap-1">
                                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/50 dark:text-red-300">
                                      Not a Real AWS Service
                                    </span>
                                  </div>
                                )}
                                {analysis.isRealButWrongPurpose && (
                                  <div className="mt-1 flex items-center gap-1">
                                    <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/50 dark:text-orange-300">
                                      Real Service, Wrong Purpose
                                    </span>
                                  </div>
                                )}
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

                  {/* Show summary of distractor count */}
                  {hasDistractorAnalysis && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <Info className="h-3 w-3" />
                      <span>
                        ⚠️ Incorrect options are highlighted in red with
                        explanations.
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-8 flex justify-center">
        <Button size="lg" onClick={() => navigate(`/exam/${examId}/take`)}>
          Start Exam
        </Button>
      </div>
    </div>
  )
}
