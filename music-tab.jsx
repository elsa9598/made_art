// 음악 생성 탭
const { useState: useStateM, useMemo: useMemoM, useEffect: useEffectM } = React;

// ── 테마 프리셋 데이터 ──
const THEME_PRESETS = [
  {
    id: "daily",
    icon: "🏡",
    title: "일상과 휴식",
    titleEn: "Daily & Healing",
    desc: "생활 속 편안함을 주거나 익숙한 백색소음이 포함된 음악들입니다.",
    subs: [
      {
        id: "daily-pet",
        label: "반려동물과의 시간",
        desc: "상추, 배추, 열무와 함께 걷는 활기찬 산책 시간이나, 김치와 까미가 낮잠을 자는 나른한 오후에 어울리는 따뜻한 곡들.",
        promptEn: "Warm, comforting instrumental piece evoking a lively walk with pet dogs (Sangchu, Baechu, Yeolmu) or a lazy afternoon nap with cats (Gimchi, Ggami). Gentle acoustic guitar, soft piano, light percussion, cozy and heartwarming atmosphere."
      },
      {
        id: "daily-asmr",
        label: "ASMR 및 자연음",
        desc: "시원하게 물 뿌리는 소리, 기분 좋은 고양이 울음소리 등 일상적인 ASMR 요소가 자연스럽게 믹싱된 릴렉스 음악.",
        promptEn: "Relaxing ambient music with naturally mixed everyday ASMR elements — gentle water spraying sounds, pleasant cat purring, soft rain on windows, rustling leaves. Lo-fi textures, minimal beats, soothing pads, deeply calming and meditative."
      }
    ]
  },
  {
    id: "focus",
    icon: "🎯",
    title: "몰입과 창작",
    titleEn: "Focus & Creation",
    desc: "고도의 집중력이 필요할 때 능률을 높여주는 음악들입니다.",
    subs: [
      {
        id: "focus-work",
        label: "작업의 흐름",
        desc: "복잡한 JSON 데이터를 정리하거나 LRC 가사 동기화 작업을 할 때 몰입감을 유지해 주는 차분하고 규칙적인 비트.",
        promptEn: "Calm, steady, and rhythmically precise focus music for deep work sessions — organizing complex data, coding, and synchronization tasks. Minimal lo-fi hip hop beats, soft Rhodes piano, steady click-track pulse, muted bass, no distracting melodies, pure concentration flow."
      },
      {
        id: "focus-story",
        label: "스토리 기획",
        desc: "네 컷 웹툰의 씬을 구상하고 풍자적인 대본을 작성할 때 영감을 불어넣어 주는 미니멀하고 세련된 연주곡.",
        promptEn: "Minimal, sophisticated instrumental piece that sparks creative inspiration — perfect for brainstorming 4-panel webtoon scenes and writing satirical scripts. Light jazz piano, subtle vibraphone, airy strings, clever rhythmic shifts, elegant and thought-provoking."
      }
    ]
  },
  {
    id: "emotion",
    icon: "💫",
    title: "감성과 서사",
    titleEn: "Emotion & Story",
    desc: "특정 감정이나 삶의 깊은 이야기들을 담아내는 음악들입니다.",
    subs: [
      {
        id: "emotion-family",
        label: "가족과 추억",
        desc: "딸의 결혼식에서 느꼈던 뭉클한 마음이나, 전원주택 마당에서 느끼는 평온한 감정을 담은 서정적인 테마.",
        promptEn: "Lyrical, deeply emotional theme capturing the bittersweet feelings at a daughter's wedding or the tranquil peace of a countryside garden house yard. Swelling strings, gentle piano, warm cello, heartfelt crescendos, tears-of-joy atmosphere, cinematic and deeply moving."
      },
      {
        id: "emotion-philo",
        label: "철학적 사색",
        desc: "철학 일기장의 크라프트지에 글을 적어 내려갈 때 생각을 깊게 만들어주는 잔잔하고 사색적인 선율.",
        promptEn: "Quiet, contemplative, and philosophical melody for deep introspection — writing thoughts on kraft paper in a philosophy journal. Solo piano with reverb, sparse ambient pads, occasional solo cello, slow tempo, meditative pauses between phrases, profound and reflective."
      }
    ]
  },
  {
    id: "oriental",
    icon: "🎋",
    title: "전통과 오리엔탈",
    titleEn: "Traditional & Oriental",
    desc: "동양적인 색채와 전통 악기의 선율이 돋보이는 음악들입니다.",
    subs: [
      {
        id: "oriental-trad",
        label: "전통의 숨결",
        desc: "매일 연습하시는 산조 대금의 깊고 구슬픈 음색이 곡의 메인이 되거나, 국악기와 현대 밴드 사운드가 크로스오버된 퓨전 테마.",
        promptEn: "Fusion of Korean traditional instruments and modern band sounds — featuring the deep, soulful tone of a Sanjo Daegeum (large bamboo flute) as the main melody. Gayageum arpeggios, janggu drum patterns, crossed with electric bass, subtle drum kit, and atmospheric synth pads. Oriental pentatonic scales, hauntingly beautiful and culturally rich."
      }
    ]
  },
  {
    id: "adventure",
    icon: "⚔️",
    title: "탐험과 모험",
    titleEn: "Adventure & Fantasy",
    desc: "장대한 스케일과 역동성을 가진 음악들입니다.",
    subs: [
      {
        id: "adventure-world",
        label: "미지의 세계",
        desc: "거대한 오픈월드를 탐험하거나 서사가 깊은 RPG 게임을 플레이할 때 귓가에 맴도는 웅장하고 판타지풍의 오케스트라 음악.",
        promptEn: "Epic, grand orchestral fantasy music for exploring vast open worlds and narrative-rich RPG adventures. Full symphony orchestra, soaring brass fanfares, thundering timpani, sweeping string melodies, heroic French horn themes, choir chanting, dynamic shifts between quiet wonder and triumphant crescendos."
      }
    ]
  }
];

// 이미지 첨부 (미리보기)
function ImageDrop({ file, onChange }) {
  const inputRef = React.useRef(null);
  const [drag, setDrag] = React.useState(false);

  const handleFile = (f) => {
    if (!f || !f.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ name: f.name, dataUrl: reader.result, size: f.size });
    };
    reader.readAsDataURL(f);
  };

  return (
    <div
      className={"image-drop" + (drag ? " drag" : "") + (file ? " has" : "")}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files[0];
        handleFile(f);
      }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files[0])}
      />
      {file ? (
        <>
          <img src={file.dataUrl} alt={file.name} className="image-preview" />
          <div className="image-meta">
            <div className="image-name">📎 {file.name}</div>
            <div className="image-size">
              {(file.size / 1024).toFixed(1)} KB
            </div>
            <button
              type="button"
              className="btn-ghost image-clear"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
            >
              × 제거
            </button>
          </div>
        </>
      ) : (
        <div className="image-empty">
          <div className="image-icon">🖼</div>
          <div className="image-cta">
            이미지를 드래그하거나 클릭해서 첨부
          </div>
          <div className="image-sub">
            첨부한 이미지는 생성 AI에게도 함께 붙여넣어 주세요
          </div>
        </div>
      )}
    </div>
  );
}

function MusicTab() {
  const [imageFile, setImageFile] = useStateM(null); // {name, dataUrl}
  const [subject, setSubject] = useStateM("");
  const [themePreset, setThemePreset] = useStateM([]); // 선택된 서브 프리셋 id 배열

  const [genre, setGenre] = useStateM([]);
  const [genreCustom, setGenreCustom] = useStateM([]);

  const [mood, setMood] = useStateM([]);
  const [moodCustom, setMoodCustom] = useStateM([]);

  const [vocal, setVocal] = useStateM([]);
  const [chorus, setChorus] = useStateM(["코러스 없음"]);
  const [lang, setLang] = useStateM(["한글 가사"]);

  const [humming, setHumming] = useStateM("");
  const [extra, setExtra] = useStateM("");

  const [imageHint, setImageHint] = useStateM(""); // 첨부 이미지의 분위기 묘사 (사용자 입력)
  const [isGeneratingGenre, setIsGeneratingGenre] = useStateM(false);

  const togglePreset = (subId) => {
    setThemePreset((prev) =>
      prev.includes(subId) ? prev.filter((x) => x !== subId) : [...prev, subId]
    );
  };

  useEffectM(() => {
    if (themePreset.length === 0) return;

    const fetchGenres = async () => {
      setIsGeneratingGenre(true);
      try {
        const selectedThemes = [];
        THEME_PRESETS.forEach((cat) => {
          cat.subs.forEach((sub) => {
            if (themePreset.includes(sub.id)) {
              selectedThemes.push(sub);
            }
          });
        });

        const availableGenres = D.GENRE.map((g) => g.ko).join(", ");
        const promptText = `당신은 음악 장르 전문가입니다. 다음은 사용자가 선택한 음악의 테마 설명입니다:
${selectedThemes.map((t) => "- " + t.desc).join("\n")}

위 테마에 가장 잘 어울리는 음악 장르 딱 3개를 아래 목록에서 골라주세요.
[장르 목록]
${availableGenres}

반드시 위 장르 목록에 있는 정확한 단어로만 3개를 골라 JSON 배열 형태로 출력하세요. 다른 말은 절대 하지 마세요.
예시: ["팝", "인디 포크", "피아노 솔로"]`;

        const res = await fetch("http://localhost:11434/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "qwen2.5:14b",
            prompt: promptText,
            stream: false,
            format: "json"
          }),
        });

        if (res.ok) {
          const data = await res.json();
          let parsed = [];
          try {
            parsed = JSON.parse(data.response.trim());
          } catch (e) {
            const match = data.response.trim().match(/\[(.*?)\]/);
            if (match) {
              parsed = JSON.parse("[" + match[1] + "]");
            }
          }
          if (Array.isArray(parsed)) {
            const validGenres = parsed.filter((g) => D.GENRE.some((x) => x.ko === g)).slice(0, 3);
            if (validGenres.length > 0) {
              setGenre(validGenres);
            }
          }
        }
      } catch (err) {
        console.error("Genre recommendation failed:", err);
      } finally {
        setIsGeneratingGenre(false);
      }
    };

    const timer = setTimeout(fetchGenres, 1000);
    return () => clearTimeout(timer);
  }, [themePreset]);

  const navItems = [
    { id: "m-image", title: "이미지 + 주제", count: (imageFile ? 1 : 0) + (subject.trim() ? 1 : 0) || null },
    { id: "m-theme", title: "테마 프리셋", count: themePreset.length || null },
    { id: "m-genre", title: "장르", count: genre.length || null },
    { id: "m-mood", title: "분위기", count: mood.length || null },
    { id: "m-vocal", title: "보컬", count: vocal.length || null },
    { id: "m-chorus", title: "코러스", count: null },
    { id: "m-lyric", title: "가사 언어", count: null },
    { id: "m-humming", title: "허밍", count: null },
    { id: "m-extra", title: "추가 옵션", count: null },
    { id: "m-final", title: "최종 확정", count: null },
  ];

  const [active, setActive] = useStateM("m-image");
  const jump = (id) => {
    setActive(id);
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const prompt = useMemoM(() => {
    const lines = [];
    lines.push("=== ODUNGI HARU — MUSIC PROMPT ===");
    lines.push("");

    if (subject.trim()) {
      lines.push(`[SUBJECT / THEME] ${subject.trim()}`);
      lines.push("");
    }

    // 테마 프리셋 반영
    if (themePreset.length) {
      lines.push("[THEMATIC DIRECTION]");
      THEME_PRESETS.forEach((cat) => {
        cat.subs.forEach((sub) => {
          if (themePreset.includes(sub.id)) {
            lines.push(`• ${cat.titleEn} — ${sub.label}: ${sub.promptEn}`);
          }
        });
      });
      lines.push("");
    }

    lines.push("[REFERENCE IMAGE]");
    if (imageFile) {
      lines.push(
        `An image is attached (filename: ${imageFile.name}). Analyze its mood, color palette, lighting, composition, and subject matter.`
      );
    } else {
      lines.push(
        "A reference image will be attached separately. Analyze its mood, color palette, lighting, composition, and subject matter."
      );
    }
    lines.push(
      "From the attached image AND the subject above, automatically derive: the instrument set, the tempo (BPM), and the musical key (major / minor). Pick instruments and harmony that emotionally match BOTH the image and the subject."
    );
    if (imageHint.trim()) {
      lines.push(`Additional reference notes: ${imageHint.trim()}`);
    }
    lines.push("");

    if (genre.length) {
      const en = uniq(genre.map((k) => labelToEn(D.GENRE, k)));
      lines.push("[GENRE] " + en.join(", "));
    }
    if (mood.length) {
      const en = uniq(mood.map((k) => labelToEn(D.MOOD, k)));
      lines.push("[MOOD] " + en.join(", "));
    }

    // Vocal includes lyric language hint
    if (vocal.length) {
      const en = uniq(vocal.map((k) => labelToEn(D.VOCAL, k)));
      lines.push("[VOCAL] " + en.join(", "));
    }
    if (chorus.length) {
      const en = labelToEn(D.CHORUS, chorus[0]);
      lines.push("[BACKING CHORUS] " + en);
    }
    if (lang.length) {
      const en = labelToEn(D.LYRIC_LANG, lang[0]);
      lines.push(
        `[LYRIC LANGUAGE] ${en}. The lead vocalist sings in this language; pronunciation should be natural and clear.`
      );
    }

    if (humming.trim()) {
      lines.push(`[HUMMING] ${humming.trim()}`);
    }
    if (extra.trim()) {
      lines.push(`[ADDITIONAL] ${extra.trim()}`);
    }

    lines.push("");
    lines.push(
      "[LENGTH] Target total duration is approximately 3 minutes (around 2:50–3:10). Structure the arrangement — intro, verses, chorus/hook, bridge, and outro — to fit naturally within this length, without abrupt cuts or unfinished phrases."
    );
    lines.push(
      "[HARMONY — STRICT] ABSOLUTELY NO dissonant or clashing tone combinations. Do NOT use atonal clusters, harsh microtonal beating, accidentals that fight the established key, or simultaneous notes that produce unpleasant minor-2nd / tritone collisions on strong beats. Every voicing — lead vocal, backing chorus, and all instruments — must stay consonant within the chosen key, blend smoothly, and resolve cleanly. Prioritize emotional clarity and a pleasant, well-tuned sound over experimental dissonance."
    );
    lines.push("");
    lines.push(
      "[AUTO-DETECT FROM IMAGE + SUBJECT] Choose the instrument set, tempo (BPM), and key (major / minor) that best fit both the mood of the attached image AND the subject above. Output a ~3-minute song that matches all directives above."
    );

    return lines.join("\n");
  }, [genre, mood, vocal, chorus, lang, humming, extra, imageHint, subject, imageFile, themePreset]);

  const reset = () => {
    if (!confirm("선택한 항목을 모두 초기화할까요?")) return;
    setImageFile(null);
    setSubject("");
    setThemePreset([]);
    setGenre([]);
    setGenreCustom([]);
    setMood([]);
    setMoodCustom([]);
    setVocal([]);
    setChorus(["코러스 없음"]);
    setLang(["한글 가사"]);
    setHumming("");
    setExtra("");
    setImageHint("");
  };

  return (
    <div className="layout">
      <Sidebar items={navItems} active={active} onJump={jump} />
      <div className="content">
        <div className="tab-header">
          <h1>🎵 음악 생성 프롬프트</h1>
          <p>
            악기·템포·키는 <b>첨부 이미지 분석</b>으로 자동 결정됩니다. 분위기를 텍스트로
            추가 설명하면 더 정확해져요.
          </p>
        </div>

        <Section
          id="m-image"
          title="이미지 첨부 + 주제"
          hint="이미지는 미리보기용 · 주제는 곡의 큰 방향. 둘을 합쳐 악기·템포·키가 자동 결정됩니다"
        >
          <ImageDrop
            file={imageFile}
            onChange={setImageFile}
          />
          <div className="subject-row">
            <label className="subject-label">🎯 주제 (한 줄)</label>
            <input
              type="text"
              className="subject-input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="예: 비 오는 날 창가의 강아지 / 첫 눈 내린 아침 산책 / 늦은 밤 우리집 식탁"
            />
          </div>
        </Section>

        <Section
          id="m-theme"
          title="테마 프리셋"
          hint="곡의 방향성을 빠르게 잡아주는 테마 · 복수 선택 가능"
          badge={themePreset.length}
        >
          <div className="theme-presets">
            {THEME_PRESETS.map((cat) => (
              <div key={cat.id} className="theme-category">
                <div className="theme-cat-header">
                  <span className="theme-cat-icon">{cat.icon}</span>
                  <div className="theme-cat-info">
                    <div className="theme-cat-title">
                      {cat.title}
                      <span className="theme-cat-en">{cat.titleEn}</span>
                    </div>
                    <div className="theme-cat-desc">{cat.desc}</div>
                  </div>
                </div>
                <div className="theme-subs">
                  {cat.subs.map((sub) => {
                    const on = themePreset.includes(sub.id);
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        className={"theme-sub-card" + (on ? " on" : "")}
                        onClick={() => togglePreset(sub.id)}
                      >
                        <div className="theme-sub-top">
                          <span className="theme-sub-label">{sub.label}</span>
                          {on && <span className="theme-sub-check">✓</span>}
                        </div>
                        <div className="theme-sub-desc">{sub.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="m-genre" title="장르" hint={`${D.GENRE.length}개 + 직접 입력 · 복수 가능`} badge={genre.length}>
          {isGeneratingGenre && (
            <div className="hint" style={{ color: 'var(--accent)', fontWeight: 600, marginTop: '-6px', marginBottom: '8px' }}>
              ✨ AI가 어울리는 장르를 고민하고 있어요...
            </div>
          )}
          <ChipPicker
            list={D.GENRE}
            value={genre}
            onChange={setGenre}
            customs={genreCustom}
            onAddCustom={(v) => setGenreCustom(uniq([...genreCustom, v]))}
          />
        </Section>

        <Section id="m-mood" title="분위기" hint={`${D.MOOD.length}개 + 직접 입력 · 복수 가능`} badge={mood.length}>
          <ChipPicker
            list={D.MOOD}
            value={mood}
            onChange={setMood}
            customs={moodCustom}
            onAddCustom={(v) => setMoodCustom(uniq([...moodCustom, v]))}
          />
        </Section>

        <Section
          id="m-auto"
          title="악기 · 템포 · 키 (자동)"
          hint="첨부 이미지 + 주제에서 자동 추출. 원하면 아래에 보조 설명을 적어주세요."
        >
          <div className="auto-card">
            <div className="auto-row">
              <span className="pill">🎼 악기</span>
              <span className="pill">⏱ 템포 (BPM)</span>
              <span className="pill">🎹 키 (Major/Minor)</span>
              <span className="auto-note">
                {imageFile ? "✓ 이미지 첨부됨" : "이미지 첨부 대기"}
                {" · "}
                {subject.trim() ? "✓ 주제 입력됨" : "주제 입력 대기"}
              </span>
            </div>
            <textarea
              placeholder="이미지의 분위기를 추가로 설명 (예: 따뜻한 가을 햇살, 잔잔한 호수)"
              value={imageHint}
              onChange={(e) => setImageHint(e.target.value)}
              rows={3}
            />
          </div>
        </Section>

        <Section id="m-vocal" title="보컬" hint="복수 선택 가능" badge={vocal.length}>
          <ChipPicker
            list={D.VOCAL}
            value={vocal}
            onChange={setVocal}
            collapsible={false}
            searchable={false}
          />
        </Section>

        <Section id="m-chorus" title="코러스" hint="단일 선택">
          <ChipPicker
            list={D.CHORUS}
            value={chorus}
            onChange={setChorus}
            multi={false}
            searchable={false}
            collapsible={false}
          />
        </Section>

        <Section id="m-lyric" title="가사 언어" hint="단일 선택 · 보컬에 자동 반영됨">
          <ChipPicker
            list={D.LYRIC_LANG}
            value={lang}
            onChange={setLang}
            multi={false}
            searchable={false}
            collapsible={false}
          />
        </Section>

        <Section id="m-humming" title="허밍" hint="직접 입력 (예: 후렴 전 4마디 허밍, 도입부 휘파람)">
          <textarea
            value={humming}
            onChange={(e) => setHumming(e.target.value)}
            placeholder="예: 후렴 직전에 따뜻한 허밍 4마디 / 인트로에 휘파람 8마디"
            rows={3}
            className="big-text"
          />
        </Section>

        <Section id="m-extra" title="추가 옵션" hint="자유 입력 (구조, 효과, 분위기 메모 등)">
          <textarea
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            placeholder="예: 인트로 → 벌스 → 프리코러스 → 코러스 → 브릿지 / 빈티지 테이프 효과 / 후반부 페이드아웃"
            rows={4}
            className="big-text"
          />
        </Section>

        <Section id="m-final" title="최종 확정 / 수정" hint="수정하려면 위 섹션을 클릭해 다시 고르세요">
          <div className="final-row">
            <button className="btn-ghost" onClick={reset}>
              전체 초기화
            </button>
            <div className="final-summary">
              테마 {themePreset.length} · 장르 {genre.length} · 분위기 {mood.length} · 보컬 {vocal.length} · 코러스 {chorus[0] || "—"} · 가사 {lang[0] || "—"}
            </div>
          </div>
          <PromptOutput text={prompt} filename="odungi-music-prompt.txt" />
        </Section>
      </div>
    </div>
  );
}

Object.assign(window, { MusicTab });
