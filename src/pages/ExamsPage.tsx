import { ExamList } from "../components/exams/ExamList"

export default function ExamsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">Available Exams</h1>
      <ExamList />
    </div>
  )
}
