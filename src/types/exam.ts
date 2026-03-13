export interface Option {
  id: string
  text: string
}

export interface Question {
  id: number
  question: string
  options: Option[]
  correct: string[]
}

export interface Exam {
  id: string
  title: string
  questions: Question[]
}

export interface UserAnswer {
  questionId: number
  selectedOptions: string[]
  isCorrect?: boolean
}
