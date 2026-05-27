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
    id: "meditation",
    icon: "🧘",
    title: "명상과 치유",
    titleEn: "Meditation & Healing",
    desc: "악기 본연의 진동과 울림으로 내면의 평온과 회복을 돕는 음악들입니다.",
    subs: [
      {
        id: "meditation-healing",
        label: "치유의 울림",
        desc: "핸드팬, 대금, 가야금의 맑고 깊은 선율과 큰북, 작은북, 꽹과리 등 타악기의 리듬이 어우러져 몸과 마음의 긴장을 풀어주고 균형을 되찾아 줍니다.",
        promptEn: "Meditative healing music featuring the pure, resonant tones of a handpan as the central melodic voice, intertwined with the deep breathy timbre of a Daegeum (Korean bamboo flute) and the gentle plucked arpeggios of a Gayageum (Korean zither). Grounded by the warm pulse of a buk (large Korean drum), delicate accents from a sogo (small drum), and bright metallic shimmer of a kkwaenggwari (small gong). Slow, breathing tempo, wide reverb spaces, pentatonic scales, deeply calming and restorative atmosphere that releases tension and restores inner balance."
      },
      {
        id: "meditation-music",
        label: "명상 음악",
        desc: "깊은 호흡과 내면의 집중에 도움을 주는 고요한 명상 음악입니다.",
        promptEn: "Deeply calming meditation music, slow breathing tempo, atmospheric pads, pure sine waves, zen-like focus, tranquil and serene."
      },
      {
        id: "healing-music",
        label: "치유 음악",
        desc: "지친 마음을 달래고 정서적 회복을 돕는 따뜻한 치유 음악입니다.",
        promptEn: "Restorative healing music, warm resonant frequencies, soothing acoustic instruments, gentle flow, emotional release, comforting atmosphere."
      },
      {
        id: "ambient",
        label: "앰비언트",
        desc: "공간감을 넓게 채우며 배경으로 자연스럽게 스며드는 앰비언트 음악입니다.",
        promptEn: "Atmospheric ambient music, wide spatial reverb, drifting synth textures, beatless, infinite soundscape, ethereal and expansive."
      },
      {
        id: "world-music",
        label: "월드뮤직",
        desc: "세계 각국의 전통 악기와 리듬이 조화롭게 어우러지는 월드뮤직입니다.",
        promptEn: "Rich world music, traditional ethnic instruments from various cultures, organic rhythms, cross-cultural harmony, earthy and grounded."
      },
      {
        id: "new-age",
        label: "뉴에이지",
        desc: "맑고 투명한 어쿠스틱 악기와 부드러운 신스가 결합된 뉴에이지 음악입니다.",
        promptEn: "Uplifting New Age music, bright acoustic piano, ethereal synthesizers, optimistic and peaceful melodies, crystal clear sound."
      },
      {
        id: "ethnic-fusion",
        label: "에스닉 퓨전",
        desc: "전통 민속 악기와 현대적인 비트가 만난 독특한 에스닉 퓨전 음악입니다.",
        promptEn: "Dynamic ethnic fusion, blending traditional folk instruments with modern electronic or acoustic beats, exotic scales, rhythmic groove, culturally rich."
      },
      {
        id: "neo-classical",
        label: "네오 클래식",
        desc: "미니멀하면서도 감성적인 현악기와 피아노 중심의 네오 클래식 음악입니다.",
        promptEn: "Intimate Neo-classical music, emotive solo string instruments, delicate felt piano, minimalist and expressive phrasing, deeply moving."
      },
      {
        id: "lofi-ambient",
        label: "로파이 앰비언트",
        desc: "따뜻한 질감과 빈티지한 노이즈가 어우러진 로파이 앰비언트 음악입니다.",
        promptEn: "Warm lo-fi ambient, vinyl crackle, tape saturation, muffled electric piano, nostalgic and cozy atmosphere, relaxed tempo."
      },
      {
        id: "cinematic",
        label: "시네마틱 음악",
        desc: "한편의 영화처럼 서사와 드라마틱한 감정선이 살아있는 시네마틱 음악입니다.",
        promptEn: "Evocative cinematic music, lush orchestral arrangements, dramatic emotional arc, sweeping strings, storytelling focus, grand scale."
      },
      {
        id: "nature-asmr",
        label: "자연음 기반 ASMR",
        desc: "물소리, 새소리, 바람소리 등 자연의 백색소음이 주가 되는 음악입니다.",
        promptEn: "Immersive ASMR music driven by pristine nature recordings, gentle acoustic layers blending smoothly with water, wind, and forest sounds, ultra-relaxing."
      },
      {
        id: "improv",
        label: "즉흥 연주",
        desc: "형식에 얽매이지 않고 자유롭게 감정을 표현하는 즉흥 연주 음악입니다.",
        promptEn: "Free-flowing improvisational music, spontaneous instrumental interactions, expressive solos, organic and unscripted energy, raw emotion."
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

const THEME_SOUNDS = {
  "meditation-music": [
    { id: "snd-handpan", label: "핸드팬", en: "handpan" },
    { id: "snd-daegeum", label: "대금", en: "daegeum (Korean bamboo flute)" },
    { id: "snd-singingbowl", label: "싱잉볼", en: "singing bowl" },
    { id: "snd-lowdrone", label: "낮은 드론 사운드", en: "low drone sound" },
    { id: "snd-wind", label: "바람소리", en: "wind sound" }
  ],
  "healing-music": [
    { id: "snd-handpan", label: "핸드팬", en: "handpan" },
    { id: "snd-gayageum", label: "가야금", en: "gayageum (Korean zither)" },
    { id: "snd-cello", label: "첼로", en: "cello" },
    { id: "snd-piano", label: "피아노", en: "piano" },
    { id: "snd-water", label: "물소리", en: "water sound" },
    { id: "snd-purr", label: "고양이 골골송", en: "cat purring" }
  ],
  "ambient": [
    { id: "snd-longpad", label: "긴 패드", en: "long atmospheric pads" },
    { id: "snd-synth", label: "신스", en: "synthesizer" },
    { id: "snd-handpan-reverb", label: "핸드팬 잔향", en: "handpan with long reverb" },
    { id: "snd-wind", label: "바람", en: "wind" },
    { id: "snd-waterdrop", label: "물방울", en: "water drops" }
  ],
  "world-music": [
    { id: "snd-handpan", label: "핸드팬", en: "handpan" },
    { id: "snd-daegeum", label: "대금", en: "daegeum" },
    { id: "snd-gayageum", label: "가야금", en: "gayageum" },
    { id: "snd-janggu", label: "장구", en: "janggu (Korean hourglass drum)" },
    { id: "snd-woodflute", label: "우드 플루트", en: "wooden flute" },
    { id: "snd-framedrum", label: "프레임드럼", en: "frame drum" }
  ],
  "new-age": [
    { id: "snd-piano", label: "피아노", en: "piano" },
    { id: "snd-handpan", label: "핸드팬", en: "handpan" },
    { id: "snd-string", label: "스트링", en: "strings" },
    { id: "snd-harp", label: "하프", en: "harp" },
    { id: "snd-flute", label: "플루트", en: "flute" }
  ],
  "ethnic-fusion": [
    { id: "snd-handpan", label: "핸드팬", en: "handpan" },
    { id: "snd-sanjodaegeum", label: "산조대금", en: "sanjo daegeum" },
    { id: "snd-gayageum", label: "가야금", en: "gayageum" },
    { id: "snd-haegeum", label: "해금", en: "haegeum (Korean fiddle)" },
    { id: "snd-bigdrum", label: "큰북", en: "large drum" },
    { id: "snd-smalldrum", label: "작은북", en: "small drum" },
    { id: "snd-drone", label: "드론 사운드", en: "drone sound" }
  ],
  "neo-classical": [
    { id: "snd-piano", label: "피아노", en: "piano" },
    { id: "snd-cello", label: "첼로", en: "cello" },
    { id: "snd-violin", label: "바이올린", en: "violin" },
    { id: "snd-handpan", label: "핸드팬", en: "handpan" },
    { id: "snd-softstring", label: "잔잔한 스트링", en: "soft strings" }
  ],
  "lofi-ambient": [
    { id: "snd-handpan", label: "핸드팬", en: "handpan" },
    { id: "snd-lowsynth", label: "낮은 신스", en: "low synth" },
    { id: "snd-tapenoise", label: "테이프 노이즈", en: "tape noise" },
    { id: "snd-rain", label: "빗소리", en: "rain sounds" },
    { id: "snd-softbeat", label: "부드러운 비트", en: "soft lo-fi beat" }
  ],
  "cinematic": [
    { id: "snd-handpan", label: "핸드팬", en: "handpan" },
    { id: "snd-daegeum", label: "대금", en: "daegeum" },
    { id: "snd-string", label: "스트링", en: "orchestral strings" },
    { id: "snd-bigdrum", label: "큰북", en: "cinematic large drum" },
    { id: "snd-lowdrone", label: "낮은 드론", en: "low drone" },
    { id: "snd-choir", label: "합창 패드", en: "choir pad" }
  ],
  "nature-asmr": [
    { id: "snd-wave", label: "파도", en: "ocean waves" },
    { id: "snd-rain", label: "비", en: "rain" },
    { id: "snd-wind", label: "바람", en: "wind" },
    { id: "snd-purr", label: "고양이 골골송", en: "cat purring" },
    { id: "snd-leaves", label: "나뭇잎", en: "rustling leaves" },
    { id: "snd-handpan", label: "핸드팬", en: "handpan" }
  ],
  "improv": [
    { id: "snd-handpan-solo", label: "핸드팬 단독", en: "solo handpan" },
    { id: "snd-handpan-daegeum", label: "핸드팬+대금", en: "handpan and daegeum" },
    { id: "snd-handpan-percussion", label: "핸드팬+타악기", en: "handpan and percussion" },
    { id: "snd-handpan-humming", label: "핸드팬+허밍", en: "handpan and humming" }
  ]
};

function MusicTab() {
  const [subject, setSubject] = useStateM("");
  const [themePreset, setThemePreset] = useStateM([]); // 선택된 서브 프리셋 id 배열
  const [selectedSounds, setSelectedSounds] = useStateM([]);

  const toggleSound = (sndKey) => {
    setSelectedSounds((prev) =>
      prev.includes(sndKey) ? prev.filter((x) => x !== sndKey) : [...prev, sndKey]
    );
  };

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
            let line = `• ${cat.titleEn} — ${sub.label}: ${sub.promptEn}`;
            // 테마별 선택된 소리 확인
            const subSounds = selectedSounds
              .filter(s => s.startsWith(`${sub.id}::`))
              .map(s => s.split("::")[1]);
            
            if (subSounds.length > 0) {
              line += ` Specifically featuring: ${subSounds.join(", ")}.`;
            }
            lines.push(line);
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
  }, [genre, vocal, chorus, lang, natureSounds, imageHint, autoDetails, subject, themePreset, selectedSounds]);

  const reset = () => {
    if (!confirm("선택한 항목을 모두 초기화할까요?")) return;
    setSubject("");
    setThemePreset([]);
    setGenre([]);
    setGenreCustom([]);
    setVocal([]);
    setChorus([]);
    setLang([]);
    setNatureSounds([]);
    setImageHint("");
    setAutoDetails("");
    setSelectedSounds([]);
  };

  return (
    <div className="layout">
      <Sidebar items={navItems} active={active} onJump={jump} />
      <div className="content">
        <div className="tab-header">
          <div className="tab-header-row">
            <h1>🎵 음악 생성 프롬프트</h1>
            <button className="btn-reset-top" onClick={reset} title="모든 선택 및 입력을 초기화합니다">🔄 초기화</button>
          </div>
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
                {cat.id === "meditation" && themePreset.some(id => THEME_SOUNDS[id]) && (
                  <div className="theme-sounds-box" style={{ padding: '16px', background: 'var(--surface-2)', borderTop: '1px dashed var(--line)' }}>
                    <div style={{ fontSize: '13.5px', fontWeight: '700', marginBottom: '12px', color: 'var(--ink-2)' }}>✨ 잘 어울리는 소리 추가 (선택한 테마별)</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {themePreset.map(themeId => {
                        if (!THEME_SOUNDS[themeId]) return null;
                        const subTheme = cat.subs.find(s => s.id === themeId);
                        return (
                          <div key={themeId} style={{ background: 'var(--card)', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                            <div style={{ fontSize: '12px', color: 'var(--ink-3)', marginBottom: '8px', fontWeight: 'bold' }}>{subTheme.label}</div>
                            <div className="chip-row">
                              {THEME_SOUNDS[themeId].map(snd => {
                                const sndKey = `${themeId}::${snd.en}`;
                                const isOn = selectedSounds.includes(sndKey);
                                return (
                                  <button
                                    key={snd.id}
                                    type="button"
                                    className={`chip ${isOn ? "on" : ""}`}
                                    onClick={() => toggleSound(sndKey)}
                                    style={{ padding: '4px 10px', fontSize: '12px' }}
                                  >
                                    {snd.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
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
