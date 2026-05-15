// 4컷 카툰 탭
const { useState: useStateC, useMemo: useMemoC, useEffect: useEffectC } = React;

function CartoonTab() {
  const [chars, setChars] = useStateC(["배추", "상추"]);
  const [anth, setAnth] = useStateC(true);

  const cats = Object.keys(D.TALMUD_CATEGORIES);
  const [cat, setCat] = useStateC(cats[0]);
  const [storyIdx, setStoryIdx] = useStateC(0); // 0..99
  const [lesson, setLesson] = useStateC(D.TALMUD_CATEGORIES[cats[0]].stories[0]);
  const [storySearch, setStorySearch] = useStateC("");

  // 카테고리 변경 시 첫 스토리로 초기화
  useEffectC(() => {
    setStoryIdx(0);
    setLesson(D.TALMUD_CATEGORIES[cat].stories[0]);
  }, [cat]);

  const pickStory = (i) => {
    setStoryIdx(i);
    setLesson(D.TALMUD_CATEGORIES[cat].stories[i]);
  };

  const stories = D.TALMUD_CATEGORIES[cat].stories;
  const filteredStories = useMemoC(() => {
    if (!storySearch.trim()) return stories.map((s, i) => ({ s, i }));
    const lower = storySearch.toLowerCase();
    return stories
      .map((s, i) => ({ s, i }))
      .filter(({ s, i }) => s.toLowerCase().includes(lower) || String(i + 1).includes(lower));
  }, [stories, storySearch]);

  // 매번 같은 시드로 일관된 카메라/클로즈업 컷 결정
  const planning = useMemoC(() => {
    // 시드: cat + storyIdx → 같은 선택엔 같은 결과
    const seedStr = cat + "::" + storyIdx;
    let h = 0;
    for (let i = 0; i < seedStr.length; i++) {
      h = (h * 31 + seedStr.charCodeAt(i)) | 0;
    }
    // 4개 카메라 뷰 무작위 (중복 없이) — 클로즈업은 분할 컷용으로 따로 보장
    const pool = [
      { ko: "버드아이뷰", en: "bird's eye view" },
      { ko: "전신뷰", en: "full body shot" },
      { ko: "미디엄뷰", en: "medium shot" },
      { ko: "후면뷰", en: "back view" },
      { ko: "정면뷰", en: "front view" },
      { ko: "로우앵글뷰", en: "low angle view" },
      { ko: "투시뷰", en: "perspective view" },
      { ko: "와이드뷰", en: "wide angle shot" },
      { ko: "아이소메트릭뷰", en: "isometric view" },
      { ko: "측면뷰", en: "side profile view" },
    ];
    // seeded shuffle
    const rng = (n) => {
      h = (h * 9301 + 49297) % 233280;
      return Math.floor((h / 233280) * n);
    };
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = rng(i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const cams = shuffled.slice(0, 4);
    const closeupPanel = rng(4); // 0..3 — 분할되는 컷
    const acts = ["전개 (도입)", "발단 (사건 시작)", "위기 (긴장)", "결말 (교훈)"];
    const actsEn = [
      "Setup / Introduction",
      "Inciting incident",
      "Crisis / tension",
      "Resolution / lesson",
    ];
    return { cams, closeupPanel, acts, actsEn };
  }, [cat, storyIdx]);

  const navItems = [
    { id: "c-char", title: "캐릭터", count: chars.length || null },
    { id: "c-cat", title: "탈무드 카테고리", count: null },
    { id: "c-story", title: "스토리 선택 (100)", count: storyIdx + 1 },
    { id: "c-lesson", title: "교훈 한 줄", count: null },
    { id: "c-plan", title: "4컷 구성", count: null },
    { id: "c-final", title: "최종 확정", count: null },
  ];

  const [active, setActive] = useStateC("c-char");
  const jump = (id) => {
    setActive(id);
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const prompt = useMemoC(() => {
    const lines = [];
    lines.push("=== ODUNGI HARU — 4-PANEL TALMUD CARTOON PROMPT ===");
    lines.push("");

    // Characters
    const block = buildCharacterBlock(chars, { anthropomorphic: anth });
    if (block.imageRefs) {
      lines.push("[CHARACTERS]");
      lines.push("Reference images attached: " + block.imageRefs);
      lines.push("Character descriptions for consistency:");
      lines.push(block.descriptions);
      lines.push(
        "All four panels MUST use the EXACT same character appearance, fur/hair colors, body proportions and outfits. Match each attached reference photo to its labeled character above. Only facial expressions and poses vary across panels."
      );
      if (anth && chars.some((k) => D.ANIMAL_KEYS.includes(k))) {
        lines.push(
          "Animal characters (Baechu, Sangchu, Yeolmu, Ggami, Gimchi) are ANTHROPOMORPHIZED: they stand upright on two legs, gesture with paws like hands, and act like human characters throughout all four panels."
        );
      }
      lines.push("");
    }

    // Story / lesson
    lines.push(`[CATEGORY] ${cat} (${D.TALMUD_CATEGORIES[cat].en})`);
    lines.push(`[TALMUD STORY #${storyIdx + 1}] ${stories[storyIdx]}`);
    lines.push(`[ONE-LINE LESSON / KOREAN] ${lesson}`);
    lines.push(
      "Do NOT translate literally. Interpret the lesson freely so the four panels deliver the Talmud moral with clarity and emotional weight."
    );
    lines.push("");

    // Composition
    lines.push("[FORMAT]");
    lines.push(
      "Output is a SINGLE high-end digital cartoon image with a 9:16 vertical aspect ratio. The image contains 4 panels stacked VERTICALLY from top to bottom (1st panel at the top → 4th panel at the bottom). Each panel has an equal, clean white border / gutter around it (approx 24px white frame and white gutters between panels). Panels share the same character design language and consistent line weight."
    );
    lines.push(
      "IMPORTANT: Do NOT print any panel numbers, numerals, or labels (no '1', '2', '3', '4', no '#1', no 'Panel 1') anywhere inside or on the panels. The reading order is implied purely by the vertical stacking from top to bottom."
    );
    lines.push(
      `RANDOM SPLIT PANEL: the ${
        ["1st (top)", "2nd", "3rd", "4th (bottom)"][planning.closeupPanel]
      } panel — and ONLY this one panel — is divided VERTICALLY into two equal halves by a thin white gutter. The LEFT half shows the main composition (using the camera view assigned below). The RIGHT half is a CLOSE-UP shot of the SAME moment — character's eyes, hands, or a key object — to amplify the emotion. Both halves share one outer white border so the split is clearly read as a single panel. The other three panels remain as single, un-split frames.`
    );
    lines.push(
      "All four panels must use DIFFERENT camera angles — never repeat. Use the angles assigned below. Focus / out-of-focus must be designed to maximize persuasion of the lesson: sharp focus on the meaningful element, soft bokeh on supporting elements."
    );
    lines.push("");

    // Per-panel
    lines.push("[PANEL-BY-PANEL DIRECTIONS] (positional only — do NOT render these labels)");
    for (let i = 0; i < 4; i++) {
      const cam = planning.cams[i];
      const isCU = i === planning.closeupPanel;
      const posName = ["TOP", "SECOND", "THIRD", "BOTTOM"][i];
      lines.push(
        `${posName} panel — ${planning.actsEn[i]} — Camera: ${cam.en} (${cam.ko})${
          isCU
            ? " — SPLIT PANEL: left half uses this camera view, right half is an extreme close-up of the same scene's key emotional detail"
            : ""
        }. Characters express a NEW emotion and pose distinct from the other panels. Use focus / depth-of-field to drive the message home. Include a concise English speech bubble (max ~8 words) that pushes the story forward and lands the moral.`
      );
    }
    lines.push("");

    // Bubble & text overlays
    lines.push("[TEXT OVERLAYS]");
    lines.push(
      `At the TOP CENTER of the entire image (above or within the top panel area, outside any speech bubble): write the category label in KOREAN — "${cat}" — in a clean, bold, slightly playful Korean typeface.`
    );
    lines.push(
      `At the BOTTOM CENTER of the entire image (below or within the bottom panel area): write the one-line Talmud lesson in KOREAN — "${lesson}" — in a clean, readable Korean typeface, centered, with subtle weight.`
    );
    lines.push(
      "All speech bubbles inside panels are in ENGLISH, kept short and conversational. Do not crowd the panels with text. Do NOT render any panel numbers anywhere."
    );
    lines.push("");

    lines.push(
      "[STYLE] High-end digital cartoon illustration. Warm color palette. Crisp linework. Cinematic lighting per panel that matches the story beat. Maintain identical character look across all panels — the only variations are expression, pose, camera angle, and background."
    );

    return lines.join("\n");
  }, [chars, anth, cat, storyIdx, lesson, planning, stories]);

  const reset = () => {
    if (!confirm("선택한 항목을 모두 초기화할까요?")) return;
    setChars([]);
    setCat(cats[0]);
    setStoryIdx(0);
    setLesson(D.TALMUD_CATEGORIES[cats[0]].stories[0]);
  };

  return (
    <div className="layout">
      <Sidebar items={navItems} active={active} onJump={jump} />
      <div className="content">
        <div className="tab-header">
          <h1>📚 4컷 카툰 (탈무드) 프롬프트</h1>
          <p>
            카테고리와 스토리 번호를 고르면 4컷 구성·카메라 뷰·분할 클로즈업 컷이 자동
            구성됩니다. 캐릭터는 첨부 이미지와 라벨 매핑으로 일관성을 유지합니다.
          </p>
        </div>

        <Section id="c-char" title="캐릭터" hint="복수 선택 가능" badge={chars.length}>
          <CharacterPicker value={chars} onChange={setChars} multi />
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={anth}
              onChange={(e) => setAnth(e.target.checked)}
            />
            <span>
              동물 캐릭터(배추·상추·열무·까미·김치)는 <b>의인화</b>하여 두 다리로 서서 연출
            </span>
          </label>
        </Section>

        <Section id="c-cat" title="탈무드 카테고리" hint={`${cats.length}개 · 단일 선택`}>
          <div className="chip-row">
            {cats.map((k) => (
              <button
                key={k}
                className={"chip" + (cat === k ? " on" : "")}
                onClick={() => setCat(k)}
                title={D.TALMUD_CATEGORIES[k].en}
              >
                {k}
                <span className="chip-en">{D.TALMUD_CATEGORIES[k].en}</span>
              </button>
            ))}
          </div>
        </Section>

        <Section
          id="c-story"
          title={`스토리 선택 (${stories.length}개)`}
          hint="번호를 고르면 아래 교훈에 자동 반영됩니다"
        >
          <div className="chip-search">
            <input
              type="text"
              placeholder="번호 또는 키워드 검색"
              value={storySearch}
              onChange={(e) => setStorySearch(e.target.value)}
            />
            {storySearch && (
              <button className="x" onClick={() => setStorySearch("")}>
                ×
              </button>
            )}
          </div>
          <div className="story-grid">
            {filteredStories.map(({ s, i }) => (
              <button
                key={i}
                className={"story-card" + (storyIdx === i ? " on" : "")}
                onClick={() => pickStory(i)}
              >
                <div className="story-num">#{i + 1}</div>
                <div className="story-text">{s}</div>
              </button>
            ))}
          </div>
        </Section>

        <Section id="c-lesson" title="교훈 한 줄" hint="자동 채워짐 · 직접 수정 가능">
          <input
            type="text"
            value={lesson}
            onChange={(e) => setLesson(e.target.value)}
            className="lesson-input"
            placeholder="교훈을 한 줄로 입력하세요"
          />
        </Section>

        <Section id="c-plan" title="4컷 자동 구성" hint="카메라 뷰 중복 없이 다양하게 배치됩니다">
          <div className="panel-plan">
            {planning.acts.map((label, i) => {
              const isCU = i === planning.closeupPanel;
              return (
                <div key={i} className={"panel-box" + (isCU ? " split" : "")}>
                  <div className="panel-num">#{i + 1}</div>
                  <div className="panel-act">{label}</div>
                  <div className="panel-cam">📷 {planning.cams[i].ko}</div>
                  {isCU && (
                    <div className="panel-cu">+ 우측 클로즈업 분할</div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="hint">
            상단 중앙 — <b>"{cat}"</b> · 하단 중앙 — <b>"{lesson}"</b> · 비율 9:16
          </p>
        </Section>

        <Section id="c-final" title="최종 확정 / 수정">
          <div className="final-row">
            <button className="btn-ghost" onClick={reset}>
              전체 초기화
            </button>
            <div className="final-summary">
              {cat} · 스토리 #{storyIdx + 1} · 캐릭터 {chars.length}
            </div>
          </div>
          <PromptOutput text={prompt} filename="odungi-cartoon-prompt.txt" />
        </Section>
      </div>
    </div>
  );
}

Object.assign(window, { CartoonTab });
