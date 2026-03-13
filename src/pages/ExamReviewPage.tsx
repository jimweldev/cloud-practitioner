import { useParams, useNavigate } from "react-router"
import { exams } from "../data/exams"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { ArrowLeft } from "lucide-react"

export default function ExamReviewPage() {
  const { examId } = useParams()
  const navigate = useNavigate()
  const exam = exams.find((e) => e.id === examId)

  if (!exam) {
    return <div>Exam not found</div>
  }

  return (
    <div className="container mx-auto py-8">
      <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Exams
      </Button>

      <h1 className="mb-2 text-3xl font-bold">{exam.title} - Review</h1>
      <p className="mb-8 text-muted-foreground">
        Review all questions before starting
      </p>

      <div className="space-y-4">
        {exam.questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="text-lg">
                Question {index + 1}: {question.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {question.options.map((option) => (
                  <div
                    key={option.id}
                    className={`rounded-lg border p-3 ${
                      question.correct.includes(option.id)
                        ? "border-green-200 bg-green-50 dark:bg-green-950/20"
                        : ""
                    }`}
                  >
                    <span className="mr-2 font-medium">{option.id}.</span>
                    {option.text}
                    {question.correct.includes(option.id) && (
                      <span className="ml-2 text-sm text-green-600">
                        (Correct)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Button size="lg" onClick={() => navigate(`/exam/${examId}/take`)}>
          Start Exam
        </Button>
      </div>
    </div>
  )
}
