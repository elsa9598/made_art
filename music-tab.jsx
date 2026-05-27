const { useState: useStateM, useMemo: useMemoM } = React;

const HANDPAN_SCALES = [
  { id: "d-kurd", label: "D Kurd", en: "D Kurd scale" },
  { id: "celtic-minor", label: "Celtic Minor", en: "Celtic Minor scale" },
  { id: "amara", label: "Amara", en: "Amara scale" },
  { id: "hijaz", label: "Hijaz (조금 중동 느낌)", en: "Hijaz scale" },
  { id: "equinox", label: "Equinox", en: "Equinox scale" }
];

const MEDITATION_THEMES = [
  {
    id: "moonlight-healing",
    icon: "🌙",
    title: "Moonlight Healing",
    titleKo: "달빛 치유 앰비언트",
    desc: "달빛, 바다, 감성 치유, 몽환적인 밤 분위기",
    promptEn: "Moonlight Healing ambient music. A dreamy night atmosphere focusing on moonlight, the ocean, and emotional healing.",
    instruments: [
      { id: "sanjo-daegeum", label: "산조대금", en: "sanjo daegeum" },
      { id: "cello", label: "첼로", en: "cello" },
      { id: "piano", label: "피아노", en: "piano" },
      { id: "gayageum", label: "가야금", en: "gayageum" },
      { id: "sogeum", label: "소금", en: "sogeum (small bamboo flute)" },
      { id: "harp", label: "하프", en: "harp" },
      { id: "singing-bowl", label: "싱잉볼", en: "singing bowl" },
      { id: "female-humming", label: "부드러운 여성 허밍", en: "soft female humming" },
      { id: "ocean-drum", label: "오션드럼", en: "ocean drum" },
      { id: "wind-chime", label: "윈드차임", en: "wind chimes" }
    ],
    nature: [
      { id: "wave", label: "파도소리", en: "ocean waves" },
      { id: "night-wind", label: "밤바람", en: "night wind" },
      { id: "gentle-rain", label: "잔잔한 빗소리", en: "gentle rain" },
      { id: "seagull", label: "멀리 들리는 갈매기 소리", en: "distant seagulls" }
    ]
  },
  {
    id: "nature-meditation",
    icon: "🌲",
    title: "Nature Meditation",
    titleKo: "자연 명상 앰비언트",
    desc: "숲속 명상, 깊은 호흡, 평화로운 자연 분위기",
    promptEn: "Nature Meditation ambient music. Deep breathing and a peaceful forest atmosphere.",
    instruments: [
      { id: "daegeum", label: "대금", en: "daegeum" },
      { id: "native-flute", label: "네이티브 플루트", en: "native american flute" },
      { id: "kalimba", label: "칼림바", en: "kalimba" },
      { id: "singing-bowl", label: "싱잉볼", en: "singing bowl" },
      { id: "shaker", label: "쉐이커", en: "shaker" },
      { id: "tongue-drum", label: "텅드럼", en: "tongue drum" },
      { id: "rainstick", label: "레인스틱", en: "rainstick" },
      { id: "shruti-box", label: "슈루티 박스", en: "shruti box" },
      { id: "bamboo-perc", label: "대나무 퍼커션", en: "bamboo percussion" }
    ],
    nature: [
      { id: "rain", label: "빗소리", en: "rain sounds" },
      { id: "forest-birds", label: "숲속 새소리", en: "forest birds" },
      { id: "stream", label: "계곡물 소리", en: "stream sounds" },
      { id: "wind", label: "바람소리", en: "wind sounds" },
      { id: "campfire", label: "장작 타는 소리", en: "campfire crackling" }
    ]
  },
  {
    id: "ethnic-healing",
    icon: "🏮",
    title: "Ethnic Healing",
    titleKo: "국악·에스닉 힐링 앰비언트",
    desc: "한국적 감성, 영적인 울림, 전통과 현대의 융합",
    promptEn: "Ethnic Healing ambient music. A fusion of Korean traditional emotions, spiritual resonance, and modern ambient elements.",
    instruments: [
      { id: "sanjo-daegeum", label: "산조대금", en: "sanjo daegeum" },
      { id: "gayageum", label: "가야금", en: "gayageum" },
      { id: "haegeum", label: "해금", en: "haegeum" },
      { id: "janggu", label: "장구", en: "janggu" },
      { id: "small-drum", label: "작은북", en: "small drum" },
      { id: "soft-kkwaenggwari", label: "약한 꽹과리", en: "soft kkwaenggwari" },
      { id: "frame-drum", label: "프레임드럼", en: "frame drum" },
      { id: "udu-drum", label: "우두드럼", en: "udu drum" },
      { id: "rav-drum", label: "RAV 드럼", en: "RAV drum" },
      { id: "low-drone-pad", label: "낮은 드론 패드", en: "low drone pad" }
    ],
    nature: [
      { id: "mountain-wind", label: "산바람", en: "mountain wind" },
      { id: "temple", label: "사찰 분위기", en: "buddhist temple atmosphere" },
      { id: "night-bugs", label: "밤 벌레 소리", en: "night insects" },
      { id: "flowing-water", label: "흐르는 물소리", en: "flowing water" }
    ]
  },
  {
    id: "deep-focus",
    icon: "📖",
    title: "Deep Focus Ambient",
    titleKo: "집중·창작 몰입 앰비언트",
    desc: "집중, 드로잉, 독서, 창작 몰입",
    promptEn: "Deep Focus Ambient music. Designed for deep concentration, drawing, reading, and creative flow.",
    instruments: [
      { id: "soft-piano", label: "소프트 피아노", en: "soft piano" },
      { id: "epiano", label: "일렉트릭 피아노", en: "electric piano" },
      { id: "lofi-pad", label: "로파이 패드", en: "lo-fi pad" },
      { id: "sub-bass", label: "서브 베이스 드론", en: "sub-bass drone" },
      { id: "kalimba", label: "칼림바", en: "kalimba" },
      { id: "minimal-perc", label: "미니멀 퍼커션", en: "minimal percussion" },
      { id: "ambient-guitar", label: "앰비언트 기타", en: "ambient guitar" },
      { id: "synth-pad", label: "신스 패드", en: "synth pad" },
      { id: "soft-cello", label: "부드러운 첼로", en: "soft cello" },
      { id: "tape-noise", label: "테이프 질감 노이즈", en: "tape texture noise" }
    ],
    nature: [
      { id: "vinyl-noise", label: "부드러운 바이닐 노이즈", en: "soft vinyl noise" },
      { id: "air-texture", label: "공기 질감", en: "airy texture" },
      { id: "soft-echo", label: "약한 에코", en: "soft echo" }
    ]
  },
  {
    id: "dreamscape",
    icon: "🌌",
    title: "Dreamscape Cinematic",
    titleKo: "꿈·판타지 시네마틱 앰비언트",
    desc: "판타지 세계, 별빛, 감성 서사, 영화적 여행",
    promptEn: "Dreamscape Cinematic Ambient music. An emotional and cinematic journey through a fantasy world filled with starlight.",
    instruments: [
      { id: "sanjo-daegeum", label: "산조대금", en: "sanjo daegeum" },
      { id: "cello", label: "첼로", en: "cello" },
      { id: "string-ensemble", label: "스트링 앙상블", en: "string ensemble" },
      { id: "female-humming", label: "여성 허밍", en: "female humming" },
      { id: "chorus-pad", label: "코러스 패드", en: "chorus pad" },
      { id: "frame-drum", label: "프레임드럼", en: "frame drum" },
      { id: "taiko", label: "타이코 드럼", en: "taiko drum" },
      { id: "ethereal-synth", label: "에테리얼 신스", en: "ethereal synth" },
      { id: "bell-texture", label: "벨 텍스처", en: "bell texture" },
      { id: "glass-harmonica", label: "글래스 하모니카", en: "glass harmonica" },
      { id: "ambient-fx", label: "앰비언트 FX", en: "ambient FX" }
    ],
    nature: [
      { id: "space-wind", label: "우주 바람 소리", en: "space wind sounds" },
      { id: "deep-reverb", label: "깊은 공간 잔향", en: "deep spatial reverb" },
      { id: "ancient-ruins", label: "고대 유적 분위기", en: "ancient ruins atmosphere" },
      { id: "distant-thunder", label: "멀리 들리는 천둥소리", en: "distant thunder" }
    ]
  }
];

function MusicTab() {
  const [activeTheme, setActiveTheme] = useStateM(null);
  const [selectedInst, setSelectedInst] = useStateM([]);
  const [selectedNature, setSelectedNature] = useStateM([]);
  const [natureInput, setNatureInput] = useStateM("");
  const [tempoInput, setTempoInput] = useStateM("");
  const [selectedTempo, setSelectedTempo] = useStateM("");
  const [selectedScale, setSelectedScale] = useStateM("");
  const [handpanCount, setHandpanCount] = useStateM("1");
  const [handpanRoles, setHandpanRoles] = useStateM([]);

  const toggleHandpanRole = (role) => {
    setHandpanRoles(prev => prev.includes(role) ? prev.filter(x => x !== role) : [...prev, role]);
  };

  const toggleInst = (enLabel) => {
    setSelectedInst(prev => prev.includes(enLabel) ? prev.filter(x => x !== enLabel) : [...prev, enLabel]);
  };

  const toggleNature = (enLabel) => {
    setSelectedNature(prev => prev.includes(enLabel) ? prev.filter(x => x !== enLabel) : [...prev, enLabel]);
  };

  const selectTheme = (id) => {
    setActiveTheme(id);
    setSelectedInst([]);
    setSelectedNature([]);
    setNatureInput("");
    setTempoInput("");
    setSelectedTempo("");
    setSelectedScale("");
    setHandpanCount("1");
    setHandpanRoles([]);
  };

  const prompt = useMemoM(() => {
    if (!activeTheme) return "테마를 선택해주세요.";
    
    const theme = MEDITATION_THEMES.find(t => t.id === activeTheme);
    const lines = [];
    lines.push("=== ODUNGI HARU — MUSIC PROMPT ===");
    lines.push("");
    lines.push(`[THEME] ${theme.title} (${theme.titleKo})`);
    lines.push(`Description: ${theme.promptEn}`);
    lines.push("");
    
    lines.push("[MAIN INSTRUMENT]");
    let mainInstStr = "";
    if (handpanCount === "1") {
      mainInstStr = "• 1 Handpan (Focusing on Melody + Rhythm + Resonance)";
    } else {
      mainInstStr = `• Handpan Ensemble (${handpanCount} players)`;
    }

    if (selectedScale) {
      mainInstStr += ` - Scale: ${selectedScale}`;
    }
    lines.push(mainInstStr);

    if (handpanCount !== "1" && handpanRoles.length > 0) {
      const roleStrings = [];
      if (handpanRoles.includes("pulse")) roleStrings.push("low-end rhythm and steady pulse");
      if (handpanRoles.includes("melody")) roleStrings.push("main melody");
      if (handpanRoles.includes("fill")) roleStrings.push("fast touches filling the reverb and spatial field");

      const roleDescs = roleStrings.map((r, idx) => {
        if (idx === 0) return `One player focuses on ${r}.`;
        if (idx === 1) return `Another player focuses on ${r}.`;
        return `A third player focuses on ${r}.`;
      });
      lines.push(`  - Ensemble Roles: ${roleDescs.join(" ")}`);
    }
    
    if (selectedInst.length > 0) {
      lines.push("");
      lines.push("[RECOMMENDED INSTRUMENTS]");
      lines.push(`• ${selectedInst.join(", ")}`);
    }
    
    if (selectedNature.length > 0) {
      lines.push("");
      lines.push("[NATURE / AMBIENT ELEMENTS]");
      lines.push(`• ${selectedNature.join(", ")}`);
    }

    if (selectedTempo) {
      lines.push("");
      lines.push("[TEMPO]");
      lines.push(`• ${selectedTempo}`);
    }

    lines.push("");
    lines.push("[LENGTH & STRUCTURE]");
    lines.push("Target total duration is approximately 3 minutes. Structure the arrangement to fit naturally within this length, without abrupt cuts.");
    
    lines.push("");
    lines.push("[VOCALS & LYRICS]");
    lines.push("Semi-instrumental. This is a song without lyrics.");

    lines.push("");
    lines.push("[HARMONY — STRICT]");
    lines.push("ABSOLUTELY NO dissonant or clashing tone combinations. Every voicing must stay consonant, blend smoothly, and resolve cleanly. Prioritize emotional clarity and a deeply calming atmosphere.");

    return lines.join("\n");
  }, [activeTheme, selectedInst, selectedNature, selectedTempo, selectedScale, handpanCount, handpanRoles]);

  const reset = () => {
    if (!confirm("모든 선택을 초기화할까요?")) return;
    setActiveTheme(null);
    setSelectedInst([]);
    setSelectedNature([]);
    setNatureInput("");
    setTempoInput("");
    setSelectedTempo("");
    setSelectedScale("");
    setHandpanCount("1");
    setHandpanRoles([]);
  };

  const navItems = [
    { id: "m-theme", title: "명상 & 치유 테마", count: activeTheme ? 1 : null },
    { id: "m-final", title: "최종 확정", count: null },
  ];

  const [active, setActive] = useStateM("m-theme");
  const jump = (id) => {
    setActive(id);
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <div className="layout">
      <Sidebar items={navItems} active={active} onJump={jump} />
      <div className="content">
        <div className="tab-header">
          <div className="tab-header-row">
            <h1>🎵 명상 & 치유 음악 생성</h1>
            <button className="btn-reset-top" onClick={reset} title="모든 선택을 초기화합니다">🔄 초기화</button>
          </div>
          <p>
            큰 테마를 먼저 선택한 후, 가지처럼 이어지는 악기와 자연음을 복수 선택하여 나만의 명상 음악 프롬프트를 완성하세요.
          </p>
        </div>

        <Section id="m-theme" title="1. 테마 선택" hint="원하시는 명상/치유 분위기를 하나 선택하세요.">
          <div className="theme-subs" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0' }}>
            {MEDITATION_THEMES.map((theme) => {
              const isOn = activeTheme === theme.id;
              return (
                <div key={theme.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button
                    type="button"
                    className={"theme-sub-card" + (isOn ? " on" : "")}
                    onClick={() => selectTheme(theme.id)}
                    style={{ width: '100%', textAlign: 'left' }}
                  >
                    <div className="theme-sub-top">
                      <span className="theme-sub-label" style={{ fontSize: '16px' }}>
                        {theme.icon} {theme.title} <span style={{fontSize: '13px', color: 'var(--ink-3)', marginLeft: '6px', fontWeight: 'normal'}}>{theme.titleKo}</span>
                      </span>
                      {isOn && <span className="theme-sub-check">✓</span>}
                    </div>
                    <div className="theme-sub-desc">{theme.desc}</div>
                  </button>
                  
                  {isOn && (
                    <div className="theme-sounds-box" style={{ padding: '16px', background: 'var(--surface-2)', border: '1px solid var(--accent)', borderRadius: '12px', marginLeft: '24px' }}>
                      <div style={{ fontSize: '13.5px', fontWeight: '700', marginBottom: '8px', color: 'var(--ink-2)' }}>✨ 메인 악기 (핸드팬 구성)</div>
                      <div className="chip-row" style={{ marginBottom: '12px' }}>
                        {["1", "2", "3"].map(num => (
                          <button
                            key={num}
                            type="button"
                            className={`chip ${handpanCount === num ? "on" : ""}`}
                            onClick={() => setHandpanCount(num)}
                          >
                            {num === "1" ? "1대 (솔로)" : `${num}대 (합주)`}
                          </button>
                        ))}
                      </div>
                      
                      {handpanCount !== "1" && (
                        <div style={{ marginBottom: '16px' }}>
                          <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--ink-3)' }}>▶ 핸드팬 연주 역할 (복수 선택)</div>
                          <div className="chip-row">
                            <button type="button" className={`chip ${handpanRoles.includes("pulse") ? "on" : ""}`} onClick={() => toggleHandpanRole("pulse")}>저음 리듬 / Pulse</button>
                            <button type="button" className={`chip ${handpanRoles.includes("melody") ? "on" : ""}`} onClick={() => toggleHandpanRole("melody")}>메인 멜로디</button>
                            <button type="button" className={`chip ${handpanRoles.includes("fill") ? "on" : ""}`} onClick={() => toggleHandpanRole("fill")}>잔향·공간 채우기 (빠른 터치)</button>
                          </div>
                        </div>
                      )}

                      <div style={{ fontSize: '13.5px', fontWeight: '700', marginBottom: '8px', marginTop: '16px', color: 'var(--ink-2)' }}>🪘 핸드팬 스케일 (선택)</div>
                      <div className="chip-row" style={{ marginBottom: '16px' }}>
                        {HANDPAN_SCALES.map(scale => {
                          const isSelected = selectedScale === scale.en;
                          return (
                            <button
                              key={scale.id}
                              type="button"
                              className={`chip ${isSelected ? "on" : ""}`}
                              onClick={() => setSelectedScale(isSelected ? "" : scale.en)}
                            >
                              {scale.label}
                            </button>
                          );
                        })}
                      </div>
                      
                      <div style={{ fontSize: '13.5px', fontWeight: '700', marginBottom: '8px', color: 'var(--ink-2)' }}>🎻 추천 악기 (복수 선택)</div>
                      <div className="chip-row" style={{ marginBottom: '16px' }}>
                        {theme.instruments.map(inst => {
                          const isSelected = selectedInst.includes(inst.en);
                          return (
                            <button
                              key={inst.id}
                              type="button"
                              className={`chip ${isSelected ? "on" : ""}`}
                              onClick={() => toggleInst(inst.en)}
                            >
                              {inst.label}
                            </button>
                          );
                        })}
                      </div>

                      <div style={{ fontSize: '13.5px', fontWeight: '700', marginBottom: '8px', color: 'var(--ink-2)' }}>🍃 자연음 / 앰비언트 요소 (복수 선택)</div>
                      <div className="chip-row">
                        {theme.nature.map(nat => {
                          const isSelected = selectedNature.includes(nat.en);
                          return (
                            <button
                              key={nat.id}
                              type="button"
                              className={`chip ${isSelected ? "on" : ""}`}
                              onClick={() => toggleNature(nat.en)}
                            >
                              {nat.label}
                            </button>
                          );
                        })}
                        {selectedNature
                          .filter(sn => !theme.nature.find(n => n.en === sn))
                          .map(customSn => (
                            <button
                              key={customSn}
                              type="button"
                              className="chip on"
                              onClick={() => toggleNature(customSn)}
                            >
                              {customSn} ✕
                            </button>
                          ))
                        }
                      </div>
                      
                      <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                        <input 
                          type="text" 
                          className="input" 
                          placeholder="직접 입력 (예: birds singing)" 
                          value={natureInput}
                          onChange={(e) => setNatureInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && natureInput.trim()) {
                              const val = natureInput.trim();
                              if (!selectedNature.includes(val)) {
                                setSelectedNature(prev => [...prev, val]);
                              }
                              setNatureInput("");
                            }
                          }}
                          style={{ flex: 1, padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--bg)", color: "var(--ink-1)" }}
                        />
                        <button 
                          type="button" 
                          className="btn-primary" 
                          onClick={() => {
                            if (natureInput.trim()) {
                              const val = natureInput.trim();
                              if (!selectedNature.includes(val)) {
                                setSelectedNature(prev => [...prev, val]);
                              }
                              setNatureInput("");
                            }
                          }}
                          style={{ padding: "0 16px", borderRadius: "6px", fontWeight: "bold" }}
                        >
                          추가
                        </button>
                      </div>

                      <div style={{ fontSize: '13.5px', fontWeight: '700', marginBottom: '8px', marginTop: '24px', color: 'var(--ink-2)' }}>⏱ 템포 (BPM 또는 설명)</div>
                      <div className="chip-row" style={{ marginBottom: "8px" }}>
                        {selectedTempo && (
                          <button
                            type="button"
                            className="chip on"
                            onClick={() => setSelectedTempo("")}
                          >
                            {selectedTempo} ✕
                          </button>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input 
                          type="text" 
                          className="input" 
                          placeholder="템포 입력 (예: 70 BPM, slow)" 
                          value={tempoInput}
                          onChange={(e) => setTempoInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && tempoInput.trim()) {
                              setSelectedTempo(tempoInput.trim());
                              setTempoInput("");
                            }
                          }}
                          style={{ flex: 1, padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--bg)", color: "var(--ink-1)" }}
                        />
                        <button 
                          type="button" 
                          className="btn-primary" 
                          onClick={() => {
                            if (tempoInput.trim()) {
                              setSelectedTempo(tempoInput.trim());
                              setTempoInput("");
                            }
                          }}
                          style={{ padding: "0 16px", borderRadius: "6px", fontWeight: "bold" }}
                        >
                          추가
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Section>

        <Section id="m-final" title="2. 최종 확정 / 영어 프롬프트 복사" hint="선택하신 항목들이 아래의 프롬프트에 자동으로 반영됩니다.">
          <PromptOutput text={prompt} filename="meditation-music-prompt.txt" />
        </Section>
      </div>
    </div>
  );
}

Object.assign(window, { MusicTab });
