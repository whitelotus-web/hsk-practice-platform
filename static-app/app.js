(function () {
  const data = window.HSK_DATA;
  const saved = JSON.parse(localStorage.getItem("hsk-platform-state") || "{}");

  const state = {
    locale: "vi",
    level: saved.level || 1,
    skill: saved.skill || "listening",
    view: saved.view || "overview",
    plan: saved.plan || "Free",
    profileOpen: false,
    selectedQuestion: saved.selectedQuestion || 0,
    selectedAnswer: saved.selectedAnswer || "",
    analysisOpen: Boolean(saved.analysisOpen),
    notes: saved.notes || [],
    savedItems: saved.savedItems || [],
    wrongItems: saved.wrongItems || [],
    vocabProgress: saved.vocabProgress || {},
    vocabDue: saved.vocabDue || {},
    essay: saved.essay || "",
    essayFeedback: saved.essayFeedback || null,
    productiveDrafts: saved.productiveDrafts || {},
    productiveFeedback: saved.productiveFeedback || {},
    recordingStatus: "idle",
    contentWorkflow: saved.contentWorkflow || {},
    contentStatusFilter: saved.contentStatusFilter || "all",
    pwaInstallPrompt: null,
    pwaMessage: "",
    isStandalone: window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator.standalone === true,
    isOnline: navigator.onLine,
    customContent: {
      practiceQuestions: saved.customContent?.practiceQuestions || [],
      vocab: saved.customContent?.vocab || [],
      mockQuestions: saved.customContent?.mockQuestions || [],
      mockSets: saved.customContent?.mockSets || [],
    },
    customTranslations: saved.customTranslations || {},
    contentJson: "",
    contentMessage: "",
    mockStarted: false,
    mockSubmitted: Boolean(saved.mockSubmitted),
    mockSeconds: saved.mockSeconds || 40 * 60,
    mockAnswers: saved.mockAnswers || {},
    activeMockQuestion: saved.activeMockQuestion || 1,
    repoFilter: saved.repoFilter || "all",
    repoTab: saved.repoTab || "overview",
    authTab: saved.authTab || "login",
    authMessage: saved.authMessage || "",
    accountPanel: saved.accountPanel || slug(data.accountModules[0]?.[0]) || "profile",
    accountMessage: saved.accountMessage || "",
    examInfoLevel: saved.examInfoLevel || saved.level || 1,
    testPlanYear: saved.testPlanYear || "2026",
    regulationTopic: saved.regulationTopic || "registration",
    tutoringMessage: saved.tutoringMessage || "",
  };

  let speechRecorder = null;
  let speechStream = null;
  let speechChunks = [];
  let recordedAudioUrl = "";

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.pwaInstallPrompt = event;
    state.pwaMessage = "Ứng dụng đã sẵn sàng để cài lên thiết bị.";
    render();
  });

  window.addEventListener("online", () => {
    state.isOnline = true;
    state.pwaMessage = "Đã kết nối lại. Nội dung mới có thể đồng bộ.";
    render();
  });

  window.addEventListener("offline", () => {
    state.isOnline = false;
    state.pwaMessage = "Đang ngoại tuyến. Các màn hình đã cache vẫn có thể mở lại.";
    render();
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./sw.js")
        .then(() => {
          state.pwaMessage = state.pwaMessage || "Đã bật cache nền cho trải nghiệm mobile/PWA.";
          render();
        })
        .catch((error) => {
          state.pwaMessage = `Không đăng ký được PWA cache: ${error.message}`;
          render();
        });
    });
  }

  mergeCustomContent();

  const views = [
    ["overview", "overview"],
    ["practice", "practice"],
    ["mock", "mock"],
    ["writing", "writing"],
    ["vocab", "vocab"],
    ["repository", "repository"],
    ["exam", "aboutTest"],
    ["schedule", "testPlan"],
    ["regulation", "testRegulation"],
    ["app", "downloadApp"],
    ["tutoring", "tutoring"],
    ["account", "account"],
    ["content", "content"],
    ["pricing", "pricing"],
    ["system", "system"],
    ["corporate", "corporate"],
    ["auth", "auth"],
  ];

  function mergeCustomContent() {
    const existingQuestions = new Set(data.practiceQuestions.map((item) => item.id));
    for (const item of state.customContent.practiceQuestions || []) {
      if (item && item.id && !existingQuestions.has(item.id)) {
        data.practiceQuestions.push(item);
        existingQuestions.add(item.id);
      }
    }

    const existingVocab = new Set(data.vocab.map((item) => item.hanzi));
    for (const item of state.customContent.vocab || []) {
      if (item && item.hanzi && !existingVocab.has(item.hanzi)) {
        data.vocab.push(item);
        existingVocab.add(item.hanzi);
      }
    }

    const existingMockQuestions = new Set(data.mockQuestions.map((item) => item.id));
    for (const item of state.customContent.mockQuestions || []) {
      if (item && item.id && !existingMockQuestions.has(item.id)) {
        data.mockQuestions.push(item);
        existingMockQuestions.add(item.id);
      }
    }

    const existingMockSets = new Set(data.mockSets.map((item) => item.id));
    for (const item of state.customContent.mockSets || []) {
      if (item && item.id && !existingMockSets.has(item.id)) {
        data.mockSets.push(item);
        existingMockSets.add(item.id);
      }
    }

    Object.entries(state.customTranslations || {}).forEach(([locale, messages]) => {
      if (!data.dict[locale]) data.dict[locale] = {};
      Object.assign(data.dict[locale], messages || {});
    });
  }

  function t(key, fallback = "") {
    const localeDict = data.dict[state.locale] || {};
    const fallbackDict = data.dict[data.fallbackLocale || "en"] || {};
    const sourceDict = data.dict[data.sourceLocale || "vi"] || {};
    return localeDict[key] || fallbackDict[key] || sourceDict[key] || fallback || key;
  }

  function persist() {
    localStorage.setItem(
      "hsk-platform-state",
      JSON.stringify({
        locale: state.locale,
        level: state.level,
        skill: state.skill,
        view: state.view,
        plan: state.plan,
        selectedQuestion: state.selectedQuestion,
        selectedAnswer: state.selectedAnswer,
        analysisOpen: state.analysisOpen,
        notes: state.notes,
        savedItems: state.savedItems,
        wrongItems: state.wrongItems,
        vocabProgress: state.vocabProgress,
        vocabDue: state.vocabDue,
        essay: state.essay,
        essayFeedback: state.essayFeedback,
        productiveDrafts: state.productiveDrafts,
        productiveFeedback: state.productiveFeedback,
        contentWorkflow: state.contentWorkflow,
        contentStatusFilter: state.contentStatusFilter,
        customContent: state.customContent,
        customTranslations: state.customTranslations,
        mockSubmitted: state.mockSubmitted,
        mockSeconds: state.mockSeconds,
        mockAnswers: state.mockAnswers,
        activeMockQuestion: state.activeMockQuestion,
        repoFilter: state.repoFilter,
        repoTab: state.repoTab,
        authTab: state.authTab,
        authMessage: state.authMessage,
        accountPanel: state.accountPanel,
        accountMessage: state.accountMessage,
        examInfoLevel: state.examInfoLevel,
        testPlanYear: state.testPlanYear,
        regulationTopic: state.regulationTopic,
        tutoringMessage: state.tutoringMessage,
      }),
    );
  }

  function level() {
    return data.levels.find((item) => item.id === state.level) || data.levels[0];
  }

  function vocabDueLabel(item) {
    return state.vocabDue[item.hanzi] || item.due;
  }

  function vocabDueCount() {
    return data.vocab.filter((item) => vocabDueLabel(item) === "today").length;
  }

  function formatDueLabel(due) {
    if (due === "today") return "hôm nay";
    if (due === "tomorrow") return "ngày mai";
    const dayMatch = String(due).match(/^(\d+)\s+days?$/);
    if (dayMatch) return `${dayMatch[1]} ngày nữa`;
    return due;
  }

  function nextVocabDue(grade, mastery) {
    if (grade === "known") return mastery >= 90 ? "14 days" : "7 days";
    if (grade === "hard") return "tomorrow";
    return "today";
  }

  function questionList() {
    const exact = data.practiceQuestions.filter(
      (question) => question.level === state.level && question.skill === state.skill,
    );
    if (exact.length) return exact;
    return data.practiceQuestions.filter((question) => question.skill === state.skill);
  }

  function currentQuestion() {
    const list = questionList();
    if (!list.length) return data.practiceQuestions[0];
    if (state.selectedQuestion >= list.length) state.selectedQuestion = 0;
    return list[state.selectedQuestion];
  }

  function mockQuestions() {
    const isAdvanced = state.level >= 7;
    const exact = data.mockQuestions.filter((question) =>
      isAdvanced ? question.band === "advanced" || question.level === state.level : question.level <= state.level && !question.band,
    );
    return (exact.length ? exact : data.mockQuestions).slice(0, isAdvanced ? 20 : 10);
  }

  function currentMockDurationSeconds() {
    const isAdvanced = state.level >= 7;
    const set =
      data.mockSets.find((item) => (isAdvanced ? item.band === "advanced" && item.status === "open" : item.level === state.level && item.status === "open")) ||
      data.mockSets.find((item) => (isAdvanced ? item.band === "advanced" : item.level === state.level));
    return (set?.duration || (isAdvanced ? 210 : 40)) * 60;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function slug(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function progressBar(value) {
    const safe = Math.max(0, Math.min(100, Number(value) || 0));
    return `<div class="progress"><div class="bar" style="width:${safe}%"></div></div>`;
  }

  function render() {
    if (state.view === "practice" && !(level().sections[state.skill] || []).length) {
      state.skill = data.skills.find((skill) => skill.key !== "tests" && (level().sections[skill.key] || []).length)?.key || "listening";
    }
    persist();
    document.getElementById("app").innerHTML = `
      <div class="app">
        ${renderHeader()}
        <main>
          ${
            state.view === "overview"
              ? renderOverview()
              : `<div class="wrap page-layout">
                  ${["practice", "mock", "writing", "vocab", "repository"].includes(state.view) ? renderLearningNav() : ""}
                  ${renderTabs()}
                  <section class="main">${renderView()}</section>
                </div>`
          }
        </main>
        ${renderFooter()}
        ${state.profileOpen ? renderProfileModal() : ""}
      </div>
    `;
    bindEvents();
  }

  function renderHeader() {
    return `
      <header class="site-header">
        <div class="wrap site-nav">
          <button class="brand" data-view="overview" aria-label="Home">
            <span class="brand-mark">学</span>
            <span>${escapeHtml(data.brand.appName)}</span>
          </button>
          <nav class="main-nav" aria-label="Website navigation">
            <button data-view="practice">${escapeHtml(t("learnOnline"))}</button>
            <button data-view="exam">${escapeHtml(t("aboutTest"))}</button>
            <button data-view="schedule">${escapeHtml(t("testPlan"))}</button>
            <button data-view="corporate">${escapeHtml(t("corporateServices"))}</button>
            <button data-view="app">${escapeHtml(t("downloadApp"))}</button>
            <button data-view="pricing">${escapeHtml(t("upgrade"))}</button>
            <button data-view="content">${escapeHtml(t("contentAdmin"))}</button>
          </nav>
          <div class="nav-actions">
            <span class="tag">Tiếng Việt</span>
            <button class="btn ghost" data-view="account">${escapeHtml(t("profile"))}</button>
            <button class="btn ghost" data-view="auth">${escapeHtml(t("login"))}</button>
            <span class="tag ${state.plan === "Free" ? "" : "ok"}">${escapeHtml(state.plan)}</span>
          </div>
        </div>
      </header>
    `;
  }

  function renderLearningNav() {
    const current = level();
    return `
      <section class="learn-nav">
        <div class="level-strip" aria-label="HSK levels">
          <div class="level-current">
            <span>${state.level}</span>
            <div>
              <strong>${escapeHtml(current.name)}</strong>
              <small>${current.words} từ mục tiêu${current.id >= 7 ? " - Advanced" : ""}</small>
            </div>
          </div>
          <label class="level-select-label">
            <span>Cấp luyện thi</span>
            <select class="select level-select" data-level-select aria-label="Chọn cấp HSK">
            ${data.levels
              .map(
                (item) => `
                  <option value="${item.id}" ${item.id === state.level ? "selected" : ""}>
                    HSK ${item.id} - ${item.words} từ${item.id >= 7 ? " (Advanced)" : ""}
                  </option>
                `,
              )
              .join("")}
            </select>
          </label>
        </div>
        <nav class="skill-tabs" aria-label="Skill navigation">
          ${data.skills
            .map((skill) => {
              const skillSections = level().sections[skill.key] || [];
              const disabled = skillSections.length === 0;
              return `
                <button class="skill-tab ${skill.key === state.skill ? "active" : ""}" data-skill="${skill.key}" ${disabled ? "disabled" : ""}>
                  ${escapeHtml(t(skill.key, skill.label))}
                </button>
              `;
            })
            .join("")}
          <button class="skill-tab ${state.view === "repository" ? "active" : ""}" data-view="repository">${escapeHtml(t("myExercise"))}</button>
        </nav>
      </section>
    `;
  }

  function renderTabs() {
    return `
      <nav class="panel tabs" aria-label="Main sections">
        ${views
          .map(([key, label]) => `<button class="tab-btn ${state.view === key ? "active" : ""}" data-view="${key}">${escapeHtml(t(label, label))}</button>`)
          .join("")}
      </nav>
    `;
  }

  function renderView() {
    if (state.view === "overview") return renderOverview();
    if (state.view === "practice") return renderPractice();
    if (state.view === "mock") return renderMock();
    if (state.view === "writing") return renderWriting();
    if (state.view === "vocab") return renderVocab();
    if (state.view === "repository") return renderRepository();
    if (state.view === "exam") return renderExamInfo();
    if (state.view === "schedule") return renderTestPlan();
    if (state.view === "regulation") return renderRegulation();
    if (state.view === "app") return renderAppDownload();
    if (state.view === "tutoring") return renderTutoring();
    if (state.view === "account") return renderAccountCenter();
    if (state.view === "content") return renderContent();
    if (state.view === "pricing") return renderPricing();
    if (state.view === "corporate") return renderCorporate();
    if (state.view === "auth") return renderAuth();
    return renderSystem();
  }

  function renderFooter() {
    return `
      <footer class="site-footer">
        <div class="wrap footer-grid">
          <div>
            <h3>${escapeHtml(data.brand.appName)}</h3>
            <p class="muted">Nền tảng luyện thi HSK dùng nội dung gốc/tự cấp phép. Tên thương hiệu, pháp lý, hình ảnh, âm thanh và ngân hàng đề không sao chép từ SuperTest/HSKOnline.</p>
          </div>
          <div>
            <h3>${escapeHtml(t("aboutHsk"))}</h3>
            <button data-view="exam">${escapeHtml(t("aboutTest"))}</button>
            <button data-view="schedule">${escapeHtml(t("testPlan"))}</button>
            <button data-view="regulation">${escapeHtml(t("testRegulation"))}</button>
            <button data-view="mock">${escapeHtml(t("mockTests"))}</button>
            <button data-view="vocab">${escapeHtml(t("vocabulary"))}</button>
          </div>
          <div>
            <h3>${escapeHtml(t("platform"))}</h3>
            <button data-view="practice">${escapeHtml(t("hskLevels"))}</button>
            <button data-view="writing">${escapeHtml(t("writingCorrection"))}</button>
            <button data-view="tutoring">${escapeHtml(t("oneOnOneTutoring"))}</button>
            <button data-view="repository">${escapeHtml(t("myExercise"))}</button>
            <button data-view="app">${escapeHtml(t("downloadApp"))}</button>
          </div>
          <div>
            <h3>${escapeHtml(t("admin"))}</h3>
            <button data-view="account">${escapeHtml(t("accountCenter"))}</button>
            <button data-view="corporate">${escapeHtml(t("corporate"))}</button>
            <button data-view="content">${escapeHtml(t("contentAdmin"))}</button>
            <button data-view="pricing">${escapeHtml(t("upgrade"))}</button>
            <button data-view="system">${escapeHtml(t("superAdmin"))}</button>
          </div>
        </div>
      </footer>
    `;
  }

  function renderOverview() {
    const current = level();
    const dueCount = vocabDueCount() + state.wrongItems.length;
    const answered = Object.keys(state.mockAnswers).length + state.notes.length + state.savedItems.length;
    const correctMock = getMockScore().correct;
    const accuracy = answered ? Math.round((correctMock / Math.max(1, Object.keys(state.mockAnswers).length)) * 100) : 0;
    const modules = [
      ["Chẩn đoán AI", "12 phút", "Xác định trình độ, mục tiêu thi, kỹ năng yếu và ngày thi dự kiến."],
      ["Luyện thông minh", "5-20 câu", "Trộn câu theo câu sai, độ tự tin thấp, kỹ năng yếu và lịch ôn."],
      ["Thi thử", "HSK 1-9", "Thi thử có bấm giờ, tự lưu, rà câu chưa làm và báo cáo điểm."],
      ["Ôn từ vựng SRS", `${current.words} từ`, "Flashcard, ví dụ, pinyin, âm thanh, độ thành thạo và lịch ôn."],
      ["Sửa bài viết", "HSK 3-9", "Trình soạn bài, rubric, phản hồi AI và tín chỉ giáo viên sửa bài."],
      ["HSK 7-9 nâng cao", "210 phút", "Luyện riêng Nghe, Đọc, Viết, Dịch, Nói và đề Advanced phân loại 7/8/9."],
      ["Bài luyện của tôi", "Cá nhân", "Câu sai, câu đã lưu, ghi chú, bài viết và lịch ôn lại."],
      ["Cẩm nang kỳ thi HSK", "2026", "Giới thiệu kỳ thi, lịch thi, quy định thi và quy trình kiểm chứng nguồn chính thức."],
      ["Gia sư 1-1", "Giáo viên", "Trọng điểm HSK, kỹ năng học, sửa bài viết, ghi chú buổi học và bài tập."],
      ["Dịch vụ doanh nghiệp", "B2B", "Lớp học, bài giao, dashboard giáo viên, quản lý chỗ học và báo cáo."],
    ];

    return `
      <section class="hero">
        <div class="wrap hero-grid">
          <div class="hero-copy">
            <p class="eyebrow">Dữ liệu lớn + học thích ứng</p>
            <h1>${escapeHtml(t("appTitle"))}</h1>
            <p>${escapeHtml(t("appSubtitle"))}</p>
            <div class="hero-actions">
              <button class="btn primary" data-view="practice">${escapeHtml(t("start"))}</button>
              <button class="btn ghost" data-view="mock">${escapeHtml(t("mockTests"))}</button>
              <button class="btn ghost" data-view="app">${escapeHtml(t("downloadApp"))}</button>
            </div>
          </div>
          <div class="hero-device" aria-label="Learning preview">
            <div class="device-top">
              <span>HSK ${state.level}</span>
              <strong>${current.readiness}%</strong>
            </div>
            <div class="mini-audio"></div>
            <div class="mini-lines">
              <span></span><span></span><span></span>
            </div>
            <div class="mini-options">
              <button>A</button><button>B</button><button>C</button><button>D</button>
            </div>
          </div>
        </div>
      </section>
      <div class="wrap homepage">
        <section class="grid stats-grid">
          ${[
            [t("target"), current.name, `${current.words} từ mục tiêu`],
            [t("readiness"), `${current.readiness}%`, "Ước tính từ bài đã làm"],
            [t("accuracy"), `${accuracy}%`, `${answered} tín hiệu học tập`],
            [t("dueReviews"), dueCount, "SRS + câu làm sai"],
          ]
            .map(([label, value, hint]) => `<article class="card"><p class="muted">${escapeHtml(label)}</p><h2>${escapeHtml(value)}</h2><p class="muted">${escapeHtml(hint)}</p></article>`)
            .join("")}
        </section>
        <section class="learner-command">
          <article class="command-main">
            <div>
              <p class="eyebrow">Bàn học hôm nay</p>
              <h2>Tiếp tục HSK ${state.level}: ${escapeHtml(current.name)}</h2>
              <p class="muted">Lịch học ưu tiên được tạo từ tiến độ, câu sai, từ vựng đến hạn và mục tiêu thi. Khi nối backend, khối này sẽ đồng bộ theo tài khoản thật.</p>
            </div>
            <div class="command-actions">
              <button class="btn primary" data-view="practice">Luyện tiếp</button>
              <button class="btn ghost" data-view="repository">Mở kho câu sai</button>
              <button class="btn ghost" data-view="mock">Thi thử</button>
            </div>
          </article>
          <div class="command-rail">
            ${[
              ["1", "Làm 5-10 câu yếu", state.wrongItems.length ? `${state.wrongItems.length} câu sai đang chờ ôn` : "Bắt đầu bằng section đầu tiên"],
              ["2", "Ôn SRS", `${vocabDueCount()} từ đến hạn hôm nay`],
              ["3", state.level >= 7 ? "Drill dịch/nói" : "Mock mini", state.level >= 7 ? "Ưu tiên Advanced HSK 7-9" : "Kiểm tra 20-40 phút"],
            ]
              .map(
                ([no, title, desc]) => `
                  <article class="command-step">
                    <span>${escapeHtml(no)}</span>
                    <div>
                      <strong>${escapeHtml(title)}</strong>
                      <p class="muted">${escapeHtml(desc)}</p>
                    </div>
                  </article>
                `,
              )
              .join("")}
          </div>
        </section>
        <section class="feature-band">
          <h2>${escapeHtml(t("ourSpecialties"))}</h2>
          <div class="grid module-grid">
            ${modules
              .map(([name, metric, desc]) => `<article class="feature"><span class="tag">${escapeHtml(metric)}</span><h3>${escapeHtml(name)}</h3><p class="muted">${escapeHtml(desc)}</p></article>`)
              .join("")}
          </div>
        </section>
        <section class="feature-band">
          <div class="split">
            <div>
              <h2>${escapeHtml(t("learnerChoice"))}</h2>
              <p class="muted">Câu chuyện học viên mẫu, chỉ dùng để giữ cấu trúc. Khi ra mắt cần dùng phản hồi thật có đồng ý sử dụng.</p>
            </div>
            <button class="btn ghost" data-view="tutoring">${escapeHtml(t("oneOnOneTutoring"))}</button>
          </div>
          <div class="grid module-grid">
            ${data.testimonials
              .map((item) => `<article class="feature"><span class="tag">${escapeHtml(item.level)} ${escapeHtml(item.score)}</span><h3>${escapeHtml(item.name)}</h3><p class="muted">${escapeHtml(item.text)}</p></article>`)
              .join("")}
          </div>
        </section>
        <section class="feature-band">
          ${renderLearningNav()}
        </section>
      </div>
    `;
  }

  function renderPractice() {
    const current = level();
    const sections = current.sections[state.skill] || [];
    const list = questionList();
    const question = currentQuestion();
    const answered = state.selectedAnswer !== "";
    const skillName = t(state.skill, data.skills.find((item) => item.key === state.skill)?.label || state.skill);
    const aggregateProgress = sections.length
      ? Math.round(
          sections.reduce((sum, _section, index) => {
            const value = index === 0 ? current.readiness : index === 1 ? Math.round(current.readiness / 2) : 0;
            return sum + value;
          }, 0) / sections.length,
        )
      : 0;
    if (["translation", "speaking"].includes(state.skill)) {
      return renderProductivePractice(current, sections, question, skillName, aggregateProgress);
    }

    return `
      <section class="practice-page">
        <div class="training-column">
          <section class="course-head">
            <div>
              <p class="eyebrow">${escapeHtml(current.name)}</p>
              <h2>${escapeHtml(current.name)} - ${escapeHtml(skillName)}</h2>
              <p class="muted">Bài luyện được chia theo từng phần thi, có tiến độ, số đúng/số đã trả lời, trạng thái mở khóa, luyện riêng và luyện thông minh.</p>
            </div>
            <div class="course-summary">
              <strong>${aggregateProgress}%</strong>
              <span>${escapeHtml(t("overallProgress"))}</span>
            </div>
          </section>

          <section class="section-list" aria-label="Practice sections">
            ${
              sections.length
                ? sections
                    .map((section, index) => {
                      const progress = index === 0 ? current.readiness : index === 1 ? Math.round(current.readiness / 2) : 0;
                      const total = 8 + index * 4;
                      const selectedSignal = index === 0 && answered ? 1 : 0;
                      const answeredCount = Math.min(total, Math.round((progress / 100) * total) + selectedSignal);
                      const correctSignal = index === 0 && state.selectedAnswer === question.answer ? 1 : 0;
                      const correctCount = Math.min(answeredCount, Math.round(answeredCount * 0.75) + correctSignal);
                      const locked = index > 1 && state.plan === "Free";
                      return `
                        <article class="section-row ${locked ? "locked" : ""}">
                          <div class="section-index">${index + 1}</div>
                          <div class="section-main">
                            <div class="section-topline">
                              <div>
                                <h3>${escapeHtml(t("section"))} ${index + 1}</h3>
                                <p class="section-title">${escapeHtml(section)}</p>
                              </div>
                              ${locked ? `<span class="tag vip">${escapeHtml(t("vipLocked"))}</span>` : `<span class="tag ok">${escapeHtml(t("open"))}</span>`}
                            </div>
                            <div class="section-metrics">
                              <div class="metric metric-progress">
                                <span>${escapeHtml(t("progress"))}</span>
                                ${progressBar(progress)}
                                <strong>${progress}%</strong>
                              </div>
                              <div class="metric">
                                <span>${escapeHtml(t("correctAnswerNumber"))}</span>
                                <strong>${correctCount}/${answeredCount}</strong>
                              </div>
                              <button class="btn ${locked ? "ghost" : "primary"}" data-action="${locked ? "locked-info" : "smart-quiz"}" ${locked ? "disabled" : ""}>
                                ${locked ? escapeHtml(t("vipLocked")) : escapeHtml(t("singleTraining"))}
                              </button>
                            </div>
                          </div>
                        </article>
                      `;
                    })
                    .join("")
                : '<article class="section-row warning"><div class="section-main"><strong>Chưa có phần luyện cho cấp này.</strong><p class="muted">Kỹ năng này chưa mở ở cấp hiện tại. Hãy đổi cấp hoặc chọn kỹ năng khác.</p></div></article>'
            }
          </section>

          <section class="smart-card">
            <div class="smart-orb">AI</div>
            <div>
              <p class="eyebrow">${escapeHtml(t("smartQuiz"))}</p>
              <h3>Luyện trộn thích ứng</h3>
              <p class="muted">Tạo phiên luyện từ câu sai, kỹ năng yếu, từ vựng đến hạn ôn và phần HSK đang học.</p>
            </div>
            <div class="smart-score">
              <strong>${state.wrongItems.length}</strong>
              <span>câu sai sẵn sàng ôn</span>
            </div>
            <button class="btn primary" data-action="smart-quiz">${escapeHtml(t("smartQuiz"))}</button>
          </section>
        </div>

        <aside class="practice-sidebar">
          <section class="app-download">
            <div>
              <p class="eyebrow">Tải ứng dụng</p>
              <h3>Ứng dụng học trên điện thoại</h3>
              <p class="muted">QR và liên kết app-store không sao chép. Khi phát hành sẽ thêm link iOS/Android gốc.</p>
            </div>
            <div class="qr-placeholder">QR TODO</div>
          </section>

          <section class="question-panel">
            <div class="question-head">
              <div>
                <p class="eyebrow">${question.source === "original" ? "Nội dung gốc" : escapeHtml(question.source)}</p>
                <h2>${escapeHtml(question.type)}</h2>
              </div>
              <span class="tag">HSK ${question.level}</span>
            </div>

            <div class="answer-strip" aria-label="Question navigation">
              ${list
                .map(
                  (item, index) => `
                    <button class="question-cell ${index === state.selectedQuestion ? "answered" : ""}" data-question-index="${index}">
                      ${index + 1}
                    </button>
                  `,
                )
                .join("")}
            </div>

            <div class="prompt-box">
              <div class="split">
                <strong>Đề bài</strong>
                ${
                  state.skill === "listening"
                    ? `<button class="btn ghost" data-action="play-audio">${question.assetStatus ? "Thiếu audio gốc" : "Nghe audio"}</button>`
                    : `<span class="tag">Câu đọc hiểu</span>`
                }
              </div>
              <p class="muted">${escapeHtml(question.prompt)}</p>
              ${question.translation ? `<p class="muted"><strong>VI:</strong> ${escapeHtml(question.translation)}</p>` : ""}
              ${question.assetStatus ? `<p class="asset-note">${escapeHtml(question.assetStatus)} - cần thay bằng tài nguyên tự tạo hoặc được cấp phép.</p>` : ""}
            </div>

            <div class="answer-options">
              ${question.options
                .map(
                  (option, index) => `
                    <button class="answer-btn ${state.selectedAnswer === option ? "active" : ""}" data-answer="${escapeHtml(option)}">
                      <span>${String.fromCharCode(65 + index)}</span>
                      ${escapeHtml(option)}
                    </button>
                  `,
                )
                .join("")}
            </div>

            <div class="toolbar practice-actions">
              <button class="btn primary" data-action="check-answer">${escapeHtml(t("analysis"))}</button>
            <button class="btn ghost" data-action="save-item">${escapeHtml(t("saveItem"))}</button>
            <button class="btn ghost" data-action="add-note">${escapeHtml(t("addNote"))}</button>
            <button class="btn ghost" data-action="next-practice">${escapeHtml(t("next"))}</button>
            </div>

            ${
              state.analysisOpen
                ? `<article class="card ${answered && state.selectedAnswer !== question.answer ? "warning" : "feedback"}">
                    <h3>${state.selectedAnswer === question.answer ? escapeHtml(t("correct")) : escapeHtml(t("wrong"))}: ${escapeHtml(question.answer)}</h3>
                    <p class="muted">${escapeHtml(question.analysis)}</p>
                  ${question.transcript ? `<p class="muted"><strong>Lời thoại:</strong> ${escapeHtml(question.transcript)}</p>` : ""}
                  ${question.grammar ? `<p class="muted"><strong>Ngữ pháp:</strong> ${escapeHtml(question.grammar)}</p>` : ""}
                  </article>`
                : ""
            }
          </section>
        </aside>
      </section>
    `;
  }

  function renderProductivePractice(current, sections, question, skillName, aggregateProgress) {
    const draft = state.productiveDrafts[question.id] || "";
    const feedback = state.productiveFeedback[question.id];
    const chars = Array.from(draft.trim()).length;
    const isSpeaking = state.skill === "speaking";
    const rubric = question.rubric || ["Đúng yêu cầu", "Độ chính xác", "Mạch lạc", "Từ vựng"];
    const recordLabel = state.recordingStatus === "recording" ? t("stopRecording") : t("recordSpeaking");
    const recordStatus =
      state.recordingStatus === "recording"
        ? "Đang ghi âm..."
        : state.recordingStatus === "saved"
          ? t("recordingReady")
          : state.recordingStatus === "error"
            ? t("recordingError")
            : t("localRecording");

    return `
      <section class="practice-page">
        <div class="training-column">
          <section class="course-head">
            <div>
              <p class="eyebrow">${escapeHtml(t("advancedHsk"))}</p>
              <h2>${escapeHtml(current.name)} - ${escapeHtml(skillName)}</h2>
              <p class="muted">Khu luyện ${escapeHtml(skillName.toLowerCase())} cho HSK nâng cao: đề bài, bản nháp, rubric, nhận xét AI và hàng đợi giáo viên. Nội dung hiện tại là dữ liệu gốc để dựng logic, không sao chép đề thật.</p>
            </div>
            <div class="course-summary">
              <strong>${aggregateProgress}%</strong>
              <span>${escapeHtml(t("overallProgress"))}</span>
            </div>
          </section>

          <section class="section-list" aria-label="Productive skill sections">
            ${sections
              .map((section, index) => {
                const locked = index > 1 && state.plan === "Free";
                return `
                  <article class="section-row ${locked ? "locked" : ""}">
                    <div class="section-index">${index + 1}</div>
                    <div class="section-main">
                      <div class="section-topline">
                        <div>
                          <h3>${escapeHtml(t("section"))} ${index + 1}</h3>
                          <p class="section-title">${escapeHtml(section)}</p>
                        </div>
                        ${locked ? `<span class="tag vip">${escapeHtml(t("vipLocked"))}</span>` : `<span class="tag ok">${escapeHtml(t("open"))}</span>`}
                      </div>
                      <div class="section-metrics">
                        <div class="metric metric-progress">
                          <span>${escapeHtml(t("progress"))}</span>
                          ${progressBar(index === 0 ? current.readiness : Math.max(0, current.readiness - index))}
                          <strong>${index === 0 ? current.readiness : Math.max(0, current.readiness - index)}%</strong>
                        </div>
                        <div class="metric">
                          <span>Rubric</span>
                          <strong>${rubric.length} tiêu chí</strong>
                        </div>
                        <button class="btn ${locked ? "ghost" : "primary"}" ${locked ? "disabled" : ""} data-action="${locked ? "locked-info" : "productive-feedback"}">
                          ${locked ? escapeHtml(t("vipLocked")) : escapeHtml(t("smartQuiz"))}
                        </button>
                      </div>
                    </div>
                  </article>
                `;
              })
              .join("")}
          </section>

          <section class="smart-card">
            <div class="smart-orb">${isSpeaking ? "声" : "译"}</div>
            <div>
              <p class="eyebrow">${escapeHtml(t("productivePractice"))}</p>
              <h3>${isSpeaking ? "Luyện nói có ghi âm" : "Luyện dịch có rubric"}</h3>
              <p class="muted">${isSpeaking ? "Ghi âm trực tiếp trên browser, nghe lại và lưu bản nháp transcript." : "Dịch hai chiều, lưu bản nháp, so với đáp án mẫu và nhận xét theo tiêu chí."}</p>
            </div>
            <div class="smart-score">
              <strong>${chars}</strong>
              <span>ký tự bản nháp</span>
            </div>
            <button class="btn primary" data-action="productive-feedback">${escapeHtml(t("aiFeedback"))}</button>
          </section>
        </div>

        <aside class="practice-sidebar">
          <section class="question-panel">
            <div class="question-head">
              <div>
                <p class="eyebrow">${escapeHtml(question.source === "original" ? "Nội dung gốc" : question.source)}</p>
                <h2>${escapeHtml(question.type)}</h2>
              </div>
              <span class="tag">HSK ${question.level}</span>
            </div>

            <div class="prompt-box">
              <div class="split">
                <strong>Đề bài</strong>
                <span class="tag">${escapeHtml(question.taskTime || question.direction || skillName)}</span>
              </div>
              <p class="muted">${escapeHtml(question.prompt)}</p>
              ${question.translation ? `<p class="muted"><strong>Gợi ý nghĩa:</strong> ${escapeHtml(question.translation)}</p>` : ""}
              ${question.assetStatus ? `<p class="asset-note">${escapeHtml(question.assetStatus)} - cần tài nguyên tự tạo hoặc được cấp phép.</p>` : ""}
            </div>

            ${
              isSpeaking
                ? `<div class="card">
                    <div class="split">
                      <div>
                        <strong>${escapeHtml(t("localRecording"))}</strong>
                        <p class="muted">${escapeHtml(recordStatus)}</p>
                      </div>
                      <button class="btn primary" data-action="record-speaking">${escapeHtml(recordLabel)}</button>
                    </div>
                    ${recordedAudioUrl ? `<audio controls src="${escapeHtml(recordedAudioUrl)}" style="width:100%;margin-top:12px"></audio>` : ""}
                  </div>`
                : ""
            }

            <textarea class="textarea" data-action="productive-input" placeholder="${isSpeaking ? "Nhập transcript hoặc dàn ý bài nói tiếng Trung..." : "Nhập bản dịch tiếng Trung/tiếng Việt tại đây..."}">${escapeHtml(draft)}</textarea>
            <div class="split" style="margin-top:12px">
              <p class="muted">${chars} ký tự</p>
              <div class="toolbar">
                <button class="btn ghost" data-action="save-productive">${escapeHtml(t("saveDraft"))}</button>
                <button class="btn primary" data-action="productive-feedback">${escapeHtml(t("aiFeedback"))}</button>
                <button class="btn ghost" data-action="next-practice">${escapeHtml(t("next"))}</button>
              </div>
            </div>

            <section class="stack" style="margin-top:16px">
              <article class="card">
                <h3>${escapeHtml(t("rubricFeedback"))}</h3>
                <div class="tag-row">
                  ${rubric.map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join("")}
                </div>
              </article>
              ${
                feedback
                  ? Object.entries(feedback)
                      .map(([key, value]) => `<article class="card feedback"><strong>${escapeHtml(key)}</strong><p class="muted">${escapeHtml(value)}</p></article>`)
                      .join("")
                  : '<article class="card"><p class="muted">Nhập bản nháp rồi bấm Nhận xét AI. Bản production sẽ gọi dịch vụ AI và có hàng đợi giáo viên chấm chi tiết.</p></article>'
              }
              ${
                state.analysisOpen
                  ? `<article class="card warning"><strong>Đáp án/khung tham khảo</strong><p class="muted">${escapeHtml(question.answer)}</p><p class="muted">${escapeHtml(question.analysis)}</p></article>`
                  : ""
              }
            </section>
          </section>
        </aside>
      </section>
    `;
  }

  function getMockScore() {
    const questions = mockQuestions().filter((question) => question.answer !== "manual");
    const correct = questions.filter((question, index) => state.mockAnswers[index + 1] === question.answer).length;
    return { correct, total: questions.length, score: questions.length ? Math.round((correct / questions.length) * 100) : 0 };
  }

  function getMockBreakdown() {
    const questions = mockQuestions();
    const groups = {};
    questions.forEach((question, index) => {
      const key = question.skill || "general";
      if (!groups[key]) groups[key] = { total: 0, answered: 0, correct: 0, manual: 0 };
      groups[key].total += 1;
      if (question.answer === "manual") groups[key].manual += 1;
      if (state.mockAnswers[index + 1]) groups[key].answered += 1;
      if (question.answer !== "manual" && state.mockAnswers[index + 1] === question.answer) groups[key].correct += 1;
    });
    return Object.entries(groups).map(([skill, row]) => ({
      skill,
      ...row,
      accuracy: row.total - row.manual ? Math.round((row.correct / (row.total - row.manual)) * 100) : 0,
    }));
  }

  function renderMockReport(score, questions) {
    const breakdown = getMockBreakdown();
    const weakRows = breakdown
      .filter((row) => row.accuracy < 70 || row.answered < row.total)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3);
    const answered = Object.keys(state.mockAnswers).length;
    const estimate =
      state.level >= 7
        ? score.score >= 85
          ? "HSK 9"
          : score.score >= 70
            ? "HSK 8"
            : "HSK 7"
        : `HSK ${state.level}`;

    return `
      <article class="mock-report card feedback">
        <div class="split">
          <div>
            <p class="eyebrow">Báo cáo sau thi</p>
            <h3>Điểm tạm tính: ${score.score}/100</h3>
            <p class="muted">${score.correct}/${score.total} câu trắc nghiệm đúng, ${answered}/${questions.length} câu đã trả lời. Phần viết/dịch/nói cần rubric AI hoặc giáo viên.</p>
          </div>
          <span class="tag ok">Ước tính: ${escapeHtml(estimate)}</span>
        </div>
        <div class="report-grid">
          ${breakdown
            .map(
              (row) => `
                <div class="report-row">
                  <div>
                    <strong>${escapeHtml(t(row.skill, row.skill))}</strong>
                    <p class="muted">${row.answered}/${row.total} câu đã làm${row.manual ? `, ${row.manual} câu chấm rubric` : ""}</p>
                  </div>
                  <div>
                    ${progressBar(row.accuracy)}
                    <span>${row.accuracy}%</span>
                  </div>
                </div>
              `,
            )
            .join("")}
        </div>
        <div class="drill-plan">
          <strong>Kế hoạch ôn sau thi</strong>
          <ul>
            ${
              weakRows.length
                ? weakRows.map((row) => `<li>Ôn ${escapeHtml(t(row.skill, row.skill))}: làm lại câu sai, thêm 10 câu mini drill và cập nhật ghi chú.</li>`).join("")
                : "<li>Điểm ổn định. Chuyển sang đề khó hơn hoặc full mock tiếp theo.</li>"
            }
          </ul>
        </div>
      </article>
    `;
  }

  function renderMock() {
    const questions = mockQuestions();
    if (state.activeMockQuestion > questions.length) state.activeMockQuestion = questions.length;
    const active = questions[state.activeMockQuestion - 1] || questions[0];
    const answered = Object.keys(state.mockAnswers).length;
    const minutes = String(Math.floor(state.mockSeconds / 60)).padStart(2, "0");
    const seconds = String(state.mockSeconds % 60).padStart(2, "0");
    const score = getMockScore();
    const isAdvanced = state.level >= 7;
    const sets = data.mockSets
      .filter((set) => (isAdvanced ? set.band === "advanced" || set.level >= 7 : set.level <= state.level && !set.band))
      .slice(0, isAdvanced ? 12 : 10);
    const mockMeta = isAdvanced && data.advancedExam ? data.advancedExam : null;
    const mockDescription = mockMeta ? `${mockMeta.name}: ${mockMeta.questions} câu, ${mockMeta.duration} phút, gồm ${mockMeta.skills.join(", ")}. ` : "";

    return `
      <section class="mock-page">
        <div class="panel">
          <div class="split">
            <div>
              <p class="eyebrow">${escapeHtml(level().name)}</p>
              <h2>HSK cấp ${state.level} ${escapeHtml(t("tests"))}</h2>
              <p class="muted">${escapeHtml(mockDescription)}Danh sách đề theo mô hình công khai: đề thi thử chuẩn, bộ đề khóa VIP, đề mini thích ứng và phòng thi có bấm giờ.</p>
            </div>
            <button class="btn primary" data-action="mock-start">${state.mockStarted ? escapeHtml(t("pauseTimer")) : escapeHtml(t("startSelectedMock"))}</button>
          </div>

          <div class="mock-catalog">
            ${sets
              .map(
                (set) => `
                  <article class="mock-set ${set.status === "vip" && state.plan === "Free" ? "locked" : ""}">
                    <span class="tag ${set.status === "vip" ? "vip" : "ok"}">${escapeHtml(set.group)}</span>
                    <h3>${escapeHtml(set.name)}</h3>
                    <p class="muted">HSK ${set.level}. ${set.questions} câu. ${set.duration} phút.</p>
                    <button class="btn ${set.status === "vip" && state.plan === "Free" ? "ghost" : "primary"}" data-action="mock-start" ${set.status === "vip" && state.plan === "Free" ? "disabled" : ""}>
                      ${set.status === "vip" && state.plan === "Free" ? "Khóa VIP" : "Vào làm đề"}
                    </button>
                  </article>
                `,
              )
              .join("")}
          </div>

          <section class="exam-console">
            <div class="split">
              <div>
                <p class="eyebrow">${escapeHtml(t("time"))}</p>
                <h2>${escapeHtml(t("mockExamConsole"))}</h2>
                <p class="muted">Tự lưu bài làm, phiếu trả lời, nộp bài, báo cáo điểm và tạo lịch ôn sau thi.</p>
              </div>
              <span class="tag">${minutes}:${seconds}</span>
            </div>
            <div class="card">
              <h3>Câu ${state.activeMockQuestion}: ${escapeHtml(active.prompt)}</h3>
              <p class="muted">Kỹ năng: ${escapeHtml(t(active.skill, active.skill))}. Đáp án được lưu trong ngân hàng câu hỏi nội bộ.</p>
              <div class="grid" style="grid-template-columns:repeat(2,minmax(0,1fr))">
                ${active.options
                  .map(
                    (option, index) => `
                      <button class="answer-btn ${state.mockAnswers[state.activeMockQuestion] === option ? "active" : ""}" data-mock-answer="${escapeHtml(option)}">
                        <span>${String.fromCharCode(65 + index)}</span>
                        ${escapeHtml(option === "manual" ? "Chấm viết thủ công" : `Đáp án ${option}`)}
                      </button>
                    `,
                  )
                  .join("")}
              </div>
            </div>
            <div class="toolbar" style="justify-content:flex-start">
              <button class="btn ghost" data-action="mock-prev">${escapeHtml(t("previous"))}</button>
              <button class="btn ghost" data-action="mock-next">${escapeHtml(t("next"))}</button>
              <button class="btn danger" data-action="mock-submit">${escapeHtml(t("submit"))}</button>
            </div>
            ${
              state.mockSubmitted
                ? `<article class="card feedback">
                    <div class="split">
                      <div>
                        <p class="muted">Kết quả tự động</p>
                        <h3>Điểm: ${score.score}/100</h3>
                      </div>
                      <span class="tag ok">${score.correct}/${score.total} đúng</span>
                    </div>
                    <p class="muted">Phần viết, dịch và nói sẽ chuyển sang rubric AI/giáo viên.</p>
                  </article>`
                : ""
            }
          </section>
        </div>
        <aside class="panel">
          <h3>${escapeHtml(t("answerSheet"))}</h3>
          ${state.mockSubmitted ? renderMockReport(score, questions) : ""}
          <div class="question-grid">
            ${questions
              .map((question, index) => {
                const no = index + 1;
                return `<button class="question-cell ${state.mockAnswers[no] ? "answered" : ""}" data-mock-jump="${no}">${no}</button>`;
              })
              .join("")}
          </div>
          <p class="muted" style="margin-top:12px">${answered}/${questions.length} câu đã trả lời. Tạm thời tự lưu cục bộ cho tới khi nối backend.</p>
          <div class="stack" style="margin-top:16px">
            <article class="card">
              <strong>Checklist trước khi thi</strong>
              <p class="muted">Audio, đồng hồ, rà câu chưa làm, xác nhận nộp bài, báo cáo điểm và điều hướng điểm yếu.</p>
            </article>
            <article class="card warning">
              <strong>Ranh giới nguồn nội dung</strong>
              <p class="muted">Đề thật/đề cũ phải được cấp phép hoặc tự biên soạn. Câu hiện tại là dữ liệu mẫu gốc.</p>
            </article>
          </div>
        </aside>
      </section>
    `;
  }

  function renderWriting() {
    const chars = Array.from(state.essay.trim()).filter(Boolean).length;
    const writingItems = data.practiceQuestions.filter((item) => item.level === state.level && item.skill === "writing");
    const prompt = writingItems[0] || data.practiceQuestions.find((item) => item.skill === "writing");
    const disabled = state.level < 3;

    return `
      <section class="grid two-col">
        <div class="panel">
          <p class="eyebrow">${escapeHtml(level().name)}</p>
          <h2>Không gian luyện viết</h2>
          ${disabled ? '<article class="card warning"><strong>Phần viết bắt đầu từ HSK 3. Với HSK 7-9, bài viết chuyển sang dạng học thuật/tổng hợp nguồn.</strong></article>' : ""}
          <article class="card">
            <strong>Đề viết</strong>
            <p class="muted">${escapeHtml(prompt.prompt)}</p>
          </article>
          <div class="toolbar" style="justify-content:flex-start;margin-bottom:12px">
            <button class="btn ghost">Đọc bài gốc</button>
            <button class="btn ghost">Bài rút gọn</button>
            <button class="btn ghost">Bài tham khảo</button>
          </div>
          <input class="input" style="width:100%;margin-bottom:12px" placeholder="Tiêu đề bài viết" ${disabled ? "disabled" : ""} />
          <textarea class="textarea" data-action="essay-input" placeholder="Viết câu trả lời tiếng Trung tại đây..." ${disabled ? "disabled" : ""}>${escapeHtml(state.essay)}</textarea>
          <div class="split" style="margin-top:12px">
            <p class="muted">${chars} ký tự</p>
            <div class="toolbar">
              <button class="btn ghost" data-action="save-essay" ${disabled ? "disabled" : ""}>${escapeHtml(t("save"))}</button>
              <button class="btn primary" data-action="ai-feedback" ${disabled ? "disabled" : ""}>Nhận xét AI</button>
            </div>
          </div>
        </div>
        <aside class="panel">
          <h3>Nhận xét theo rubric</h3>
          ${
            state.essayFeedback
              ? Object.entries(state.essayFeedback)
                  .map(([key, value]) => `<article class="card"><strong>${escapeHtml(key)}</strong><p class="muted">${escapeHtml(value)}</p></article>`)
                  .join("")
              : '<p class="muted">AI sẽ đánh giá mức hoàn thành đề, ngữ pháp, từ vựng, độ mạch lạc, độ chính xác chữ Hán và thời gian làm bài. Khi triển khai thật, phần này gọi dịch vụ AI.</p>'
          }
        </aside>
      </section>
    `;
  }

  function renderVocab() {
    const items = data.vocab.filter((item) => item.level <= state.level);
    return `
      <section class="panel">
        <div class="split">
          <div>
            <h2>Ôn từ vựng SRS</h2>
            <p class="muted">Từ vựng mẫu có pinyin, nghĩa tiếng Việt, ví dụ và chấm mức nhớ cục bộ.</p>
          </div>
          <button class="btn primary">Ôn thẻ đến hạn</button>
        </div>
        <div class="grid module-grid">
          ${items
            .map((item) => {
              const mastery = state.vocabProgress[item.hanzi] ?? item.mastery;
              const due = vocabDueLabel(item);
              return `
                <article class="card">
                  <span class="tag">HSK ${item.level}</span>
                  <h2>${escapeHtml(item.hanzi)}</h2>
                  <p><strong>${escapeHtml(item.pinyin)}</strong> - ${escapeHtml(item.meaning)}</p>
                  <p class="muted">${escapeHtml(item.example || "")}</p>
                  ${progressBar(mastery)}
                  <p class="muted">Hạn ôn: ${escapeHtml(formatDueLabel(due))}. Độ thành thạo: ${mastery}%</p>
                  <div class="toolbar" style="justify-content:flex-start">
                    <button class="btn ghost" data-vocab-grade="again" data-vocab-id="${escapeHtml(item.hanzi)}">Học lại</button>
                    <button class="btn ghost" data-vocab-grade="hard" data-vocab-id="${escapeHtml(item.hanzi)}">Khó nhớ</button>
                    <button class="btn ghost" data-vocab-grade="known" data-vocab-id="${escapeHtml(item.hanzi)}">Đã nhớ</button>
                  </div>
                </article>
              `;
            })
            .join("")}
        </div>
      </section>
    `;
  }

  function renderRepository() {
    const tabs = [
      ["overview", "Tổng quan"],
      ["wrong", "Câu sai"],
      ["saved", "Bộ sưu tập"],
      ["notes", "Ghi chú"],
      ["productive", "Bài viết/dịch/nói"],
    ];
    const allWrongRows = state.wrongItems.map((id) => data.practiceQuestions.find((item) => item.id === id)).filter(Boolean);
    const wrongRows = allWrongRows.filter((item) => state.repoFilter === "all" || item.skill === state.repoFilter || (state.repoFilter === "mocks" && item.source === "mock"));
    const savedRows = state.savedItems.map((id) => data.practiceQuestions.find((item) => item.id === id)).filter(Boolean);
    const draftRows = Object.entries(state.productiveDrafts).map(([id, draft]) => {
      const question = data.practiceQuestions.find((item) => item.id === id) || {};
      return { id, draft, question };
    });
    const dueVocab = data.vocab.filter((item) => vocabDueLabel(item) === "today");
    const rows = [
      ["Câu sai", allWrongRows.length, "Theo kỹ năng, nguồn, dạng câu và hạn ôn"],
      ["Bộ sưu tập", savedRows.length, "Câu đã lưu để luyện lại hoặc hỏi giáo viên"],
      ["Ghi chú", state.notes.length, "Ghi chú ngữ pháp, từ vựng, chiến thuật làm bài"],
      ["Bài tạo sinh", draftRows.length + (state.essay ? 1 : 0), "Bài viết, dịch, nói và nhận xét rubric"],
      ["Đến hạn ôn", dueVocab.length + allWrongRows.length, "SRS + câu sai cần quay lại hôm nay"],
      ["Mock đã nộp", state.mockSubmitted ? 1 : 0, "Báo cáo điểm và kế hoạch ôn sau thi"],
    ];
    const table =
      state.repoTab === "wrong"
        ? {
            head: ["Mã câu", "Kỹ năng", "Dạng câu", "Nguồn", "Việc cần làm"],
            empty: "Chưa có câu sai. Khi trả lời sai, câu hỏi sẽ tự xuất hiện tại đây.",
            rows: wrongRows.map((item) => [item.id, t(item.skill, item.skill), item.type, item.source || "original", "Làm lại + xem phân tích"]),
          }
        : state.repoTab === "saved"
          ? {
              head: ["Mã câu", "Kỹ năng", "Dạng câu", "Ghi chú"],
              empty: "Chưa lưu câu nào. Bấm Lưu câu trong màn luyện để tạo bộ sưu tập.",
              rows: savedRows.map((item) => [item.id, t(item.skill, item.skill), item.type, "Chờ luyện lại"]),
            }
          : state.repoTab === "notes"
            ? {
                head: ["STT", "Nội dung ghi chú", "Nguồn", "Trạng thái"],
                empty: "Chưa có ghi chú. Khi bấm Thêm ghi chú, nội dung sẽ nằm ở đây.",
                rows: state.notes.map((note, index) => [index + 1, note, `HSK ${state.level}`, "Đang học"]),
              }
            : state.repoTab === "productive"
              ? {
                  head: ["Mã bài", "Kỹ năng", "Độ dài", "Trạng thái"],
                  empty: "Chưa có bài viết/dịch/nói. Mở HSK 7-9 Dịch hoặc Nói để tạo bản nháp.",
                  rows: [
                    ...(state.essay ? [["essay-current", "Viết", `${Array.from(state.essay).length} ký tự`, state.essayFeedback ? "Đã có nhận xét" : "Chờ nhận xét"]] : []),
                    ...draftRows.map(({ id, draft, question }) => [id, t(question.skill, question.skill || "Bài tạo sinh"), `${Array.from(draft).length} ký tự`, state.productiveFeedback[id] ? "Đã có rubric" : "Bản nháp"]),
                  ],
                }
              : {
                  head: ["Hạng mục", "Số lượng", "Ý nghĩa", "Hành động"],
                  empty: "",
                  rows: rows.map(([name, count, desc]) => [name, count, desc, "Mở tab chi tiết"]),
                };

    return `
      <section class="panel">
        <div class="split">
          <div>
            <h2>Kho bài luyện cá nhân</h2>
            <p class="muted">Trung tâm ôn tập cá nhân theo mô hình My exercise: tổng quan, câu sai, bộ sưu tập, ghi chú, bài viết/dịch/nói và lịch ôn SRS.</p>
          </div>
          <select class="select" data-action="repo-filter">
            ${["all", "listening", "reading", "writing", "translation", "speaking", "mocks"].map((item) => `<option value="${item}" ${state.repoFilter === item ? "selected" : ""}>${escapeHtml(item === "all" ? "tất cả" : t(item, item))}</option>`).join("")}
          </select>
        </div>
        <nav class="repo-tabs" aria-label="Kho cá nhân">
          ${tabs.map(([key, label]) => `<button class="tab-btn ${state.repoTab === key ? "active" : ""}" data-repo-tab="${key}">${escapeHtml(label)}</button>`).join("")}
        </nav>
        <div class="grid repo-grid">
          ${rows.map(([name, count, desc]) => `<article class="card"><h2>${count}</h2><h3>${escapeHtml(name)}</h3><p class="muted">${escapeHtml(desc)}</p></article>`).join("")}
        </div>
        <table class="table repo-table" style="margin-top:16px">
          <thead><tr>${table.head.map((item) => `<th>${escapeHtml(item)}</th>`).join("")}</tr></thead>
          <tbody>
            ${
              table.rows.length
                ? table.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")
                : `<tr><td colspan="${table.head.length}">${escapeHtml(table.empty)}</td></tr>`
            }
          </tbody>
        </table>
      </section>
    `;
  }

  function renderExamInfo() {
    const selected = data.examInfo.find((item) => item.level === Number(state.examInfoLevel)) || data.examInfo[0];
    const selectedAdvanced = selected.level >= 7;
    return `
      <section class="grid two-col">
        <div class="panel">
          <div class="split">
            <div>
              <p class="eyebrow">Về HSK</p>
              <h2>Giới thiệu kỳ thi</h2>
              <p class="muted">Thông tin cấp độ, nội dung thi, số từ mục tiêu, thời lượng và năng lực người học cần đạt.</p>
            </div>
            <span class="tag">HSK ${selected.level}</span>
          </div>
          <nav class="exam-levels" aria-label="Các cấp HSK">
            ${data.examInfo
              .map(
                (item) => `
                  <button class="level-pill ${item.level === Number(state.examInfoLevel) ? "active" : ""}" data-exam-level="${item.level}">
                    ${item.level}
                  </button>
                `,
              )
              .join("")}
          </nav>
          <section class="exam-about">
            <article class="exam-number">01</article>
            <article>
              <h2>HSK cấp ${selected.level}</h2>
              <p class="muted">${escapeHtml(selected.outcome)}</p>
            </article>
            <article class="exam-number">02</article>
            <article>
              <h2>Nội dung thi HSK cấp ${selected.level}</h2>
              <div class="grid module-grid">
                <div class="card"><strong>Thời lượng</strong><p class="muted">${escapeHtml(selected.duration)}</p></div>
                <div class="card"><strong>Nhóm câu hỏi</strong><p class="muted">${escapeHtml(selected.content)}</p></div>
                <div class="card"><strong>Từ vựng mục tiêu</strong><p class="muted">${selected.words} từ thường dùng</p></div>
              </div>
            </article>
            <article class="exam-number">03</article>
            <article>
              <h2>Nền tảng này cung cấp</h2>
              <div class="grid module-grid">
                ${[
                  [`${selected.words} từ mục tiêu`, "SRS, ví dụ, pinyin, độ thành thạo và lịch ôn."],
                  ["Luyện theo dạng câu", selectedAdvanced ? "Luyện nghe, đọc, viết, dịch, nói theo từng phần và có tiến độ." : "Luyện nghe, đọc, viết theo từng phần và có tiến độ."],
                  ["Bộ đề thi thử", selectedAdvanced ? "Đề Advanced 98 câu/210 phút, phiếu trả lời, báo cáo điểm và điều hướng điểm yếu." : "Thi có bấm giờ, phiếu trả lời, báo cáo điểm và điều hướng điểm yếu."],
                ]
                  .map(([name, desc]) => `<article class="card"><h3>${escapeHtml(name)}</h3><p class="muted">${escapeHtml(desc)}</p></article>`)
                  .join("")}
              </div>
            </article>
          </section>
        </div>
        <aside class="panel">
          <h3>Điều hướng cấp HSK</h3>
          <p class="muted">Cấu trúc bám theo mô hình thông tin kỳ thi công khai, nhưng nội dung giải thích là bản gốc và cần giáo viên HSK rà soát trước khi ra mắt.</p>
          <div class="stack">
            ${data.examInfo
              .map(
                (item) => `
                  <button class="side-card ${item.level === Number(state.examInfoLevel) ? "active" : ""}" data-exam-level="${item.level}">
                    <strong>HSK cấp ${item.level}</strong>
                    <span>${item.words} từ</span>
                  </button>
                `,
              )
              .join("")}
          </div>
        </aside>
      </section>
    `;
  }

  function renderTestPlan() {
    const years = Object.keys(data.examSchedule);
    const rows = data.examSchedule[state.testPlanYear] || [];
    return `
      <section class="panel">
        <div class="split">
          <div>
            <p class="eyebrow">Về HSK</p>
            <h2>Lịch thi HSK năm ${escapeHtml(state.testPlanYear)}</h2>
            <p class="muted">Chọn năm, xem ngày thi, hạn đăng ký và ngày công bố điểm. Cần kiểm chứng với nguồn chính thức trước khi công bố.</p>
          </div>
          <nav class="year-tabs" aria-label="Năm thi">
            ${years.map((year) => `<button class="tab-btn ${state.testPlanYear === year ? "active" : ""}" data-test-year="${year}">${year}</button>`).join("")}
          </nav>
        </div>
        <table class="table schedule-table">
          <thead>
            <tr><th>Ngày thi</th><th>Môn thi</th><th>Hạn đăng ký thi giấy</th><th>Hạn đăng ký thi online</th><th>Ngày công bố điểm</th></tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row) => `
                  <tr>
                    <td>${escapeHtml(row.date)}</td>
                    <td>${escapeHtml(row.subject)}</td>
                    <td>${escapeHtml(row.paperDeadline)}</td>
                    <td>${escapeHtml(row.onlineDeadline)}</td>
                    <td>${escapeHtml(row.result)}</td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
        <article class="card warning" style="margin-top:16px">
          <strong>Ghi chú triển khai</strong>
          <p class="muted">Dữ liệu lịch thi là seed để triển khai. Khi chạy thật cần đồng bộ từ nguồn thi tiếng Trung chính thức hoặc duyệt thủ công trong admin.</p>
        </article>
      </section>
    `;
  }

  function renderRegulation() {
    const active = data.regulationTopics.find((item) => item.key === state.regulationTopic) || data.regulationTopics[0];
    return `
      <section class="grid two-col">
        <div class="panel">
          <p class="eyebrow">Về HSK</p>
          <h2>Quy định thi</h2>
          <p class="muted">Hướng dẫn vận hành cho đăng ký, ảnh thí sinh, phiếu dự thi, đổi ngày thi, quy định phòng thi, điểm thi và dịch vụ bổ sung.</p>
          <div class="regulation-flow">
            ${data.regulationTopics
              .map(
                (item, index) => `
                  <button class="flow-step ${item.key === state.regulationTopic ? "active" : ""}" data-regulation="${escapeHtml(item.key)}">
                    <span>${String(index + 1).padStart(2, "0")}</span>
                    <strong>${escapeHtml(item.title)}</strong>
                  </button>
                `,
              )
              .join("")}
          </div>
        </div>
        <aside class="panel">
          <p class="eyebrow">Quy định đang chọn</p>
          <h2>${escapeHtml(active.title)}</h2>
          <p class="muted">${escapeHtml(active.body)}</p>
          <div class="stack">
            <article class="card"><strong>Bộ nhắc lịch</strong><p class="muted">Kết nối chủ đề này với email, SMS, thông báo trong app và lịch cá nhân.</p></article>
            <article class="card"><strong>Quản trị nội dung</strong><p class="muted">Bộ phận hỗ trợ/admin có thể cập nhật câu chữ và nguồn tham khảo mà không cần deploy frontend.</p></article>
          </div>
        </aside>
      </section>
    `;
  }

  function renderAppDownload() {
    const pwaCards = [
      ["Cài nhanh dạng PWA", state.isStandalone ? "Đã chạy như app" : state.pwaInstallPrompt ? "Sẵn sàng cài" : "Mở bằng Chrome/Edge/Safari rồi chọn Add to Home Screen"],
      ["Offline shell", "Cache app shell, trang offline, dữ liệu seed và giao diện học."],
      ["Native app phase sau", "React Native/Flutter sẽ dùng lại API, CMS, đề, rubric và tài khoản."],
      ["Khác biệt với đối thủ", "Ưu tiên HSK 7-9, luyện dịch/nói, workflow giáo viên và dashboard nội dung."],
    ];
    return `
      <section class="download-hero">
        <div>
          <p class="eyebrow">Tải ứng dụng</p>
          <h1>Ứng dụng ${escapeHtml(data.brand.appName)}</h1>
          <p class="muted">${escapeHtml(data.appDownload.tagline)}</p>
          <div class="hero-actions">
            <button class="btn primary" data-action="install-pwa">${state.isStandalone ? "Đã cài dạng app" : "Cài bản web app"}</button>
            ${data.appDownload.stores
              .map(([name, url]) => `<button class="btn ghost" data-action="app-store">${escapeHtml(name)}</button><span class="muted">${escapeHtml(url)}</span>`)
              .join("")}
          </div>
          <div class="tag-row">
            <span class="tag ${state.isOnline ? "ok" : "vip"}">${state.isOnline ? "Online" : "Offline"}</span>
            <span class="tag ${state.isStandalone ? "ok" : ""}">${state.isStandalone ? "Standalone app" : "Browser/PWA ready"}</span>
          </div>
          ${state.pwaMessage ? `<article class="card feedback"><p class="muted">${escapeHtml(state.pwaMessage)}</p></article>` : ""}
        </div>
        <div class="phone-preview">
          <div class="phone-notch"></div>
          <h3>Hôm nay</h3>
          <p class="muted">Lộ trình HSK ${state.level}</p>
          ${progressBar(level().readiness)}
          <div class="mini-options"><button>Nghe</button><button>Đọc</button><button>Dịch</button><button>Nói</button></div>
        </div>
      </section>
      <section class="panel">
        <div class="split">
          <div>
            <p class="eyebrow">Mobile readiness</p>
            <h2>Bản mobile hiện tại: PWA cài được, native app ở phase sau</h2>
            <p class="muted">PWA giúp thử nghiệm trên điện thoại ngay: có manifest, icon, cache nền và trang offline. Khi backend ổn định, native iOS/Android sẽ dùng lại cùng dữ liệu, tài khoản, đề thi và workflow giáo viên.</p>
          </div>
          <span class="tag ok">PWA v1</span>
        </div>
        <div class="grid module-grid">
          ${pwaCards.map(([name, desc]) => `<article class="card"><h3>${escapeHtml(name)}</h3><p class="muted">${escapeHtml(desc)}</p></article>`).join("")}
        </div>
      </section>
      <section class="panel">
        <h2>Mô hình tính năng ứng dụng</h2>
        <div class="grid module-grid">
          ${data.appDownload.features
            .map(([name, desc]) => `<article class="card"><h3>${escapeHtml(name)}</h3><p class="muted">${escapeHtml(desc)}</p></article>`)
            .join("")}
        </div>
      </section>
    `;
  }

  function renderTutoring() {
    return `
      <section class="grid two-col">
        <div class="panel">
          <div class="split">
            <div>
              <p class="eyebrow">Gia sư 1-1</p>
              <h2>Giáo viên hướng dẫn và sửa bài viết</h2>
              <p class="muted">Module gồm trọng điểm HSK, chiến lược học, phân tích xu hướng đề, lớp gia sư, sửa bài viết và tín chỉ giáo viên.</p>
            </div>
            <button class="btn primary" data-action="book-tutoring">Đặt lịch học thử</button>
          </div>
          <div class="grid module-grid">
            ${data.tutoringModules
              .map(([name, desc]) => `<article class="card"><span class="tag">Giáo viên</span><h3>${escapeHtml(name)}</h3><p class="muted">${escapeHtml(desc)}</p></article>`)
              .join("")}
          </div>
          ${state.tutoringMessage ? `<article class="card feedback"><p class="muted">${escapeHtml(state.tutoringMessage)}</p></article>` : ""}
        </div>
        <aside class="panel">
          <h3>Hàng đợi vận hành giáo viên</h3>
          <table class="table">
            <tbody>
              <tr><td>Tín chỉ sửa bài viết</td><td>Còn 3 lượt</td></tr>
              <tr><td>SLA giáo viên phản hồi</td><td>24-48 giờ</td></tr>
              <tr><td>Buổi học gợi ý tiếp theo</td><td>Ôn điểm yếu HSK ${state.level}</td></tr>
              <tr><td>Nguồn bài tập</td><td>Câu sai + ghi chú đã lưu</td></tr>
            </tbody>
          </table>
        </aside>
      </section>
    `;
  }

  function renderAccountCenter() {
    const activeKey = state.accountPanel;
    const active = data.accountModules.find(([name]) => slug(name) === activeKey) || data.accountModules[0];
    const effectiveActiveKey = slug(active[0]);
    const accountBlocks = [
      ["Hồ sơ học viên", "Biệt danh, quốc tịch, nơi ở, mục tiêu thi và cấp HSK đang ôn.", "profile"],
      ["Thông báo", "Tin nhắn hệ thống, phản hồi giáo viên, cảnh báo đến hạn ôn và biến động gói học.", "messages"],
      ["Thành viên", `Gói hiện tại: ${state.plan}. Chuẩn bị thêm ngày hết hạn, quyền lợi và lịch sử thanh toán.`, "membership"],
      ["Coupon", "Nhập mã trường học, mã chiến dịch, credit giáo viên sửa bài hoặc license doanh nghiệp.", "coupon"],
      ["Hỗ trợ", "Gửi feedback, lỗi câu hỏi, lỗi audio, yêu cầu tính năng và theo dõi trạng thái ticket.", "support"],
      ["Bảo mật", "Đổi mật khẩu, phiên đăng nhập, xác minh hai bước và cảnh báo thiết bị mới.", "security"],
      ["Quyền riêng tư", "Xuất dữ liệu, yêu cầu xóa tài khoản và lưu audit trail cho super admin.", "privacy"],
    ];
    return `
      <section class="account-shell">
        <aside class="panel side-menu">
          <h3>Trung tâm tài khoản</h3>
          ${data.accountModules
            .map(([name]) => `<button class="${slug(name) === effectiveActiveKey ? "active" : ""}" data-account-panel="${slug(name)}">${escapeHtml(name)}</button>`)
            .join("")}
        </aside>
        <div class="panel">
          <p class="eyebrow">Khu cá nhân</p>
          <h2>${escapeHtml(active[0])}</h2>
          <p class="muted">${escapeHtml(active[1])}</p>
          <div class="grid module-grid">
            <article class="card"><strong>Cấp mục tiêu</strong><p class="muted">HSK ${state.level}</p></article>
            <article class="card"><strong>Thành viên</strong><p class="muted">Gói ${escapeHtml(state.plan)}</p></article>
            <article class="card"><strong>Giao diện</strong><p class="muted">Tiếng Việt</p></article>
          </div>
          <div class="account-form">
            <label>Tài khoản đăng nhập<input class="input" value="learner@example.com" /></label>
            <label>Quốc tịch<input class="input" value="Việt Nam" /></label>
            <label>Cấp đang ôn<input class="input" value="HSK ${state.level}" /></label>
            <label>Ngày thi mục tiêu<input class="input" value="2026-07-18" /></label>
            <textarea class="textarea" placeholder="Nội dung phản hồi, yêu cầu hỗ trợ, lý do xóa tài khoản hoặc mã ưu đãi theo mục đang chọn."></textarea>
            <button class="btn primary" data-action="account-save">${escapeHtml(t("save"))}</button>
          </div>
          <div class="account-modules">
            ${accountBlocks
              .map(
                ([title, desc, kind]) => `
                  <article class="account-module ${kind}">
                    <span class="tag">${escapeHtml(kind)}</span>
                    <h3>${escapeHtml(title)}</h3>
                    <p class="muted">${escapeHtml(desc)}</p>
                  </article>
                `,
              )
              .join("")}
          </div>
          ${state.accountMessage ? `<article class="card feedback" style="margin-top:16px"><p class="muted">${escapeHtml(state.accountMessage)}</p></article>` : ""}
        </div>
      </section>
    `;
  }

  function renderCorporate() {
    return `
      <section class="panel">
        <div class="split">
          <div>
            <p class="eyebrow">Dịch vụ doanh nghiệp</p>
            <h2>Vận hành học và thi cho tổ chức</h2>
            <p class="muted">Mô hình B2B cho trường học, doanh nghiệp, lớp học, giáo viên, bài giao, chỗ học và báo cáo tiến độ.</p>
          </div>
          <button class="btn primary" data-view="pricing">Xem gói tổ chức</button>
        </div>
        <div class="grid module-grid">
          ${data.corporateModules
            .map(([name, desc]) => `<article class="card"><span class="tag">B2B</span><h3>${escapeHtml(name)}</h3><p class="muted">${escapeHtml(desc)}</p></article>`)
            .join("")}
        </div>
      </section>
    `;
  }

  function renderAuth() {
    const tabs = [
      ["login", "Đăng nhập"],
      ["register", "Đăng ký"],
      ["reset", "Đặt lại mật khẩu"],
      ["qr", "Đăng nhập QR"],
    ];
    const isLogin = state.authTab === "login";
    const isRegister = state.authTab === "register";
    const isReset = state.authTab === "reset";
    return `
      <section class="auth-layout">
        <div class="auth-brand panel">
          <h2>${escapeHtml(data.brand.appName)}</h2>
          <p class="muted">Học và luyện thi HSK</p>
          <div class="qr-placeholder">QR</div>
          <p class="muted">Đăng nhập QR cần ứng dụng di động trong tương lai; đây là placeholder gốc, không sao chép QR của bên thứ ba.</p>
        </div>
        <div class="auth-card panel">
          <nav class="auth-tabs">
            ${tabs.map(([key, label]) => `<button class="tab-btn ${state.authTab === key ? "active" : ""}" data-auth-tab="${key}">${label}</button>`).join("")}
          </nav>
          <h1>${escapeHtml(tabs.find(([key]) => key === state.authTab)?.[1] || "Đăng nhập")}</h1>
          ${
            state.authTab === "qr"
              ? '<article class="card"><div class="qr-placeholder">QUÉT</div><p class="muted">Quét bằng ứng dụng di động gốc sau khi app được phát hành.</p></article>'
              : `<div class="account-form">
                  <label>${isReset ? "Nhập tài khoản" : isRegister ? "Nhập email" : "Email / Số điện thoại"}<input class="input" placeholder="${isReset ? "Tài khoản" : "Email hoặc số điện thoại"}" /></label>
                  ${(isRegister || isReset) ? '<label>Nhập mã xác minh<input class="input" placeholder="Mã xác minh" /></label>' : ""}
                  <label>${isReset ? "Mật khẩu mới" : "Mật khẩu"}<input class="input" type="password" placeholder="Mật khẩu" /></label>
                  ${isLogin ? '<label class="check-row"><input type="checkbox" checked /> Ghi nhớ đăng nhập</label>' : ""}
                  <button class="btn primary" data-action="auth-submit">${isLogin ? "Đăng nhập" : isRegister ? "Đăng ký" : "Gửi"}</button>
                </div>`
          }
          ${state.authMessage ? `<article class="card feedback"><p class="muted">${escapeHtml(state.authMessage)}</p></article>` : ""}
        </div>
      </section>
    `;
  }

  function translationStats() {
    const sourceLocale = data.sourceLocale || "vi";
    const sourceKeys = Object.keys(data.dict[sourceLocale] || {});
    return data.locales.map(([code, name]) => {
      const dict = data.dict[code] || {};
      const translated = sourceKeys.filter((key) => dict[key]).length;
      const missing = sourceKeys.filter((key) => !dict[key]);
      return {
        code,
        name,
        translated,
        total: sourceKeys.length,
        coverage: sourceKeys.length ? Math.round((translated / sourceKeys.length) * 100) : 0,
        missing,
      };
    });
  }

  function renderTranslationAdmin() {
    const stats = translationStats();
    return `
      <section class="card translation-admin">
        <div class="split">
          <div>
            <p class="eyebrow">${escapeHtml(t("translationAdmin"))}</p>
            <h3>${escapeHtml(t("sourceLanguage"))}: ${escapeHtml(data.sourceLocale)} / ${escapeHtml(t("fallbackLanguage"))}: ${escapeHtml(data.fallbackLocale)}</h3>
            <p class="muted">${escapeHtml(data.translationPolicy.machineTranslation)}</p>
          </div>
          <span class="tag">${stats.length} ngôn ngữ</span>
        </div>
        <table class="table">
          <thead><tr><th>Ngôn ngữ</th><th>${escapeHtml(t("coverage"))}</th><th>${escapeHtml(t("missingKeys"))}</th><th>Dự phòng</th></tr></thead>
          <tbody>
            ${stats
              .map(
                (item) => `
                  <tr>
                    <td><strong>${escapeHtml(item.name)}</strong><br><span class="muted">${escapeHtml(item.code)}</span></td>
                    <td>${progressBar(item.coverage)}<span class="muted">${item.coverage}% (${item.translated}/${item.total})</span></td>
                    <td>${item.missing.slice(0, 8).map((key) => `<code>${escapeHtml(key)}</code>`).join(" ")}${item.missing.length > 8 ? " ..." : ""}</td>
                    <td>${item.code === data.sourceLocale ? "ngôn ngữ gốc" : item.code === data.fallbackLocale ? "dự phòng toàn cục" : data.fallbackLocale}</td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </section>
    `;
  }

  function advancedContentStats() {
    const levels = data.advancedExam?.levels || [7, 8, 9];
    const skillKeys = ["listening", "reading", "writing", "translation", "speaking"];
    const minimumSeedPerSkill = 3;
    const advancedPracticeQuestions = data.practiceQuestions.filter((question) => question.level >= 7);
    const coverageRows = levels.flatMap((levelNo) =>
      skillKeys.map((skill) => {
        const questions = data.practiceQuestions.filter((question) => question.level === levelNo && question.skill === skill);
        const issueCount = questions.reduce((total, question) => total + questionIssues(question).length, 0);
        return {
          level: levelNo,
          skill,
          count: questions.length,
          target: minimumSeedPerSkill,
          readiness: Math.min(100, Math.round((questions.length / minimumSeedPerSkill) * 100)),
          issueCount,
        };
      }),
    );
    const advancedMockQuestions = data.mockQuestions.filter((question) => question.band === "advanced");
    const advancedMockSets = data.mockSets.filter((set) => set.band === "advanced");
    const reviewQueue = advancedPracticeQuestions
      .map((question) => ({ question, issues: questionIssues(question), status: contentStatus(question) }))
      .filter((item) => item.issues.length || item.status !== "published")
      .filter((item) => state.contentStatusFilter === "all" || item.status === state.contentStatusFilter);
    const workflowCounts = ["draft", "review", "approved", "published"].map((status) => [
      status,
      advancedPracticeQuestions.filter((question) => contentStatus(question) === status).length,
    ]);
    return {
      coverageRows,
      advancedPracticeQuestions,
      advancedMockQuestions,
      advancedMockSets,
      reviewQueue,
      workflowCounts,
      mockReadiness: data.advancedExam?.questions ? Math.min(100, Math.round((advancedMockQuestions.length / data.advancedExam.questions) * 100)) : 0,
    };
  }

  function contentStatus(item) {
    return state.contentWorkflow[item.id]?.status || item.status || (questionIssues(item).length ? "draft" : "review");
  }

  function nextContentStatus(item) {
    const current = contentStatus(item);
    if (current === "draft") return "review";
    if (current === "review") return "approved";
    if (current === "approved") return "published";
    return "published";
  }

  function previousContentStatus(item) {
    const current = contentStatus(item);
    if (current === "published") return "approved";
    if (current === "approved") return "review";
    if (current === "review") return "draft";
    return "draft";
  }

  function contentStatusLabel(status) {
    const labels = {
      draft: "Nháp",
      review: "Chờ duyệt",
      approved: "Đã duyệt",
      published: "Đã xuất bản",
      all: "Tất cả",
    };
    return labels[status] || status;
  }

  function setContentStatus(id, status) {
    state.contentWorkflow[id] = {
      status,
      updatedAt: new Date().toISOString(),
      reviewer: "local-super-admin",
    };
  }

  function findPracticeQuestion(id) {
    return data.practiceQuestions.find((question) => question.id === id);
  }

  function questionIssues(question) {
    const issues = [];
    if (question.assetStatus) issues.push(question.assetStatus);
    if (question.skill === "listening" && !question.transcript) issues.push("thiếu transcript");
    if (["writing", "translation", "speaking"].includes(question.skill) && !question.rubric) issues.push("thiếu rubric");
    if (!question.analysis) issues.push("thiếu phân tích");
    if (!question.answer) issues.push("thiếu đáp án/khung chấm");
    return issues;
  }

  function renderAdvancedContentOps() {
    const stats = advancedContentStats();
    return `
      <section class="card content-ops">
        <div class="split">
          <div>
            <p class="eyebrow">${escapeHtml(t("advancedHsk"))}</p>
            <h3>Trạm vận hành nội dung HSK 7-9</h3>
            <p class="muted">Theo dõi độ phủ seed, readiness của full mock 98 câu, câu thiếu audio/rubric và gói import cần bổ sung. Đây là dashboard cho content admin/super admin, không phải dữ liệu đề thật.</p>
          </div>
          <span class="tag">${stats.advancedMockQuestions.length}/${data.advancedExam?.questions || 98} câu mock</span>
        </div>
        <div class="grid module-grid">
          ${[
            ["Readiness đề 98 câu", `${stats.mockReadiness}%`, `${stats.advancedMockQuestions.length}/${data.advancedExam?.questions || 98} câu đã nhập`],
            ["Mock set Advanced", stats.advancedMockSets.length, "đề định vị, đề full, mini mock"],
            ["Câu trong bộ lọc", stats.reviewQueue.length, "theo trạng thái duyệt hiện tại"],
            ["Skill nâng cao", 5, "Nghe, Đọc, Viết, Dịch, Nói"],
          ]
            .map(([name, value, desc]) => `<article class="card"><h2>${escapeHtml(value)}</h2><p class="muted">${escapeHtml(name)}</p><p class="muted">${escapeHtml(desc)}</p></article>`)
            .join("")}
        </div>
        <h3>Workflow duyệt/xuất bản</h3>
        <div class="grid module-grid">
          ${stats.workflowCounts
            .map(([status, count]) => `<article class="card"><h2>${count}</h2><p class="muted">${escapeHtml(contentStatusLabel(status))}</p></article>`)
            .join("")}
        </div>
        <nav class="status-filters" aria-label="Lọc trạng thái nội dung">
          ${["all", "draft", "review", "approved", "published"]
            .map(
              (status) => `
                <button class="tab-btn ${state.contentStatusFilter === status ? "active" : ""}" data-content-status-filter="${status}">
                  ${escapeHtml(contentStatusLabel(status))}
                </button>
              `,
            )
            .join("")}
        </nav>
        <h3>Độ phủ câu luyện HSK 7-9</h3>
        <table class="table">
          <thead><tr><th>Cấp</th><th>Kỹ năng</th><th>Đã nhập</th><th>Mục tiêu seed</th><th>Vấn đề</th></tr></thead>
          <tbody>
            ${stats.coverageRows
              .map(
                (row) => `
                  <tr>
                    <td>HSK ${row.level}</td>
                    <td>${escapeHtml(t(row.skill, row.skill))}</td>
                    <td>${progressBar(row.readiness)}<span class="muted">${row.count}/${row.target}</span></td>
                    <td>${row.target} câu seed/kỹ năng</td>
                    <td>${row.issueCount ? `<span class="tag vip">${row.issueCount} lỗi</span>` : '<span class="tag ok">đủ seed</span>'}</td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
        <h3>Hàng đợi duyệt nội dung</h3>
        <table class="table">
          <thead><tr><th>Mã câu</th><th>Cấp</th><th>Kỹ năng</th><th>Trạng thái</th><th>Việc cần xử lý</th><th>Hành động</th></tr></thead>
          <tbody>
            ${
              stats.reviewQueue.length
                ? stats.reviewQueue
                    .slice(0, 12)
                    .map(
                      ({ question, issues, status }) => {
                        const nextStatus = nextContentStatus(question);
                        const blocked = issues.length && ["approved", "published"].includes(nextStatus);
                        const actionLabel =
                          status === "draft" ? "Gửi duyệt" : status === "review" ? "Duyệt" : status === "approved" ? "Xuất bản" : "Đã xuất bản";
                        return `
                        <tr>
                          <td><code>${escapeHtml(question.id)}</code></td>
                          <td>HSK ${question.level}</td>
                          <td>${escapeHtml(t(question.skill, question.skill))}</td>
                          <td><span class="tag ${status === "published" ? "ok" : status === "approved" ? "ok" : status === "draft" ? "vip" : ""}">${escapeHtml(contentStatusLabel(status))}</span></td>
                          <td>${issues.length ? issues.map((issue) => `<span class="tag">${escapeHtml(issue)}</span>`).join(" ") : '<span class="tag ok">không còn lỗi bắt buộc</span>'}</td>
                          <td>
                            <button class="btn ghost" data-action="content-status-prev" data-question-id="${escapeHtml(question.id)}" ${status === "draft" ? "disabled" : ""}>Lùi</button>
                            <button class="btn primary" data-action="content-status-next" data-question-id="${escapeHtml(question.id)}" ${status === "published" || blocked ? "disabled" : ""}>${escapeHtml(actionLabel)}</button>
                          </td>
                        </tr>
                      `;
                      },
                    )
                    .join("")
                : '<tr><td colspan="6">Không có câu HSK 7-9 nào trong bộ lọc hiện tại.</td></tr>'
            }
          </tbody>
        </table>
        <div class="toolbar" style="justify-content:flex-start;margin-top:12px">
          <button class="btn ghost" data-action="export-advanced-template">Tạo template nhập đề 98 câu</button>
          <button class="btn ghost" data-action="export-review-queue">Export hàng đợi duyệt</button>
        </div>
      </section>
    `;
  }

  function buildAdvancedImportTemplate() {
    const skillPlan = ["listening", "reading", "reading", "writing", "translation", "speaking"];
    return {
      notes: "Template nội bộ để nhập đề Advanced HSK 7-9. Điền nội dung tự biên soạn/cấp phép, không copy đề thật hoặc ngân hàng trả phí.",
      mockSets: [
        {
          id: "advanced-789-full-original-001",
          level: 7,
          band: "advanced",
          group: "HSK 7-9 nâng cao",
          name: "Đề Advanced 98 câu - bản gốc số 1",
          status: "draft",
          questions: 98,
          duration: 210,
        },
      ],
      mockQuestions: Array.from({ length: data.advancedExam?.questions || 98 }, (_, index) => {
        const skill = skillPlan[index % skillPlan.length];
        const no = String(index + 1).padStart(3, "0");
        return {
          id: `adv789-original-001-q${no}`,
          level: 7,
          band: "advanced",
          skill,
          answer: skill === "writing" || skill === "translation" || skill === "speaking" ? "manual" : "TODO",
          prompt: "TODO: nhập đề bài gốc/cấp phép",
          options: skill === "writing" || skill === "translation" || skill === "speaking" ? ["manual"] : ["A", "B", "C", "D"],
        };
      }),
      practiceQuestions: [
        {
          id: "hsk7-sample-custom-001",
          level: 7,
          skill: "translation",
          section: "Dịch Việt - Trung",
          type: "Dịch đoạn văn",
          difficulty: 7,
          source: "original",
          prompt: "TODO: nhập đề dịch",
          options: ["Nộp bản dịch"],
          answer: "TODO: đáp án tham khảo",
          analysis: "TODO: giải thích tiêu chí chấm",
          rubric: ["Đúng nghĩa", "Tự nhiên", "Cấu trúc", "Từ vựng", "Dấu câu"],
        },
      ],
    };
  }

  function validateImportedQuestions(questions) {
    return questions
      .map((question, index) => {
        const issues = [];
        if (!question.id) issues.push("thiếu id");
        if (!question.level) issues.push("thiếu level");
        if (!question.skill) issues.push("thiếu skill");
        if (!question.prompt) issues.push("thiếu prompt");
        if (!question.answer) issues.push("thiếu answer");
        return issues.length ? `Câu ${index + 1}: ${issues.join(", ")}` : "";
      })
      .filter(Boolean);
  }

  function renderContent() {
    const exportShape = {
      brand: data.brand,
      practiceQuestions: data.practiceQuestions,
      vocab: data.vocab,
      mockQuestions: data.mockQuestions,
      mockSets: data.mockSets,
      advancedExam: data.advancedExam,
      contentWorkflow: state.contentWorkflow,
      dict: data.dict,
      translationPolicy: data.translationPolicy,
      protectedCloneTodo: data.protectedCloneTodo,
    };
    const summary = [
      ["Câu luyện tập", data.practiceQuestions.length],
      ["Câu thi thử", data.mockQuestions.length],
      ["Từ vựng", data.vocab.length],
      ["Ngôn ngữ chuẩn bị", data.locales.length],
      ["Key bản dịch", Object.keys(data.dict[data.sourceLocale] || {}).length],
      ["Câu tự import", state.customContent.practiceQuestions.length],
      ["Câu mock tự import", state.customContent.mockQuestions.length],
    ];

    return `
      <section class="grid two-col">
        <div class="panel">
          <h2>Quản trị nội dung</h2>
          <p class="muted">Đây là khu vận hành nội dung. Chỉ import câu hỏi tự biên soạn hoặc được cấp phép; không import asset hoặc ngân hàng câu hỏi trả phí của SuperTest.</p>
          <div class="grid module-grid">
            ${summary.map(([name, count]) => `<article class="card"><h2>${count}</h2><p class="muted">${escapeHtml(name)}</p></article>`).join("")}
          </div>
          ${renderAdvancedContentOps()}
          ${renderTranslationAdmin()}
          <textarea class="textarea" data-action="content-input" placeholder='Dán JSON: {"practiceQuestions":[...],"mockQuestions":[...],"mockSets":[...],"vocab":[...],"dict":{...}}' style="margin-top:16px">${escapeHtml(state.contentJson)}</textarea>
          <div class="toolbar" style="justify-content:flex-start;margin-top:12px">
            <button class="btn primary" data-action="import-content">Import nội dung</button>
            <button class="btn ghost" data-action="export-content">Export nội dung</button>
            <button class="btn danger" data-action="reset-progress">Xóa tiến độ cục bộ</button>
          </div>
          ${state.contentMessage ? `<article class="card feedback"><p class="muted">${escapeHtml(state.contentMessage)}</p></article>` : ""}
        </div>
        <aside class="panel">
          <h3>TODO phần không được sao chép</h3>
          <p class="muted">Các mục này cố ý để trống để bổ sung bằng tài nguyên gốc hoặc được cấp phép.</p>
          <ul class="muted">
            ${data.protectedCloneTodo.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
          <details>
            <summary>Xem trước export</summary>
            <pre class="muted">${escapeHtml(JSON.stringify(exportShape, null, 2).slice(0, 1800))}</pre>
          </details>
        </aside>
      </section>
    `;
  }

  function renderPricing() {
    return `
      <section class="panel">
        <h2>Mô hình gói học và quyền sử dụng</h2>
        <p class="muted">Quyền sử dụng được chia theo tính năng: phần luyện tập, luyện thông minh, bộ đề thi thử, AI sửa viết, luyện nói, lớp B2B và báo cáo admin.</p>
        <div class="grid module-grid">
          ${data.plans
            .map(
              (plan) => `
                <article class="card ${state.plan === plan.name ? "feedback" : ""}">
                  <span class="tag">${escapeHtml(plan.price)}</span>
                  <h2>${escapeHtml(plan.name)}</h2>
                  <ul class="muted">
                    ${plan.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join("")}
                  </ul>
                  <p class="muted"><strong>Quyền:</strong> ${escapeHtml(plan.entitlements.join(", "))}</p>
                  <button class="btn ${state.plan === plan.name ? "ghost" : "primary"}" data-plan="${escapeHtml(plan.name)}">
                    ${state.plan === plan.name ? "Gói hiện tại" : "Chọn gói"}
                  </button>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>
    `;
  }

  function renderSystem() {
    const entities = [
      ["Người dùng/Hồ sơ", "Mục tiêu, ngôn ngữ, cấp mục tiêu, thành viên, phản hồi, xóa tài khoản"],
      ["CMS nội dung", "Cấp độ, kỹ năng, phần thi, câu hỏi, lựa chọn, audio, hình ảnh, giải thích, trạng thái duyệt"],
      ["Kiểm duyệt HSK 7-9", "Độ phủ câu nâng cao, bộ đề 98 câu, rubric dịch/nói, audio speaking, hàng đợi giáo viên"],
      ["Bộ máy làm bài", "Lượt luyện, lượt thi, đáp án, thời lượng, độ tự tin, điểm số"],
      ["Kho cá nhân", "Câu sai, câu đã lưu, ghi chú, bài viết, lịch ôn, điểm yếu"],
      ["Dịch vụ AI", "Chẩn đoán, giải thích, sửa bài viết, tạo bài luyện"],
      ["Thương mại", "Gói, quyền sử dụng, thanh toán, coupon, tín chỉ giáo viên sửa bài"],
      ["B2B", "Tổ chức, lớp học, giáo viên, bài giao, báo cáo học viên"],
    ];
    const adminTasks = [
      ["Super admin", "Cấu hình hệ thống, quản lý vai trò, nhật ký audit, ghi đè thanh toán"],
      ["Quản lý nội dung", "Tạo/sửa/duyệt câu hỏi, audio/hình ảnh, bản dịch"],
      ["Trưởng ban học thuật", "Duyệt rubric HSK 7-9, khóa đề 98 câu, phân công giáo viên chấm dịch/nói"],
      ["Giáo viên", "Chấm bài viết, giao bài luyện, theo dõi tiến độ lớp"],
      ["Hỗ trợ", "Tra cứu người dùng, kích hoạt coupon, xử lý phản hồi/tin nhắn"],
      ["Tài chính", "Gói học, hóa đơn, hoàn tiền, báo cáo doanh thu"],
    ];
    return `
      <section class="grid two-col">
        <div class="panel">
          <h2>Bản đồ triển khai hệ thống</h2>
          <p class="muted">Mô hình vận hành sản phẩm thật: ứng dụng người học và back office super-admin.</p>
          <table class="table">
            <thead><tr><th>Module</th><th>Phạm vi</th></tr></thead>
            <tbody>
              ${entities.map(([name, scope]) => `<tr><td><strong>${escapeHtml(name)}</strong></td><td>${escapeHtml(scope)}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
        <aside class="panel">
          <h3>Bảng điều khiển Super Admin</h3>
          <div class="stack">
            ${adminTasks
              .map(
                ([role, scope]) => `
                  <article class="card">
                    <h3>${escapeHtml(role)}</h3>
                    <p class="muted">${escapeHtml(scope)}</p>
                  </article>
                `,
              )
              .join("")}
          </div>
        </aside>
      </section>
    `;
  }

  function renderProfileModal() {
    return `
      <div class="modal-backdrop" data-action="close-profile">
        <section class="modal" onclick="event.stopPropagation()">
          <div class="split">
            <h2>Thông tin cá nhân</h2>
            <button class="btn ghost" data-action="close-profile">Đóng</button>
          </div>
          <div class="grid" style="grid-template-columns:1fr 1fr">
            <label>Biệt danh<input class="input" value="HSK Learner" /></label>
            <label>Tài khoản đăng nhập<input class="input" value="learner@example.com" /></label>
            <label>Quốc tịch<input class="input" placeholder="Việt Nam" /></label>
            <label>Nơi ở hiện tại<input class="input" placeholder="Hà Nội" /></label>
            <label>Mục tiêu thi<input class="input" value="Đạt HSK ${state.level}" /></label>
            <label>Cấp đang ôn<input class="input" value="${escapeHtml(level().name)}" /></label>
          </div>
          <div class="toolbar" style="justify-content:flex-start;margin-top:16px">
            <button class="btn primary" data-action="close-profile">${escapeHtml(t("save"))}</button>
            <button class="btn ghost">Đổi mã ưu đãi</button>
            <button class="btn ghost">Phản hồi</button>
          </div>
        </section>
      </div>
    `;
  }

  function bindEvents() {
    document.querySelectorAll("[data-view]").forEach((button) => {
      button.addEventListener("click", () => {
        state.view = button.dataset.view;
        render();
      });
    });

    document.querySelectorAll("[data-level]").forEach((button) => {
      button.addEventListener("click", () => {
        setLevel(Number(button.dataset.level));
        render();
      });
    });

    document.querySelectorAll("[data-level-select]").forEach((select) => {
      select.addEventListener("change", () => {
        setLevel(Number(select.value));
        render();
      });
    });

    document.querySelectorAll("[data-skill]").forEach((button) => {
      button.addEventListener("click", () => {
        state.skill = button.dataset.skill;
        state.view = state.skill === "tests" ? "mock" : state.skill === "writing" ? "writing" : "practice";
        if (state.skill === "tests") state.mockSeconds = currentMockDurationSeconds();
        state.selectedQuestion = 0;
        state.selectedAnswer = "";
        state.analysisOpen = false;
        render();
      });
    });

    document.querySelectorAll("[data-question-index]").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedQuestion = Number(button.dataset.questionIndex);
        state.selectedAnswer = "";
        state.analysisOpen = false;
        render();
      });
    });

    document.querySelectorAll("[data-answer]").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedAnswer = button.dataset.answer;
        state.analysisOpen = true;
        const question = currentQuestion();
        if (state.selectedAnswer !== question.answer && !state.wrongItems.includes(question.id)) {
          state.wrongItems.push(question.id);
        }
        render();
      });
    });

    document.querySelectorAll("[data-mock-answer]").forEach((button) => {
      button.addEventListener("click", () => {
        state.mockAnswers[state.activeMockQuestion] = button.dataset.mockAnswer;
        render();
      });
    });

    document.querySelectorAll("[data-mock-jump]").forEach((button) => {
      button.addEventListener("click", () => {
        state.activeMockQuestion = Number(button.dataset.mockJump);
        render();
      });
    });

    document.querySelectorAll("[data-plan]").forEach((button) => {
      button.addEventListener("click", () => {
        state.plan = button.dataset.plan;
        render();
      });
    });

    document.querySelectorAll("[data-exam-level]").forEach((button) => {
      button.addEventListener("click", () => {
        state.examInfoLevel = Number(button.dataset.examLevel);
        render();
      });
    });

    document.querySelectorAll("[data-test-year]").forEach((button) => {
      button.addEventListener("click", () => {
        state.testPlanYear = button.dataset.testYear;
        render();
      });
    });

    document.querySelectorAll("[data-regulation]").forEach((button) => {
      button.addEventListener("click", () => {
        state.regulationTopic = button.dataset.regulation;
        render();
      });
    });

    document.querySelectorAll("[data-account-panel]").forEach((button) => {
      button.addEventListener("click", () => {
        state.accountPanel = button.dataset.accountPanel;
        render();
      });
    });

    document.querySelectorAll("[data-repo-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        state.repoTab = button.dataset.repoTab;
        render();
      });
    });

    document.querySelectorAll("[data-auth-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        state.authTab = button.dataset.authTab;
        state.authMessage = "";
        render();
      });
    });

    document.querySelectorAll("[data-vocab-grade]").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.dataset.vocabId;
        const current = Number(state.vocabProgress[id] ?? (data.vocab.find((item) => item.hanzi === id)?.mastery || 0));
        const grade = button.dataset.vocabGrade;
        const delta = grade === "known" ? 12 : grade === "hard" ? 4 : -10;
        state.vocabProgress[id] = Math.max(0, Math.min(100, current + delta));
        state.vocabDue[id] = nextVocabDue(grade, state.vocabProgress[id]);
        render();
      });
    });

    document.querySelectorAll("[data-content-status-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        state.contentStatusFilter = button.dataset.contentStatusFilter;
        render();
      });
    });

    document.querySelectorAll("[data-action]").forEach((element) => {
      element.addEventListener("click", handleAction);
      element.addEventListener("change", handleAction);
      element.addEventListener("input", handleAction);
    });
  }

  function setLevel(nextLevel) {
    if (!data.levels.some((item) => item.id === nextLevel)) return;

    state.level = nextLevel;
    if (!(level().sections[state.skill] || []).length) {
      state.skill = data.skills.find((skill) => (level().sections[skill.key] || []).length)?.key || "listening";
    }
    state.selectedQuestion = 0;
    state.selectedAnswer = "";
    state.analysisOpen = false;
    state.activeMockQuestion = 1;
    state.mockAnswers = {};
    state.mockSubmitted = false;
    state.mockStarted = false;
    state.mockSeconds = currentMockDurationSeconds();
  }

  function buildProductiveFeedback(question, draft) {
    const text = draft.trim();
    const length = Array.from(text).length;
    const hasConnectors = /因为|所以|不过|但是|首先|其次|最后|然而|因此|总而言之|与此同时/.test(text);
    if (question.skill === "speaking") {
      return {
        "Hoàn thành yêu cầu": length > 40 ? "Bản nháp/transcript đã có đủ chất liệu để chấm nội dung." : "Cần bổ sung mở bài, ví dụ và kết luận rõ hơn.",
        "Tổ chức ý": hasConnectors ? "Đã có tín hiệu liên kết ý. Khi nói cần giữ thứ tự vấn đề - lý do - ví dụ - kết luận." : "Nên dùng 首先, 其次, 例如, 总的来说 để người nghe theo dõi dễ hơn.",
        "Ghi âm": recordedAudioUrl ? "Đã có bản ghi cục bộ để nghe lại và gửi giáo viên khi nối backend." : "Chưa có bản ghi. Hãy ghi âm để kiểm tra tốc độ, ngắt nghỉ và phát âm.",
        "Từ vựng": "Ưu tiên cụm từ cấp cao liên quan trực tiếp đến chủ đề, tránh lặp một động từ quá nhiều lần.",
        "Bước tiếp theo": "Nghe lại bản ghi, đánh dấu đoạn ngập ngừng, rồi nói lại một lần với cùng dàn ý.",
      };
    }
    return {
      "Đúng nghĩa": length > 30 ? "Bản dịch đã có cấu trúc hoàn chỉnh để so với đáp án mẫu." : "Bản dịch còn ngắn, có thể thiếu ý hoặc thiếu quan hệ logic.",
      "Cấu trúc": hasConnectors ? "Đã có liên kết câu. Cần rà lại chủ vị, bổ ngữ và cụm danh hóa." : "Nên dùng cấu trúc tương ứng như 不仅...还..., 并不意味着...而是... hoặc 建立在...基础之上 nếu phù hợp.",
      "Tự nhiên": "Soát lại xem câu đích có giống cách diễn đạt tự nhiên của người bản ngữ, không bám từng chữ quá cứng.",
      "Thuật ngữ": "Giữ nhất quán các cụm học thuật/chính sách, đặc biệt khi dịch hai chiều Việt - Trung.",
      "So với mẫu": question.answer === "manual" ? "Câu này cần giáo viên chấm chi tiết." : `Đáp án tham khảo: ${question.answer}`,
    };
  }

  function toggleSpeakingRecording() {
    if (speechRecorder && speechRecorder.state === "recording") {
      state.recordingStatus = "processing";
      speechRecorder.stop();
      render();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      state.recordingStatus = "error";
      state.contentMessage = "Browser hiện tại không hỗ trợ ghi âm. Trên production cần bật HTTPS và quyền micro.";
      render();
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        speechStream = stream;
        speechChunks = [];
        speechRecorder = new MediaRecorder(stream);
        speechRecorder.addEventListener("dataavailable", (event) => {
          if (event.data.size > 0) speechChunks.push(event.data);
        });
        speechRecorder.addEventListener("stop", () => {
          if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
          const blob = new Blob(speechChunks, { type: speechRecorder.mimeType || "audio/webm" });
          recordedAudioUrl = URL.createObjectURL(blob);
          speechStream?.getTracks().forEach((track) => track.stop());
          speechStream = null;
          state.recordingStatus = "saved";
          render();
        });
        speechRecorder.start();
        state.recordingStatus = "recording";
        render();
      })
      .catch((error) => {
        state.recordingStatus = "error";
        state.contentMessage = `Không mở được micro: ${error.message}`;
        render();
      });
  }

  function handleAction(event) {
    const action = event.currentTarget.dataset.action;
    if (action === "locale") state.locale = event.currentTarget.value;
    if (action === "profile") state.profileOpen = true;
    if (action === "close-profile") state.profileOpen = false;
    if (action === "auth-submit") state.authMessage = "Luồng tài khoản đã được ghi nhận cục bộ. Khi nối backend sẽ cấu hình email/SMS/QR.";
    if (action === "app-store") state.contentMessage = "Link kho ứng dụng đang là TODO. Cần phát hành app gốc trước khi bật nút này.";
    if (action === "account-save") state.accountMessage = "Đã ghi nhận thay đổi cục bộ. Khi nối backend, hồ sơ sẽ đồng bộ theo tài khoản thật.";
    if (action === "install-pwa") {
      if (state.isStandalone) {
        state.pwaMessage = "Ứng dụng đang chạy ở chế độ app độc lập.";
      } else if (state.pwaInstallPrompt) {
        state.pwaInstallPrompt.prompt();
        state.pwaInstallPrompt.userChoice.then((choice) => {
          state.pwaMessage = choice.outcome === "accepted" ? "Đã bắt đầu cài web app." : "Bạn đã bỏ qua cài đặt web app.";
          state.pwaInstallPrompt = null;
          render();
        });
      } else {
        state.pwaMessage = "Nếu chưa thấy prompt, hãy dùng menu trình duyệt: Add to Home Screen / Install app.";
      }
    }
    if (action === "book-tutoring") state.tutoringMessage = "Đã ghi nhận yêu cầu học thử. Bản production cần phân giáo viên, khung giờ, tín chỉ và thông báo.";
    if (action === "check-answer") state.analysisOpen = true;
    if (action === "smart-quiz") {
      state.view = "practice";
      const wrongIndex = questionList().findIndex((item) => state.wrongItems.includes(item.id));
      state.selectedQuestion = wrongIndex >= 0 ? wrongIndex : 0;
    }
    if (action === "play-audio") {
      state.contentMessage = "Audio không được sao chép. Cần thu âm người bản ngữ cho câu này.";
    }
    if (action === "save-item") {
      const question = currentQuestion();
      if (!state.savedItems.includes(question.id)) state.savedItems.push(question.id);
    }
    if (action === "add-note") {
      const question = currentQuestion();
      state.notes.push({
        questionId: question.id,
        text: `Review ${question.type}: ${question.grammar || question.section}`,
        at: new Date().toISOString(),
      });
    }
    if (action === "next-practice") {
      const list = questionList();
      state.selectedQuestion = list.length ? (state.selectedQuestion + 1) % list.length : 0;
      state.selectedAnswer = "";
      state.analysisOpen = false;
    }
    if (action === "mock-prev") state.activeMockQuestion = Math.max(1, state.activeMockQuestion - 1);
    if (action === "mock-next") state.activeMockQuestion = Math.min(mockQuestions().length, state.activeMockQuestion + 1);
    if (action === "mock-start") state.mockStarted = !state.mockStarted;
    if (action === "mock-submit") {
      state.mockSubmitted = true;
      state.mockStarted = false;
    }
    if (action === "essay-input") state.essay = event.currentTarget.value;
    if (action === "save-essay") {
      state.notes.push({ questionId: "essay", text: "Đã lưu bản nháp bài viết", at: new Date().toISOString() });
    }
    if (action === "productive-input") {
      const question = currentQuestion();
      state.productiveDrafts[question.id] = event.currentTarget.value;
    }
    if (action === "save-productive") {
      const question = currentQuestion();
      state.notes.push({ questionId: question.id, text: `Đã lưu bản nháp ${t(question.skill, question.skill)}`, at: new Date().toISOString() });
    }
    if (action === "productive-feedback") {
      const question = currentQuestion();
      const draft = state.productiveDrafts[question.id] || "";
      state.productiveFeedback[question.id] = buildProductiveFeedback(question, draft);
      state.analysisOpen = true;
    }
    if (action === "record-speaking") {
      toggleSpeakingRecording();
      return;
    }
    if (action === "ai-feedback") {
      const length = Array.from(state.essay.trim()).length;
      const hasConnectors = /因为|所以|不过|但是|首先|其次|最后/.test(state.essay);
      state.essayFeedback = {
        "Hoàn thành yêu cầu": length > 80 ? "Nội dung đã đủ phát triển cho một bài viết có giới hạn thời gian." : "Cần thêm ý cụ thể và ví dụ.",
        "Ngữ pháp": hasConnectors ? "Đã dùng từ nối tốt. Cần kiểm tra trật tự từ và trợ từ." : "Nên thêm từ nối như 因为, 所以, 不过 hoặc 最后.",
        "Từ vựng": "Thay các từ lặp lại bằng từ phù hợp với cấp HSK mục tiêu.",
        "Mạch lạc": "Dùng một câu chủ đề rõ, sau đó triển khai ý và kết luận ngắn.",
        "Thời gian thi": length > 0 ? "Lưu bài này và lên lịch viết lại để cải thiện." : "Hãy viết bản nháp trước khi yêu cầu nhận xét.",
      };
    }
    if (action === "repo-filter") state.repoFilter = event.currentTarget.value;
    if (action === "content-input") state.contentJson = event.currentTarget.value;
    if (action === "content-status-next") {
      const question = findPracticeQuestion(event.currentTarget.dataset.questionId);
      if (question) {
        const issues = questionIssues(question);
        const nextStatus = nextContentStatus(question);
        if (issues.length && ["approved", "published"].includes(nextStatus)) {
          state.contentMessage = `Chưa thể chuyển ${question.id} sang ${contentStatusLabel(nextStatus)}: ${issues.join(", ")}.`;
        } else {
          setContentStatus(question.id, nextStatus);
          state.contentMessage = `Đã chuyển ${question.id} sang ${contentStatusLabel(nextStatus)}.`;
        }
      }
    }
    if (action === "content-status-prev") {
      const question = findPracticeQuestion(event.currentTarget.dataset.questionId);
      if (question) {
        const prevStatus = previousContentStatus(question);
        setContentStatus(question.id, prevStatus);
        state.contentMessage = `Đã lùi ${question.id} về ${contentStatusLabel(prevStatus)}.`;
      }
    }
    if (action === "export-advanced-template") {
      state.contentJson = JSON.stringify(buildAdvancedImportTemplate(), null, 2);
      state.contentMessage = "Đã tạo template nhập đề Advanced HSK 7-9 gồm 1 mock set và 98 dòng mock question cần điền nội dung gốc/cấp phép.";
    }
    if (action === "export-review-queue") {
      const queue = advancedContentStats().reviewQueue.map(({ question, issues }) => ({
        id: question.id,
        level: question.level,
        skill: question.skill,
        section: question.section,
        issues,
      }));
      state.contentJson = JSON.stringify({ advancedReviewQueue: queue }, null, 2);
      state.contentMessage = `Đã export ${queue.length} mục trong hàng đợi duyệt HSK 7-9.`;
    }
    if (action === "export-content") {
      state.contentJson = JSON.stringify(
        {
          practiceQuestions: data.practiceQuestions,
          vocab: data.vocab,
        mockQuestions: data.mockQuestions,
        mockSets: data.mockSets,
        advancedExam: data.advancedExam,
        contentWorkflow: state.contentWorkflow,
        dict: data.dict,
          translationPolicy: data.translationPolicy,
          protectedCloneTodo: data.protectedCloneTodo,
        },
        null,
        2,
      );
      state.contentMessage = "Đã export JSON nội dung hiện tại vào ô nhập.";
    }
    if (action === "import-content") {
      try {
        const parsed = JSON.parse(state.contentJson || "{}");
        const newQuestions = Array.isArray(parsed.practiceQuestions) ? parsed.practiceQuestions : [];
        const newVocab = Array.isArray(parsed.vocab) ? parsed.vocab : [];
        const newMockQuestions = Array.isArray(parsed.mockQuestions) ? parsed.mockQuestions : [];
        const newMockSets = Array.isArray(parsed.mockSets) ? parsed.mockSets : [];
        const importedWorkflow = parsed.contentWorkflow && typeof parsed.contentWorkflow === "object" ? parsed.contentWorkflow : {};
        const newDict = parsed.dict && typeof parsed.dict === "object" ? parsed.dict : {};
        const validationIssues = [...validateImportedQuestions(newQuestions), ...validateImportedQuestions(newMockQuestions)];
        state.customContent.practiceQuestions.push(...newQuestions);
        state.customContent.vocab.push(...newVocab);
        state.customContent.mockQuestions.push(...newMockQuestions);
        state.customContent.mockSets.push(...newMockSets);
        Object.assign(state.contentWorkflow, importedWorkflow);
        Object.entries(newDict).forEach(([locale, messages]) => {
          if (!state.customTranslations[locale]) state.customTranslations[locale] = {};
          Object.assign(state.customTranslations[locale], messages || {});
        });
        mergeCustomContent();
        state.contentMessage = `Đã import ${newQuestions.length} câu luyện, ${newMockQuestions.length} câu mock, ${newMockSets.length} bộ đề, ${newVocab.length} từ vựng, ${Object.keys(importedWorkflow).length} trạng thái duyệt và ${Object.keys(newDict).length} block bản dịch.${validationIssues.length ? ` Cảnh báo: ${validationIssues.slice(0, 5).join("; ")}${validationIssues.length > 5 ? "..." : ""}` : ""}`;
      } catch (error) {
        state.contentMessage = `Import thất bại: ${error.message}`;
      }
    }
    if (action === "reset-progress") {
      localStorage.removeItem("hsk-platform-state");
      location.reload();
      return;
    }
    render();
  }

  setInterval(() => {
    if (state.mockStarted && state.mockSeconds > 0) {
      state.mockSeconds -= 1;
      persist();
      render();
    }
  }, 1000);

  render();
})();
