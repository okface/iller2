// Quiz selection and session management

class QuizSession {
  constructor(questions, options = {}) {
    this.all = questions;
    this.filtered = options.categories && options.categories.length
      ? questions.filter(q => options.categories.includes(q.category))
      : questions;
    this.randomizeOrder();
    this.index = 0;
    this.current = this.filtered[this.index] || null;
    this.correctCount = 0;
    this.answered = 0;
  }

  randomizeOrder() { this.filtered = [...this.filtered].sort(() => Math.random() - 0.5); }

  answer(optionIndex) {
    if (!this.current) return { done:true };
    const isCorrect = optionIndex === this.current.correct;
    this.answered++;
    if (isCorrect) this.correctCount++;
    const question = this.current;
    return { isCorrect, question };
  }

  next() {
    this.index++;
    this.current = this.filtered[this.index] || null;
    return this.current;
  }

  progress() {
    return this.filtered.length ? (this.answered / this.filtered.length) : 0;
  }
}

export { QuizSession };
