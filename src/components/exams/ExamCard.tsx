import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card"
import { Button } from "../ui/button"
import type { Exam } from "../../types/exam"
import { useNavigate } from "react-router"

interface ExamCardProps {
  exam: Exam
}

export function ExamCard({ exam }: ExamCardProps) {
  const navigate = useNavigate()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{exam.title}</CardTitle>
        <CardDescription>{exam.questions.length} questions</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Test your knowledge with this practice exam
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => navigate(`/exam/${exam.id}/review`)}
        >
          Review
        </Button>
        <Button onClick={() => navigate(`/exam/${exam.id}/take`)}>
          Start Exam
        </Button>
      </CardFooter>
    </Card>
  )
}
