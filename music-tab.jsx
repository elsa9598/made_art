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

function MusicTab() {
  const [subject, setSubject] = useStateM("");
  const [themePreset, setThemePreset] = useStateM([]); // 선택된 서브 프리셋 id 배열

  const [genre, setGenre] = useStateM([]);
  const [genreCustom, setGenreCustom] = useStateM([]);

  const [vocal, setVocal] = useStateM([]);
  const [chorus, setChorus] = useStateM(["코러스 없음"]);
  const [lang, setLang] = useStateM(["한글 가사"]);

  const [natureSounds, setNatureSounds] = useStateM([]);

  const [imageHint, setImageHint] = useStateM(""); // 첨부 이미지의 분위기 묘사 (사용자 입력)
  const [autoDetails, setAutoDetails] = useStateM(""); // 악기, 템포, 키 AI 자동 추천 결과
  
  const [isGeneratingGenre, setIsGeneratingGenre] = useStateM(false);
  const [isGeneratingDetails, setIsGeneratingDetails] = useStateM(false);

  const generateDetails = async () => {
    setIsGeneratingDetails(true);
    try {
      const promptText = `당신은 전문 음악 프로듀서입니다. 
사용자가 선택한 다음 정보를 바탕으로, 이 곡에 가장 잘 어울리는 [악기 구성(Instruments)], [템포(BPM)], [키(Key, Major/Minor)]를 추천해주세요.

[주제]: ${subject.trim() || "입력 안됨"}
[선택된 장르]: ${genre.join(", ") || "입력 안됨"}

다음과 같은 영어 형식으로만 출력하세요. 부가적인 설명은 절대 적지 마세요.
형식 예시:
Instruments: Acoustic Guitar, Soft Piano, Light Percussion
Tempo: 85 BPM
Key: C Major`;

      const res = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "qwen2.5:14b",
          prompt: promptText,
          stream: false,
          options: {
            temperature: 0.7
          }
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAutoDetails(data.response.trim());
      } else {
        setAutoDetails("⚠️ 오류: " + res.status);
      }
    } catch (err) {
      console.error("Details generation failed:", err);
      setAutoDetails("⚠️ 연결 실패: Ollama 서버가 켜져 있는지 확인하세요.");
    } finally {
      setIsGeneratingDetails(false);
    }
  };

  const togglePreset = (subId) => {
    setThemePreset((prev) =>
      prev.includes(subId) ? prev.filter((x) => x !== subId) : [...prev, subId]
    );
  };

  const fetchGenres = async (setDraft) => {
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

      let promptText = `당신은 창의적이고 감각적인 음악 장르 전문가입니다.
제시된 주제와 테마 분위기를 완벽하게 표현할 수 있는 음악 장르를 3가지 추천해주세요.

아래 제공된 정보를 바탕으로 가장 잘 어울리는 음악 장르 딱 3개를 신중하게 골라주세요.
선택 기준의 우선순위는 다음과 같습니다:
1순위 (가장 중요): [주제] - 곡의 핵심 내용과 방향성입니다. 주제의 메시지와 가장 잘 맞는 장르를 우선적으로 고려하세요.
2순위: [선택된 테마 분위기] 및 [참고 정보] - 주제를 뒷받침하는 감성적, 시각적 참고 자료입니다.

`;
      
      if (subject.trim()) {
        promptText += `[주제 (1순위)]\n${subject.trim()}\n\n`;
      } else {
        promptText += `[주제 (1순위)]\n(입력된 주제가 없습니다. 2순위 정보를 바탕으로 선택하세요.)\n\n`;
      }
      
      let refInfo = "";
      if (selectedThemes.length > 0) {
        refInfo += `- 선택된 테마 분위기: ${selectedThemes.map((t) => t.desc).join(" / ")}\n`;
      }
      if (imageHint.trim()) {
        refInfo += `- 분위기 추가 설명: ${imageHint.trim()}\n`;
      }
      
      if (refInfo) {
        promptText += `[참고 정보 (2순위)]\n${refInfo}\n`;
      }
      
      promptText += `반드시 추천하는 장르명 3개만 골라 JSON 배열 형태로 출력하세요. 다른 말은 절대 하지 마세요.\n예시: ["신스웨이브", "인디 포크", "피아노 솔로"]`;

      const res = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "qwen2.5:14b",
          prompt: promptText,
          stream: false,
          options: {
            temperature: 0.8,
            top_p: 0.9
          }
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const responseStr = data.response.trim();
        let parsed = null;
        
        try {
          parsed = JSON.parse(responseStr);
        } catch (e) {
          // 정규식으로 대괄호 영역 추출 (멀티라인 대응)
          const match = responseStr.match(/\[[\s\S]*?\]/);
          if (match) {
            try {
              parsed = JSON.parse(match[0]);
            } catch (err) {}
          }
        }
        
        let arr = null;
        if (Array.isArray(parsed)) {
          arr = parsed;
        } else if (parsed && typeof parsed === 'object') {
          for (const key in parsed) {
            if (Array.isArray(parsed[key])) {
              arr = parsed[key];
              break;
            }
          }
        }

        if (arr && arr.length > 0) {
          // AI가 가끔 목록에 없는 변형된 단어를 뱉을 수도 있으므로 엄격한 필터링 해제
          setDraft(arr.slice(0, 3).join(", "));
        } else {
          // 배열 파싱에 실패한 경우 쌩 텍스트라도 보여줌
          const cleanText = responseStr.replace(/```json|```/g, '').replace(/\n/g, ' ').trim();
          setDraft(cleanText.slice(0, 80));
        }
      } else {
        setDraft("⚠️ 오류: " + res.status);
      }
    } catch (err) {
      console.error("Genre recommendation failed:", err);
      setDraft("⚠️ 연결 실패: Ollama 서버가 켜져 있는지 확인하세요.");
    } finally {
      setIsGeneratingGenre(false);
    }
  };

  const navItems = [
    { id: "m-subject", title: "주제 및 분위기", count: subject.trim() ? 1 : null },
    { id: "m-theme", title: "테마 프리셋", count: themePreset.length || null },
    { id: "m-genre", title: "장르", count: genre.length || null },
    { id: "m-vocal", title: "보컬", count: vocal.length || null },
    { id: "m-chorus", title: "코러스", count: null },
    { id: "m-lyric", title: "가사 언어", count: null },
    { id: "m-nature", title: "자연의 소리", count: natureSounds.length || null },
    { id: "m-final", title: "최종 확정", count: null },
  ];

  const [active, setActive] = useStateM("m-subject");
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

    if (autoDetails.trim()) {
      lines.push("");
      lines.push("[INSTRUMENTS / TEMPO / KEY]");
      lines.push(autoDetails.trim());
    } else {
      lines.push(
        "From the subject and thematic direction above, automatically derive: the instrument set, the tempo (BPM), and the musical key (major / minor). Pick instruments and harmony that emotionally match the subject."
      );
    }

    if (imageHint.trim()) {
      lines.push(`Additional reference notes: ${imageHint.trim()}`);
    }
    lines.push("");

    if (genre.length) {
      const en = uniq(genre);
      lines.push("[GENRE] " + en.join(", "));
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

    if (natureSounds.length) {
      const en = uniq(natureSounds.map((k) => labelToEn(D.NATURE_SOUNDS, k)));
      lines.push("[NATURE / AMBIENT SOUNDS] " + en.join(", "));
    }

    lines.push("");
    lines.push(
      "[LENGTH] Target total duration is approximately 3 minutes (around 2:50–3:10). Structure the arrangement — intro, verses, chorus/hook, bridge, and outro — to fit naturally within this length, without abrupt cuts or unfinished phrases."
    );
    lines.push(
      "[HARMONY — STRICT] ABSOLUTELY NO dissonant or clashing tone combinations. Do NOT use atonal clusters, harsh microtonal beating, accidentals that fight the established key, or simultaneous notes that produce unpleasant minor-2nd / tritone collisions on strong beats. Every voicing — lead vocal, backing chorus, and all instruments — must stay consonant within the chosen key, blend smoothly, and resolve cleanly. Prioritize emotional clarity and a pleasant, well-tuned sound over experimental dissonance."
    );
    lines.push("");
    
    if (autoDetails.trim()) {
      lines.push(
        "[FINAL INSTRUCTIONS] Output a ~3-minute song that matches all directives above, strictly following the defined instruments, tempo, and key."
      );
    } else {
      lines.push(
        "[AUTO-DETECT FROM SUBJECT] Choose the instrument set, tempo (BPM), and key (major / minor) that best fit the mood of the subject above. Output a ~3-minute song that matches all directives above."
      );
    }

    return lines.join("\n");
  }, [genre, vocal, chorus, lang, natureSounds, imageHint, autoDetails, subject, themePreset]);

  const reset = () => {
    if (!confirm("선택한 항목을 모두 초기화할까요?")) return;
    setSubject("");
    setThemePreset([]);
    setGenre([]);
    setGenreCustom([]);
    setVocal([]);
    setChorus(["코러스 없음"]);
    setLang(["한글 가사"]);
    setNatureSounds([]);
    setImageHint("");
    setAutoDetails("");
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
          id="m-subject"
          title="주제 및 분위기 설명"
          hint="곡의 핵심 주제와 전반적인 분위기를 적어주세요. AI가 장르와 악기를 추천할 때 활용합니다."
        >
          <div className="subject-row">
            <label className="subject-label" htmlFor="subject-input">🎯 주제 (한 줄)</label>
            <input
              id="subject-input"
              type="text"
              className="subject-input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
              placeholder="예: 비 오는 날 창가의 강아지 / 첫 눈 내린 아침 산책 / 늦은 밤 우리집 식탁"
            />
          </div>
          <div className="subject-row" style={{ marginTop: '16px' }}>
            <label className="subject-label" htmlFor="image-hint-input">✨ 분위기 추가 설명</label>
            <textarea
              id="image-hint-input"
              className="subject-input"
              value={imageHint}
              onChange={(e) => setImageHint(e.target.value)}
              placeholder="곡의 분위기, 느낌, 배경 등을 자유롭게 묘사해주세요. (예: 따뜻한 가을 햇살, 잔잔한 호수)"
              rows={2}
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

        <Section id="m-genre" title="장르" hint={`AI 추천 및 직접 입력 · 복수 가능`} badge={genre.length}>
          <ChipPicker
            list={[]}
            searchable={false}
            value={genre}
            onChange={setGenre}
            customs={genreCustom}
            onAddCustom={(v) => setGenreCustom(uniq([...genreCustom, v]))}
            aiButton={(setDraft) => (
              <button
                type="button"
                className="btn-primary"
                onClick={() => fetchGenres(setDraft)}
                disabled={isGeneratingGenre}
                style={{ marginRight: '8px', padding: '0 12px', fontSize: '13px', borderRadius: '6px' }}
              >
                {isGeneratingGenre ? "⏳ 고민 중..." : "✨ AI 장르 추천"}
              </button>
            )}
          />
        </Section>

        <Section
          id="m-auto"
          title="악기 · 템포 · 키 추천 (AI)"
          hint="주제와 장르를 바탕으로 AI가 어울리는 구성을 추천합니다. 자유롭게 수정하세요."
        >
          <div className="auto-card">
            <div className="auto-row" style={{ justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className="pill">🎼 악기</span>
                <span className="pill">⏱ 템포 (BPM)</span>
                <span className="pill">🎹 키 (Major/Minor)</span>
              </div>
              <button
                type="button"
                className="btn-primary"
                onClick={generateDetails}
                disabled={isGeneratingDetails}
                style={{ padding: '4px 10px', fontSize: '12.5px', borderRadius: '6px' }}
              >
                {isGeneratingDetails ? "⏳ 고민 중..." : "✨ AI 추천받기"}
              </button>
            </div>
            <textarea
              placeholder="추천받기를 누르면 악기, 템포, 키 구성이 이곳에 생성됩니다. 직접 작성하셔도 좋습니다."
              value={autoDetails}
              onChange={(e) => setAutoDetails(e.target.value)}
              rows={4}
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

        <Section id="m-nature" title="자연의 소리" hint="복수 선택 가능" badge={natureSounds.length}>
          <ChipPicker
            list={D.NATURE_SOUNDS}
            value={natureSounds}
            onChange={setNatureSounds}
            collapsible={false}
          />
        </Section>

        <Section id="m-final" title="최종 확정 / 수정" hint="수정하려면 위 섹션을 클릭해 다시 고르세요">
          <div className="final-row">
            <button className="btn-ghost" onClick={reset}>
              전체 초기화
            </button>
            <div className="final-summary">
              테마 {themePreset.length} · 장르 {genre.length} · 보컬 {vocal.length} · 코러스 {chorus[0] || "—"} · 가사 {lang[0] || "—"}
            </div>
          </div>
          <PromptOutput text={prompt} filename="odungi-music-prompt.txt" />
        </Section>
      </div>
    </div>
  );
}

Object.assign(window, { MusicTab });
