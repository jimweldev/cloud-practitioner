import { exams } from "../../data/exams"
import { ExamCard } from "./ExamCard"

export function ExamList() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {exams.map((exam) => (
        <ExamCard key={exam.id} exam={exam} />
      ))}
    </div>
  )
}
