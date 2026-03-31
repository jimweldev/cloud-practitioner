export interface Option {
  id: string
  text: string
}

export interface DistractorAnalysis {
  /** Why this option is incorrect */
  reason: string
  /** Whether this is a completely fake/non-existent AWS service */
  isFakeService: boolean
  /** Whether this is a real AWS service but used for the wrong purpose */
  isRealButWrongPurpose: boolean
  /** Optional: The correct service that should be used instead */
  correctAlternative?: string
}

export interface Question {
  id: number
  question: string
  options: Option[]
  correct: string[]
  /** Optional: Analysis for distractor options to help learners understand why incorrect answers are wrong */
  distractorAnalysis?: {
    [optionId: string]: DistractorAnalysis
  }
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
