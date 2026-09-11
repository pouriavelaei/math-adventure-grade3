(function () {
  "use strict";

  const questions = [
    { type: "ضرب مستقیم", text: "حاصل ۲ × ۳ کدام است؟", options: [5, 6, 8, 9], answer: 6, explanation: "۲ × ۳ یعنی ۳ + ۳؛ پس جواب ۶ است." },
    { type: "تشخیص حاصل ضرب", text: "حاصل ۴ × ۵ کدام است؟", options: [9, 15, 20, 25], answer: 20, explanation: "۴ گروه ۵تایی داریم: ۵ + ۵ + ۵ + ۵ = ۲۰." },
    { type: "جمع تکراری", text: "عبارت ۳ + ۳ + ۳ + ۳ به کدام ضرب تبدیل می‌شود؟", options: ["۳ × ۳", "۳ × ۴", "۴ × ۴", "۲ × ۶"], answer: "۳ × ۴", explanation: "عدد ۳ چهار بار تکرار شده است؛ پس ۳ × ۴ می‌شود." },
    { type: "داستانی", text: "در ۴ جعبه، داخل هر جعبه ۳ مداد قرار دارد. در مجموع چند مداد داریم؟", options: [7, 10, 12, 14], answer: 12, explanation: "۴ جعبه ۳تایی یعنی ۳ + ۳ + ۳ + ۳ = ۱۲ مداد." },
    { type: "ضرب مستقیم", text: "حاصل ۶ × ۲ کدام است؟", options: [8, 10, 12, 14], answer: 12, explanation: "۶ گروه ۲تایی داریم: ۲ + ۲ + ۲ + ۲ + ۲ + ۲ = ۱۲." },
    { type: "داستانی", text: "هر دوچرخه ۲ چرخ دارد. ۵ دوچرخه چند چرخ دارند؟", options: [7, 8, 10, 12], answer: 10, explanation: "۵ دوچرخه و برای هرکدام ۲ چرخ: ۵ × ۲ = ۱۰." },
    { type: "تشخیص حاصل ضرب", text: "کدام گزینه حاصل ۷ × ۳ است؟", options: [18, 20, 21, 24], answer: 21, explanation: "۷ × ۳ یعنی ۳ + ۳ + ۳ + ۳ + ۳ + ۳ + ۳ = ۲۱." },
    { type: "جمع تکراری", text: "حاصل ۴ + ۴ + ۴ + ۴ + ۴ کدام است؟", options: [16, 18, 20, 24], answer: 20, explanation: "عدد ۴ پنج بار آمده است؛ ۵ × ۴ = ۲۰." },
    { type: "داستانی", text: "در یک باغ ۳ ردیف گل هست و در هر ردیف ۶ گل قرار دارد. چند گل در باغ است؟", options: [12, 15, 18, 24], answer: 18, explanation: "۳ ردیف ۶تایی یعنی ۳ × ۶ = ۱۸ گل." },
    { type: "چالش نهایی", text: "حاصل ۸ × ۴ کدام است؟", options: [24, 28, 32, 36], answer: 32, explanation: "۸ گروه ۴تایی داریم: ۴ + ۴ + ۴ + ۴ + ۴ + ۴ + ۴ + ۴ = ۳۲." }
  ];

  const $ = (id) => document.getElementById(id);
  const screens = { start: $("start-screen"), game: $("game-screen"), result: $("result-screen") };
  const state = { index: 0, score: 0, correct: 0, wrong: 0, lives: 3, answered: false };
  const persianDigits = (value) => String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[digit]);
  const formatValue = (value) => typeof value === "number" ? persianDigits(value) : value;

  function readBestScore() {
    try { return Number.parseInt(localStorage.getItem("multiplication-adventure-best") || "0", 10) || 0; }
    catch (error) { return 0; }
  }

  function saveBestScore(score) {
    try {
      if (score > readBestScore()) localStorage.setItem("multiplication-adventure-best", String(score));
    } catch (error) { /* بازی بدون localStorage نیز باید کار کند. */ }
  }

  function updateBestScore() { $("best-score").textContent = persianDigits(readBestScore()); }
  function showScreen(screen) {
    Object.values(screens).forEach((item) => item.classList.add("hidden"));
    screen.classList.remove("hidden");
  }

  function updateHeader() {
    const number = state.index + 1;
    $("question-counter").textContent = `سؤال ${persianDigits(number)} از ${persianDigits(questions.length)}`;
    $("score").textContent = persianDigits(state.score);
    $("progress-bar").style.width = `${(number / questions.length) * 100}%`;
    const progress = document.querySelector('[role="progressbar"]');
    progress.setAttribute("aria-valuenow", String(number));
    const lifeText = "❤️ ".repeat(state.lives).trim() || "—";
    $("lives").textContent = lifeText;
    $("lives").setAttribute("aria-label", `${persianDigits(state.lives)} جان باقی مانده`);
  }

  function renderQuestion() {
    const question = questions[state.index];
    state.answered = false;
    updateHeader();
    $("question-type").textContent = question.type;
    $("question-heading").textContent = question.text;
    $("feedback").hidden = true;
    $("next-button").hidden = true;
    $("answers").innerHTML = "";
    question.options.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "answer-button";
      button.dataset.answer = String(option);
      button.setAttribute("aria-label", `پاسخ ${formatValue(option)}`);
      button.textContent = formatValue(option);
      button.addEventListener("click", () => answerQuestion(button));
      $("answers").appendChild(button);
    });
  }

  function answerQuestion(selectedButton) {
    if (state.answered) return;
    state.answered = true;
    const question = questions[state.index];
    const selected = selectedButton.dataset.answer;
    const isCorrect = selected === String(question.answer);
    document.querySelectorAll(".answer-button").forEach((button) => {
      button.disabled = true;
      if (button.dataset.answer === String(question.answer)) button.classList.add("correct");
    });
    const feedback = $("feedback");
    feedback.hidden = false;
    if (isCorrect) {
      state.correct += 1;
      state.score += 10;
      selectedButton.classList.add("correct");
      feedback.className = "feedback success";
      feedback.textContent = "🎉 آفرین! پاسخ درست است. ۱۰ امتیاز گرفتی.";
    } else {
      state.wrong += 1;
      state.lives = Math.max(0, state.lives - 1);
      selectedButton.classList.add("wrong");
      feedback.className = "feedback error";
      feedback.textContent = `💡 پاسخ درست ${formatValue(question.answer)} است. ${question.explanation}`;
    }
    updateHeader();
    if (state.lives === 0) {
      $("next-button").hidden = true;
      showResult();
      return;
    }
    $("next-button").textContent = state.index === questions.length - 1 ? "دیدن نتیجه 🏆" : "سؤال بعدی ←";
    $("next-button").hidden = false;
  }

  function showResult() {
    saveBestScore(state.score);
    updateBestScore();
    const rate = Math.round((state.correct / questions.length) * 100);
    $("final-score").textContent = persianDigits(state.score);
    $("correct-count").textContent = persianDigits(state.correct);
    $("wrong-count").textContent = persianDigits(state.wrong);
    $("remaining-lives").textContent = persianDigits(state.lives);
    $("success-rate").textContent = `${persianDigits(rate)}٪`;
    $("result-message").textContent = state.lives === 0
      ? "💫 جان‌هایت تمام شد، اما هر تمرین تو را قوی‌تر می‌کند!"
      : rate >= 90 ? "🏆 فوق‌العاده بود! تو قهرمان ضرب هستی!"
      : rate >= 70 ? "⭐ خیلی خوب بود! با کمی تمرین بیشتر عالی می‌شوی."
      : rate >= 50 ? "💪 تلاش خوبی کردی! چند بار دیگر تمرین کن."
      : "🌱 اشکالی ندارد! دوباره بازی کن و مهارتت را تقویت کن.";
    $("result-icon").textContent = state.lives === 0 ? "💫" : rate >= 90 ? "🏆" : "🌟";
    showScreen(screens.result);
  }

  function startGame() {
    Object.assign(state, { index: 0, score: 0, correct: 0, wrong: 0, lives: 3 });
    showScreen(screens.game);
    renderQuestion();
  }

  $("start-button").addEventListener("click", startGame);
  $("restart-button").addEventListener("click", startGame);
  $("next-button").addEventListener("click", () => {
    if (!state.answered || state.lives === 0) return;
    if (state.index === questions.length - 1) showResult();
    else { state.index += 1; renderQuestion(); }
  });
  updateBestScore();
})();
