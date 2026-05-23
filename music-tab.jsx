// 음악 생성 탭
const { useState: useStateM, useMemo: useMemoM } = React;

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

  const navItems = [
    { id: "m-image", title: "이미지 + 주제", count: (imageFile ? 1 : 0) + (subject.trim() ? 1 : 0) || null },
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
  }, [genre, mood, vocal, chorus, lang, humming, extra, imageHint, subject, imageFile]);

  const reset = () => {
    if (!confirm("선택한 항목을 모두 초기화할까요?")) return;
    setImageFile(null);
    setSubject("");
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

        <Section id="m-genre" title="장르" hint={`${D.GENRE.length}개 + 직접 입력 · 복수 가능`} badge={genre.length}>
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
              장르 {genre.length} · 분위기 {mood.length} · 보컬 {vocal.length} · 코러스 {chorus[0] || "—"} · 가사 {lang[0] || "—"}
            </div>
          </div>
          <PromptOutput text={prompt} filename="odungi-music-prompt.txt" />
        </Section>
      </div>
    </div>
  );
}

Object.assign(window, { MusicTab });
