import { recordResult, getCategoryStats, overallStats, resetProgress } from './storage.js';
import { QuizSession } from './quizEngine.js';
import { fetchQuestions } from './dataLoader.js';

class AppUI {
  constructor(root) {
    this.root = root;
    this.state = { questions: [], session: null };
    this.templates = {
      start: document.getElementById('start-screen-template'),
      focus: document.getElementById('focus-screen-template'),
      quiz: document.getElementById('quiz-screen-template')
    };
  }

  async init() {
    this.state.questions = await fetchQuestions();
    this.showStart();
  }

  swap(template) {
    this.root.innerHTML = '';
    this.root.appendChild(template.content.cloneNode(true));
  }

  showStart() {
    this.swap(this.templates.start);
    this.renderStats();
    this.root.querySelector('#start-random-btn').onclick = () => this.startQuiz();
    this.root.querySelector('#focus-categories-btn').onclick = () => this.showFocus();
    this.root.querySelector('#reset-progress-btn').onclick = () => { if (confirm('Återställ allt?')) { resetProgress(); this.renderStats(); } };
  }

  renderStats() {
    const stats = overallStats();
    const categories = getCategoryStats();
    const statsGrid = this.root.querySelector('#stats-grid');
    statsGrid.innerHTML = '';

    const card = (title, value, small='') => `<div class="stat"><h3>${title}</h3><div class="value">${value}</div>${small?`<small>${small}</small>`:''}</div>`;

    statsGrid.insertAdjacentHTML('beforeend', card('Totalt', stats.attempts, `Korrekt ${(stats.accuracy*100).toFixed(0)}%`));
    if (categories.length) {
      const weak = categories.slice(0,3);
      statsGrid.insertAdjacentHTML('beforeend', card('Svagaste', weak.map(w=>w.category||'–').join('<br>'), 'Tre lägsta'));    
    }
    statsGrid.insertAdjacentHTML('beforeend', card('Frågor', this.state.questions.length));
  }

  showFocus() {
    this.swap(this.templates.focus);
    const list = this.root.querySelector('#category-list');
    const stats = getCategoryStats();
    const allCats = [...new Set(this.state.questions.map(q=>q.category))].sort();
    const weakest = new Set(stats.slice(0,3).map(s=>s.category));

    allCats.forEach(cat => {
      const categoryStats = stats.find(s=>s.category===cat) || { attempts:0, correct:0, accuracy:0 };
      const acc = categoryStats.accuracy ? Math.round(categoryStats.accuracy*100)+'%' : '–';
      const wrapper = document.createElement('label');
      wrapper.className = 'category-chip'+(weakest.has(cat)?' recommended':'');
      wrapper.innerHTML = `<input type="checkbox" value="${cat}"><span>${cat}</span><span class="accuracy">${acc}</span>`;
      list.appendChild(wrapper);
      wrapper.addEventListener('click', e => {
        if (e.target.tagName !== 'INPUT') {
          const cb = wrapper.querySelector('input');
          cb.checked = !cb.checked;
        }
        wrapper.classList.toggle('selected', wrapper.querySelector('input').checked);
      });
    });
    this.root.querySelector('#back-to-start').onclick = () => this.showStart();
    this.root.querySelector('#start-focused-btn').onclick = () => {
      const selected = Array.from(list.querySelectorAll('input:checked')).map(i=>i.value);
      this.startQuiz(selected);
    };
  }

  startQuiz(categories) {
    this.state.session = new QuizSession(this.state.questions, { categories });
    this.swap(this.templates.quiz);
    this.root.querySelector('#quit-quiz').onclick = () => { if (confirm('Avsluta session?')) this.showStart(); };
    this.nextQuestion();
  }

  nextQuestion() {
    const session = this.state.session;
    const q = session.current;
    const metaEl = this.root.querySelector('#question-meta');
    const textEl = this.root.querySelector('#question-text');
    const listEl = this.root.querySelector('#options-list');
    const feedbackEl = this.root.querySelector('#feedback');
    const nextBtn = this.root.querySelector('#next-question-btn');
    nextBtn.classList.add('hidden');
    feedbackEl.className = 'feedback hidden';

    if (!q) { textEl.textContent = 'Klar!'; listEl.innerHTML=''; metaEl.textContent=''; return; }
    metaEl.textContent = `${q.category}`;
    textEl.textContent = q.question;
    listEl.innerHTML = '';
    q.options.forEach((opt, idx) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerHTML = `<span class="index">${idx+1}</span>${opt}`;
      btn.onclick = () => this.selectAnswer(idx, btn);
      li.appendChild(btn);
      listEl.appendChild(li);
    });
    this.updateProgressBar();
  }

  selectAnswer(idx, button) {
    const session = this.state.session;
    const { isCorrect, question } = session.answer(idx);
    recordResult(question, isCorrect);

    // Disable others
    const optionButtons = Array.from(this.root.querySelectorAll('.option-btn'));
    optionButtons.forEach(b => b.classList.add('disabled'));
    button.classList.remove('disabled');

    // Mark correct/incorrect
    optionButtons.forEach((b,i)=>{
      if (i === question.correct) b.classList.add('correct');
      else if (i === idx) b.classList.add('incorrect');
    });

    const feedbackEl = this.root.querySelector('#feedback');
    feedbackEl.className = 'feedback '+(isCorrect? 'correct':'incorrect');
    feedbackEl.innerHTML = `<strong>${isCorrect? 'Rätt!':'Fel'}</strong><br>${question.more || ''}`;
    const nextBtn = this.root.querySelector('#next-question-btn');
    nextBtn.classList.remove('hidden');
    nextBtn.onclick = () => { session.next(); this.nextQuestion(); };
    this.updateProgressBar();
  }

  updateProgressBar() {
    const session = this.state.session;
    const bar = this.root.querySelector('#session-progress span');
    if (bar) bar.style.width = (session.progress()*100).toFixed(1)+'%';
  }
}

export { AppUI };
