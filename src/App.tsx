import { BrowserRouter, Routes, Route } from "react-router"
import ExamsPage from "./pages/ExamsPage"
import ExamReviewPage from "./pages/ExamReviewPage"
import ExamTakingPage from "./pages/ExamTakingPage"

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<ExamsPage />} />
          <Route path="/exam/:examId/review" element={<ExamReviewPage />} />
          <Route path="/exam/:examId/take" element={<ExamTakingPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
