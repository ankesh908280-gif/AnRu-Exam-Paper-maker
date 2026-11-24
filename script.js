/* ==========================================================================
   AnRu Exam Paper Maker — 100% Client-Side Native PWA Engine
   Zero-API | Offline SW | Installable PWA | Hindi + English Bulk Parser
   ========================================================================== */

(function () {
  'use strict';

  const STORAGE_KEY = 'anru_exam_paper_maker_v1';
  const LEGACY_STORAGE_KEY = 'smart_exam_paper_maker_v1';

  // Built-in clean vector emblem (Data URI) for instant paper header & watermark testing
  const SAMPLE_EMBLEM_SVG =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
        <circle cx="120" cy="120" r="110" fill="none" stroke="#1e293b" stroke-width="6"/>
        <circle cx="120" cy="120" r="96" fill="none" stroke="#1e293b" stroke-width="2" stroke-dasharray="6 4"/>
        <circle cx="120" cy="120" r="64" fill="none" stroke="#1e293b" stroke-width="3"/>
        <path d="M120 72 L134 106 L170 106 L140 127 L151 162 L120 140 L89 162 L100 127 L70 106 L106 106 Z" fill="none" stroke="#1e293b" stroke-width="4" stroke-linejoin="round"/>
        <text x="120" y="47" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="800" fill="#1e293b">ज्ञान • विज्ञान • प्रगति</text>
        <text x="120" y="204" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="800" fill="#1e293b">प्रतियोगिता परीक्षा</text>
      </svg>`
    );

  const DEFAULT_INSTRUCTIONS = [
    'सभी प्रश्न बहुविकल्पीय (MCQ) हैं। प्रत्येक प्रश्न के चार विकल्प (a, b, c, d) दिए गए हैं।',
    'सही उत्तर को OMR / उत्तर-पत्रक में केवल नीले या काले बॉल-पॉइंट पेन से पूरा गोला भरकर अंकित करें।',
    'उत्तर-पत्रक पर कटिंग, ओवरराइटिंग या व्हाइटनर का प्रयोग वर्जित है।',
    'परीक्षा कक्ष में मोबाइल फोन, कैलकुलेटर, स्मार्टवॉच या अन्य इलेक्ट्रॉनिक उपकरण वर्जित हैं।',
    'इस परीक्षा में कोई ऋणात्मक अंकन (Negative Marking) नहीं है।'
  ];

  const INITIAL_QUESTIONS = [
    { q: 'कौन सा तत्व हीरा और ग्रेफाइट दोनों में पाया जाता है?', a: 'सिलिकॉन', b: 'कार्बन', c: 'नाइट्रोजन', d: 'ऑक्सीजन', ans: 'b' },
    { q: 'बैटरी में कौन सी ऊर्जा संग्रहित रहती है?', a: 'रासायनिक ऊर्जा', b: 'विद्युत ऊर्जा', c: 'यांत्रिक ऊर्जा', d: 'गतिज ऊर्जा', ans: 'a' },
    { q: 'जल का घनत्व अधिकतम किस तापमान पर होता है? (डिग्री सेल्सियस में)', a: '0°C', b: '100°C', c: '4°C', d: '25°C', ans: 'c' },
    { q: 'जीवाश्म हमें किसकी जानकारी देता है?', a: 'पृथ्वी की आयु', b: 'प्राचीन जीवों की जानकारी', c: 'खनिज', d: 'मिट्टी की संरचना', ans: 'b' },
    { q: 'जल में घुलने पर नींबू का रस कैसा विलयन बनाता है?', a: 'अम्लीय', b: 'क्षारीय', c: 'तटस्थ', d: 'बेसिक', ans: 'a' },
    { q: 'मनुष्य के शरीर का सामान्य तापमान फारेनहाइट (°F) में कितना होता है?', a: '94.8°F', b: '96.8°F', c: '98.6°F', d: '100.4°F', ans: 'c' },
    { q: 'जब गाड़ी में अचानक ब्रेक लगता है, तो हमें आगे की ओर झटका क्यों लगता है?', a: 'जड़त्व के कारण', b: 'गति के कारण', c: 'ब्रेकर के कारण', d: 'इनमें से कोई नहीं', ans: 'a' },
    { q: 'भारत का सर्वोच्च न्यायालय (Supreme Court) कहाँ स्थित है?', a: 'नई दिल्ली', b: 'प्रयागराज', c: 'लखनऊ', d: 'मुंबई', ans: 'a' },
    { q: 'ग्राम पंचायत का कार्यकाल कितने वर्षों का होता है?', a: '3 वर्ष', b: '5 वर्ष', c: '6 वर्ष', d: '10 वर्ष', ans: 'b' },
    { q: 'हड़प्पा सभ्यता किस नदी के किनारे बसी थी?', a: 'गंगा', b: 'सिंधु', c: 'दजला-फरात', d: 'नील', ans: 'b' },
    { q: 'यदि 2x + 5 = 15 हो, तो x² का मान क्या होगा? (If 2x + 5 = 15, find x²)', a: '5', b: '10', c: '25', d: '50', ans: 'c' },
    { q: 'मिसाइल मैन ऑफ इंडिया (Missile Man of India) किसे कहा जाता है?', a: 'डॉ. ए.पी.जे. अब्दुल कलाम', b: 'अटल बिहारी वाजपेयी', c: 'आर्यभट्ट', d: 'विक्रम साराभाई', ans: 'a' }
  ];

  const EXTRA_DEMO_QUESTIONS = [
    { q: 'पृथ्वी पर सबसे बड़ा महासागर कौन सा है?', a: 'हिन्द महासागर', b: 'प्रशांत महासागर', c: 'अटलांटिक महासागर', d: 'आर्कटिक महासागर', ans: 'b' },
    { q: 'किसी भी भारतीय नागरिक को मतदान करने का अधिकार कितने वर्ष की आयु में मिलता है?', a: '16 वर्ष', b: '18 वर्ष', c: '21 वर्ष', d: '25 वर्ष', ans: 'b' },
    { q: 'कुंभ मेला उत्तर प्रदेश के किस शहर में लगता है?', a: 'प्रयागराज', b: 'लखनऊ', c: 'वाराणसी', d: 'कानपुर', ans: 'a' },
    { q: 'उत्तर प्रदेश में कुल कितने जिले हैं?', a: '70', b: '75', c: '79', d: '83', ans: 'b' },
    { q: 'वीर अब्दुल हामिद का जन्म उत्तर प्रदेश के किस जिले में हुआ था?', a: 'बलिया', b: 'मऊ', c: 'गाजीपुर', d: 'चंदौली', ans: 'c' },
    { q: 'हीमोग्लोबिन किन रक्त कोशिकाओं में पाया जाता है?', a: 'लाल रक्त (RBC)', b: 'श्वेत रक्त (WBC)', c: 'प्लेटलेट्स', d: 'इनमें से कोई नहीं', ans: 'a' },
    { q: 'यदि एक कार 5 सेकंड में 10 मीटर की दूरी तय करती है, तो उसकी चाल (m/s) होगी:', a: '2', b: '5', c: '15', d: '50', ans: 'a' },
    { q: 'कौन सी धातु कमरे के तापमान पर तरल अवस्था में रहती है?', a: 'लोहा', b: 'पारा (Mercury)', c: 'सोना', d: 'एल्युमीनियम', ans: 'b' },
    { q: 'कौन सी धातु को चाकू से आसानी से काटा जा सकता है?', a: 'लोहा', b: 'तांबा', c: 'सोडियम', d: 'एल्युमीनियम', ans: 'c' },
    { q: 'खट्टे फलों में मुख्य रूप से कौन सा अम्ल पाया जाता है?', a: 'हाइड्रोक्लोरिक', b: 'सल्फ्यूरिक', c: 'साइट्रिक अम्ल', d: 'नाइट्रिक अम्ल', ans: 'c' },
    { q: 'वयस्क मनुष्य के शरीर में कुल कितनी हड्डियाँ होती हैं?', a: '200', b: '206', c: '212', d: '180', ans: 'b' },
    { q: 'कौन सा विटामिन सूर्य के प्रकाश से प्राप्त होता है?', a: 'विटामिन A', b: 'विटामिन B', c: 'विटामिन C', d: 'विटामिन D', ans: 'd' },
    { q: 'मानव शरीर की सबसे छोटी हड्डी कौन सी है?', a: 'फीमर', b: 'स्टेपीज़', c: 'रेडियस', d: 'ह्यूमरस', ans: 'b' },
    { q: 'विश्व का सबसे बड़ा महाद्वीप कौन सा है?', a: 'अफ्रीका', b: 'एशिया', c: 'ऑस्ट्रेलिया', d: 'यूरोप', ans: 'b' },
    { q: 'सौर मंडल का सबसे बड़ा ग्रह कौन सा है?', a: 'पृथ्वी', b: 'शुक्र', c: 'मंगल', d: 'बृहस्पति', ans: 'd' },
    { q: 'पृथ्वी का अपनी धुरी पर झुकाव कितने अंश (Degree) का होता है?', a: '0°', b: '23.5°', c: '66.5°', d: '45°', ans: 'b' },
    { q: 'भारतीय संविधान कब लागू हुआ था?', a: '15 अगस्त 1947', b: '26 नवंबर 1949', c: '26 जनवरी 1950', d: '26 जनवरी 1947', ans: 'c' },
    { q: 'प्रसिद्ध ग्रंथ "अर्थशास्त्र" की रचना किसने की थी?', a: 'चाणक्य', b: 'बाणभट्ट', c: 'कालिदास', d: 'तुलसीदास', ans: 'a' },
    { q: 'किस भारतीय स्वतंत्रता सेनानी को "नेताजी" कहा जाता है?', a: 'भगत सिंह', b: 'सुभाष चंद्र बोस', c: 'चंद्रशेखर आज़ाद', d: 'जवाहरलाल नेहरू', ans: 'b' },
    { q: 'भारतीय संविधान का मुख्य निर्माता किसे कहा जाता है?', a: 'महात्मा गांधी', b: 'सुभाष चंद्र बोस', c: 'डॉ. भीमराव अम्बेडकर', d: 'सरदार पटेल', ans: 'c' },
    { q: 'भारत में "चिपको आंदोलन" किससे संबंधित था?', a: 'जल संरक्षण', b: 'वनों की रक्षा', c: 'कृषि सुधार', d: 'औद्योगीकरण', ans: 'b' },
    { q: 'भारत का सबसे नया राज्य (2014 में गठित) कौन सा है?', a: 'झारखंड', b: 'तेलंगाना', c: 'छत्तीसगढ़', d: 'उत्तराखंड', ans: 'b' },
    { q: '√144 + √81 का मान क्या होगा? (What is the value of √144 + √81?)', a: '19', b: '21', c: '23', d: '25', ans: 'b' },
    { q: 'वृत्त के क्षेत्रफल (Area of Circle) का सही सूत्र क्या है?', a: '2πr', b: 'πr²', c: 'πd', d: '2πr²', ans: 'b' },
    { q: 'प्रकाश संश्लेषण (Photosynthesis) के लिए पौधे कौन सी गैस ग्रहण करते हैं?', a: 'ऑक्सीजन', b: 'नाइट्रोजन', c: 'कार्बन डाइऑक्साइड', d: 'हाइड्रोजन', ans: 'c' },
    { q: 'वायुमंडल में नाइट्रोजन गैस का प्रतिशत लगभग कितना है?', a: '21%', b: '78%', c: '0.03%', d: '50%', ans: 'b' },
    { q: 'ध्वनि की तीव्रता मापने की इकाई क्या है?', a: 'हर्ट्ज़', b: 'डेसीबल (dB)', c: 'जूल', d: 'न्यूटन', ans: 'b' },
    { q: 'विद्युत धारा (Electric Current) का SI मात्रक क्या है?', a: 'वोल्ट', b: 'ओम', c: 'एम्पियर', d: 'वाट', ans: 'c' },
    { q: '12 × 15 ÷ 3 का मान कितना होगा?', a: '45', b: '60', c: '50', d: '75', ans: 'b' },
    { q: 'कंप्यूटर का मस्तिष्क (Brain of Computer) किसे कहा जाता है?', a: 'RAM', b: 'CPU', c: 'Hard Disk', d: 'Monitor', ans: 'b' },
    { q: 'भारत की सबसे लंबी नदी कौन सी है?', a: 'यमुना', b: 'गंगा', c: 'गोदावरी', d: 'नर्मदा', ans: 'b' },
    { q: 'विश्व पर्यावरण दिवस (World Environment Day) कब मनाया जाता है?', a: '5 जून', b: '22 अप्रैल', c: '15 अगस्त', d: '8 मार्च', ans: 'a' },
    { q: 'पानी का रासायनिक सूत्र (Chemical Formula of Water) क्या है?', a: 'CO₂', b: 'H₂O', c: 'O₂', d: 'NaCl', ans: 'b' },
    { q: 'त्रिभुज के तीनों अंतः कोणों का योग कितना होता है?', a: '90°', b: '180°', c: '270°', d: '360°', ans: 'b' },
    { q: 'रक्त का शुद्धिकरण (Filtration of Blood) मानव शरीर के किस अंग में होता है?', a: 'हृदय', b: 'फेफड़े', c: 'वृक्क (Kidney)', d: 'यकृत', ans: 'c' },
    { q: 'अंतर्राष्ट्रीय योग दिवस प्रतिवर्ष कब मनाया जाता है?', a: '21 जून', b: '1 मई', c: '14 नवंबर', d: '2 अक्टूबर', ans: 'a' },
    { q: 'यदि किसी वस्तु का क्रय मूल्य ₹400 और विक्रय मूल्य ₹500 है, तो लाभ प्रतिशत होगा:', a: '20%', b: '25%', c: '30%', d: '15%', ans: 'b' },
    { q: 'सूर्य से सबसे निकट स्थित ग्रह कौन सा है?', a: 'शुक्र', b: 'पृथ्वी', c: 'बुध (Mercury)', d: 'मंगल', ans: 'c' }
  ];

  function createDefaultState() {
    return {
      header: {
        orgName: 'तर्कशील-प्रगतिशील समाज गंधपा',
        showOrgName: true,
        examTitle: 'प्रतियोगिता परीक्षा - 2025 प्रश्न-पत्र',
        showExamTitle: true,
        examSubtitle: 'मध्यम वर्ग परीक्षा',
        showExamSubtitle: true,
        examDate: 'दिनांक: 18/10/2026',
        showExamDate: true,
        examTime: 'समय: 2 घंटे',
        showExamTime: true,
        maxMarks: 'पूर्णांक: 100',
        showMaxMarks: true,
        style: 'classic'
      },
      logo: {
        dataUrl: SAMPLE_EMBLEM_SVG,
        showHeaderLogo: true,
        headerLogoPos: 'left',
        headerLogoSize: 54,
        showWatermark: true,
        watermarkOpacity: 12,
        watermarkSize: 300,
        watermarkRotation: 0
      },
      instructions: {
        show: true,
        title: 'परीक्षार्थियों के लिए सामान्य निर्देश:',
        items: DEFAULT_INSTRUCTIONS.slice()
      },
      layout: {
        columns: '2',
        showColumnRule: false,
        printSide: 'double',
        fontSize: 10.5,
        spacing: 'compact',
        optionLayout: 'inline'
      },
      answerKey: {
        show: true,
        title: "शिक्षक उत्तर कुंजी (Teacher's Answer Key)"
      },
      questions: INITIAL_QUESTIONS.map((item, idx) => ({
        id: 'q_' + (idx + 1) + '_' + Date.now(),
        ...item
      }))
    };
  }

  let state = loadState();
  let editingIndex = -1;
  let lastFocusedInput = null;
  let previewZoomMode = 'fit';
  let confirmCallback = null;
  let deferredInstallPrompt = null;

  // ==================== PWA INSTALL & SERVICE WORKER ====================
  function isRunningStandalone() {
    return (
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      window.navigator.standalone === true
    );
  }

  function initPWA() {
    const installBtn = document.getElementById('btnInstallApp');
    if (installBtn && isRunningStandalone()) {
      installBtn.hidden = true;
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      if (installBtn) installBtn.hidden = false;
    });

    window.addEventListener('appinstalled', () => {
      deferredInstallPrompt = null;
      if (installBtn) installBtn.hidden = true;
      showToast('AnRu Exam Paper Maker installed on your device!');
    });

    if (installBtn) {
      installBtn.addEventListener('click', async () => {
        if (deferredInstallPrompt) {
          try {
            deferredInstallPrompt.prompt();
            const choice = await deferredInstallPrompt.userChoice;
            if (choice && choice.outcome === 'accepted') {
              deferredInstallPrompt = null;
            }
          } catch (err) {
            document.getElementById('installGuideModal').hidden = false;
          }
        } else {
          document.getElementById('installGuideModal').hidden = false;
        }
      });
    }

    const closeInstall = document.getElementById('btnCloseInstallGuide');
    const installModal = document.getElementById('installGuideModal');
    if (closeInstall && installModal) {
      closeInstall.addEventListener('click', () => { installModal.hidden = true; });
      installModal.addEventListener('click', (e) => {
        if (e.target.id === 'installGuideModal') installModal.hidden = true;
      });
    }

    // Register Service Worker on HTTPS (GitHub Pages) or localhost
    if (
      'serviceWorker' in navigator &&
      window.location &&
      (window.location.protocol === 'https:' || window.location.hostname === 'localhost')
    ) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
      });
    }
  }

  // ==================== PERSISTENCE (SAFE LOCALSTORAGE) ====================
  function loadState() {
    try {
      const raw =
        window.localStorage.getItem(STORAGE_KEY) ||
        window.localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!raw) return createDefaultState();
      const parsed = JSON.parse(raw);
      const def = createDefaultState();
      return {
        header: { ...def.header, ...(parsed.header || {}) },
        logo: { ...def.logo, ...(parsed.logo || {}) },
        instructions: {
          ...def.instructions,
          ...(parsed.instructions || {}),
          items: Array.isArray(parsed.instructions?.items)
            ? parsed.instructions.items
            : def.instructions.items
        },
        layout: { ...def.layout, ...(parsed.layout || {}) },
        answerKey: { ...def.answerKey, ...(parsed.answerKey || {}) },
        questions: Array.isArray(parsed.questions) ? parsed.questions : def.questions
      };
    } catch (err) {
      return createDefaultState();
    }
  }

  let saveTimer = null;
  function saveState() {
    const badge = document.getElementById('saveStatusBadge');
    if (badge) badge.textContent = 'Saving...';
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        if (badge) badge.textContent = 'Auto-Saved';
      } catch (err) {
        if (badge) badge.textContent = 'Storage Full';
        showToast('Local storage full — try a smaller logo image or export JSON backup.');
      }
    }, 180);
  }

  // ==================== UTILITIES ====================
  function escHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(8px)';
      el.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      setTimeout(() => el.remove(), 220);
    }, 2600);
  }

  function openConfirm(title, message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    confirmCallback = onConfirm;
    modal.hidden = false;
  }

  function closeConfirm() {
    document.getElementById('confirmModal').hidden = true;
    confirmCallback = null;
  }

  // ==================== HINDI + ENGLISH BULK QUESTION PARSER ====================
  function parseBulkQuestions(rawText) {
    if (!rawText || !rawText.trim()) return [];

    const normalized = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
    const lines = normalized.split('\n').map(l => l.trim()).filter(Boolean);

    const qStartRe = /^(?:(?:Q|q|प्रश्न|प्र)\.?\s*[-:]?\s*)?(?:\(?\s*(?:\d+|[०-९]+)\s*[\).:\-])\s*(.+)$/;
    const ansLineRe = /^(?:Ans(?:wer)?|उत्तर|सही\s*उत्तर)\s*[:\-–=]?\s*\(?([a-dA-Dक-घ])\)?\.?$/i;
    const hindiOptMap = { 'क': 'a', 'ख': 'b', 'ग': 'c', 'घ': 'd' };

    function normalizeAnsLetter(ch) {
      if (!ch) return '';
      const lower = ch.toLowerCase();
      if (['a', 'b', 'c', 'd'].includes(lower)) return lower;
      return hindiOptMap[ch] || '';
    }

    const blocks = [];
    let current = null;

    for (const line of lines) {
      const ansMatch = line.match(ansLineRe);
      if (ansMatch && current) {
        current.ans = normalizeAnsLetter(ansMatch[1]);
        continue;
      }

      const startsWithOpt = /^(?:\(?[a-dA-Dक-घ]\)|[a-dA-Dक-घ]\.)\s*/.test(line);
      const qMatch = !startsWithOpt ? line.match(qStartRe) : null;

      if (qMatch) {
        if (current) blocks.push(current);
        current = { textLines: [qMatch[1].trim()], ans: '' };
      } else {
        if (!current) {
          current = { textLines: [line], ans: '' };
        } else {
          current.textLines.push(line);
        }
      }
    }
    if (current) blocks.push(current);

    const parsed = [];
    for (const block of blocks) {
      let full = block.textLines.join(' ').replace(/\s+/g, ' ').trim();
      let ans = block.ans || '';

      const inlineAnsRe = /\s+(?:Ans(?:wer)?|उत्तर|सही\s*उत्तर)\s*[:\-–=]?\s*\(?([a-dA-Dक-घ])\)?\.?\s*$/i;
      const inlineAnsMatch = full.match(inlineAnsRe);
      if (inlineAnsMatch) {
        ans = normalizeAnsLetter(inlineAnsMatch[1]);
        full = full.replace(inlineAnsRe, '').trim();
      }

      const tightOptRe = /(?:\(([a-dA-Dक-घ])\)|(?<![a-zA-Z0-9])([a-dA-Dक-घ])[\).])/g;
      const matches = [];
      let m;
      while ((m = tightOptRe.exec(full)) !== null) {
        const rawKey = m[1] || m[2];
        const key = normalizeAnsLetter(rawKey);
        if (!key) continue;
        matches.push({ key, index: m.index, length: m[0].length });
      }

      const chosen = [];
      const order = ['a', 'b', 'c', 'd'];
      let searchFrom = 0;
      for (const expectedKey of order) {
        const found = matches.find(tok => tok.key === expectedKey && tok.index >= searchFrom);
        if (found) {
          chosen.push(found);
          searchFrom = found.index + found.length;
        }
      }

      if (chosen.length >= 2) {
        const qText = full.slice(0, chosen[0].index).trim();
        const opts = { a: '', b: '', c: '', d: '' };
        for (let i = 0; i < chosen.length; i++) {
          const start = chosen[i].index + chosen[i].length;
          const end = i + 1 < chosen.length ? chosen[i + 1].index : full.length;
          let val = full.slice(start, end).trim();
          if (val.endsWith('*')) {
            val = val.slice(0, -1).trim();
            if (!ans) ans = chosen[i].key;
          }
          opts[chosen[i].key] = val;
        }
        if (qText) {
          parsed.push({
            id: 'q_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
            q: qText,
            a: opts.a,
            b: opts.b,
            c: opts.c,
            d: opts.d,
            ans
          });
        }
      } else if (full.length > 3) {
        parsed.push({
          id: 'q_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
          q: full,
          a: '',
          b: '',
          c: '',
          d: '',
          ans
        });
      }
    }

    return parsed;
  }

  window.__AnRuExamParser = parseBulkQuestions;

  // ==================== UI SYNC (STATE -> FORM CONTROLS) ====================
  function setSegmentedValue(groupId, value) {
    const group = document.getElementById(groupId);
    if (!group) return;
    group.querySelectorAll('.seg-btn').forEach(btn => {
      btn.classList.toggle('active', String(btn.dataset.val) === String(value));
    });
  }

  function syncControlsFromState() {
    document.getElementById('orgName').value = state.header.orgName;
    document.getElementById('showOrgName').checked = state.header.showOrgName;
    document.getElementById('examTitle').value = state.header.examTitle;
    document.getElementById('showExamTitle').checked = state.header.showExamTitle;
    document.getElementById('examSubtitle').value = state.header.examSubtitle;
    document.getElementById('showExamSubtitle').checked = state.header.showExamSubtitle;
    document.getElementById('examDate').value = state.header.examDate;
    document.getElementById('showExamDate').checked = state.header.showExamDate;
    document.getElementById('examTime').value = state.header.examTime;
    document.getElementById('showExamTime').checked = state.header.showExamTime;
    document.getElementById('maxMarks').value = state.header.maxMarks;
    document.getElementById('showMaxMarks').checked = state.header.showMaxMarks;
    setSegmentedValue('headerStyleGroup', state.header.style);

    const thumb = document.getElementById('logoThumbPreview');
    const empty = document.getElementById('logoThumbEmpty');
    if (state.logo.dataUrl) {
      thumb.src = state.logo.dataUrl;
      thumb.hidden = false;
      empty.hidden = true;
    } else {
      thumb.removeAttribute('src');
      thumb.hidden = true;
      empty.hidden = false;
    }
    document.getElementById('showHeaderLogo').checked = state.logo.showHeaderLogo;
    setSegmentedValue('headerLogoPosGroup', state.logo.headerLogoPos);
    document.getElementById('headerLogoSize').value = state.logo.headerLogoSize;
    document.getElementById('headerLogoSizeVal').textContent = state.logo.headerLogoSize + 'px';

    document.getElementById('showWatermark').checked = state.logo.showWatermark;
    document.getElementById('watermarkOpacity').value = state.logo.watermarkOpacity;
    document.getElementById('watermarkOpacityVal').textContent = state.logo.watermarkOpacity + '%';
    document.getElementById('watermarkSize').value = state.logo.watermarkSize;
    document.getElementById('watermarkSizeVal').textContent = state.logo.watermarkSize + 'px';
    document.getElementById('watermarkRotation').value = state.logo.watermarkRotation;
    document.getElementById('watermarkRotationVal').textContent = state.logo.watermarkRotation + '°';

    setSegmentedValue('columnModeGroup', state.layout.columns);
    setSegmentedValue('quickColumnGroup', state.layout.columns);
    document.getElementById('showColumnRule').checked = state.layout.showColumnRule;
    setSegmentedValue('printSideModeGroup', state.layout.printSide);
    document.getElementById('fontSize').value = state.layout.fontSize;
    document.getElementById('fontSizeVal').textContent = state.layout.fontSize + 'pt';
    setSegmentedValue('spacingModeGroup', state.layout.spacing);
    setSegmentedValue('quickSpacingGroup', state.layout.spacing);
    setSegmentedValue('optionLayoutGroup', state.layout.optionLayout);

    document.getElementById('showInstructions').checked = state.instructions.show;
    document.getElementById('instructionsTitle').value = state.instructions.title;
    document.getElementById('instructionsEditorBody').style.opacity = state.instructions.show ? '1' : '0.45';
    renderInstructionsEditor();

    document.getElementById('showAnswerKey').checked = state.answerKey.show;
    document.getElementById('quickAnswerKeyCheck').checked = state.answerKey.show;
    document.getElementById('answerKeyTitle').value = state.answerKey.title;
    document.getElementById('answerKeyTitleWrap').hidden = !state.answerKey.show;
  }

  // ==================== RENDER INSTRUCTIONS EDITOR ====================
  function renderInstructionsEditor() {
    const list = document.getElementById('instructionsList');
    if (!list) return;
    list.innerHTML = '';

    state.instructions.items.forEach((text, idx) => {
      const row = document.createElement('div');
      row.className = 'inst-row';

      const num = document.createElement('span');
      num.className = 'inst-num';
      num.textContent = String(idx + 1);

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'glass-input';
      input.value = text;
      input.addEventListener('input', () => {
        state.instructions.items[idx] = input.value;
        saveState();
        renderPaperPreview();
      });

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'glass-btn btn-danger-soft btn-xs';
      delBtn.textContent = '✕';
      delBtn.title = 'Delete instruction';
      delBtn.addEventListener('click', () => {
        state.instructions.items.splice(idx, 1);
        saveState();
        renderInstructionsEditor();
        renderPaperPreview();
      });

      row.append(num, input, delBtn);
      list.appendChild(row);
    });
  }

  // ==================== RENDER QUESTION BANK LIST ====================
  function renderQuestionList() {
    const container = document.getElementById('questionListContainer');
    const searchVal = (document.getElementById('qSearchInput')?.value || '').trim().toLowerCase();
    const total = state.questions.length;

    document.getElementById('tabQuestionCount').textContent = String(total);
    document.getElementById('questionCountLabel').textContent = total + ' प्रश्न';

    const answeredCount = state.questions.filter(q => q.ans).length;
    document.getElementById('answerKeyStatus').textContent =
      `${answeredCount} / ${total} questions have answers set for the Teacher's Answer Key`;

    container.innerHTML = '';

    const filtered = state.questions
      .map((item, idx) => ({ item, idx }))
      .filter(({ item }) => {
        if (!searchVal) return true;
        return (
          item.q.toLowerCase().includes(searchVal) ||
          item.a.toLowerCase().includes(searchVal) ||
          item.b.toLowerCase().includes(searchVal) ||
          item.c.toLowerCase().includes(searchVal) ||
          item.d.toLowerCase().includes(searchVal)
        );
      });

    if (filtered.length === 0) {
      container.innerHTML = `<div class="empty-state">${
        total === 0
          ? 'अभी कोई प्रश्न नहीं है। बाईं ओर से प्रश्न जोड़ें या "50-MCQ Demo" लोड करें।'
          : 'No matching questions found.'
      }</div>`;
      return;
    }

    filtered.forEach(({ item, idx }) => {
      const card = document.createElement('div');
      card.className = 'q-bank-item';

      const ansBadge = item.ans
        ? `<span class="ans-pill">Ans: (${escHtml(item.ans)})</span>`
        : `<span class="ans-pill empty">No Ans</span>`;

      card.innerHTML = `
        <div class="q-bank-top">
          <div class="q-bank-title">${idx + 1}. ${escHtml(item.q)}</div>
        </div>
        <div class="q-bank-opts">
          <span class="q-bank-opt ${item.ans === 'a' ? 'is-ans' : ''}">a) ${escHtml(item.a)}</span>
          <span class="q-bank-opt ${item.ans === 'b' ? 'is-ans' : ''}">b) ${escHtml(item.b)}</span>
          <span class="q-bank-opt ${item.ans === 'c' ? 'is-ans' : ''}">c) ${escHtml(item.c)}</span>
          <span class="q-bank-opt ${item.ans === 'd' ? 'is-ans' : ''}">d) ${escHtml(item.d)}</span>
        </div>
        <div class="q-bank-actions">
          ${ansBadge}
          <div class="q-act-btns">
            <button type="button" class="glass-btn btn-xs" data-act="up" data-idx="${idx}" ${idx === 0 ? 'disabled' : ''} title="Move Up">↑</button>
            <button type="button" class="glass-btn btn-xs" data-act="down" data-idx="${idx}" ${idx === total - 1 ? 'disabled' : ''} title="Move Down">↓</button>
            <button type="button" class="glass-btn btn-xs" data-act="edit" data-idx="${idx}">Edit</button>
            <button type="button" class="glass-btn btn-danger-soft btn-xs" data-act="del" data-idx="${idx}">Delete</button>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  // ==================== RENDER LIVE A4 PAPER & PRINT ENGINE ====================
  function updateDynamicPrintRules() {
    const styleEl = document.getElementById('dynamicPrintStyle');
    if (!styleEl) return;

    if (state.layout.printSide === 'double') {
      styleEl.textContent = `
        @page { size: A4 portrait; margin: 10mm 11mm 11mm 13mm; }
        @page :left { margin: 10mm 13mm 11mm 11mm; }
        @page :right { margin: 10mm 11mm 11mm 13mm; }
      `;
    } else {
      styleEl.textContent = `
        @page { size: A4 portrait; margin: 11mm 12mm 12mm 12mm; }
      `;
    }
  }

  function renderPaperPreview() {
    const root = document.documentElement;
    root.style.setProperty('--paper-font-size', state.layout.fontSize + 'pt');
    root.style.setProperty('--wm-opacity', String(state.logo.watermarkOpacity / 100));
    root.style.setProperty('--wm-size', state.logo.watermarkSize + 'px');
    root.style.setProperty('--wm-rotate', state.logo.watermarkRotation + 'deg');
    root.style.setProperty('--header-logo-size', state.logo.headerLogoSize + 'px');

    updateDynamicPrintRules();

    const wmLayer = document.getElementById('paperWatermarkLayer');
    const wmImg = document.getElementById('paperWatermarkImg');
    if (state.logo.showWatermark && state.logo.dataUrl) {
      wmImg.src = state.logo.dataUrl;
      wmLayer.hidden = false;
    } else {
      wmLayer.hidden = true;
    }

    const headerEl = document.getElementById('paperHeader');
    headerEl.className = `paper-header style-${state.header.style}`;
    const hasLogo = state.logo.showHeaderLogo && Boolean(state.logo.dataUrl);
    const pos = state.logo.headerLogoPos;

    const titleLines = [];
    if (state.header.showOrgName && state.header.orgName.trim()) {
      titleLines.push(`<div class="ph-org">${escHtml(state.header.orgName)}</div>`);
    }
    if (state.header.showExamTitle && state.header.examTitle.trim()) {
      titleLines.push(`<div class="ph-title">${escHtml(state.header.examTitle)}</div>`);
    }
    if (state.header.showExamSubtitle && state.header.examSubtitle.trim()) {
      titleLines.push(`<div class="ph-subtitle">(${escHtml(state.header.examSubtitle)})</div>`);
    }

    const metaParts = [];
    if (state.header.showExamDate && state.header.examDate.trim()) {
      metaParts.push(`<span>${escHtml(state.header.examDate)}</span>`);
    }
    if (state.header.showExamTime && state.header.examTime.trim()) {
      metaParts.push(`<span>${escHtml(state.header.examTime)}</span>`);
    }
    if (state.header.showMaxMarks && state.header.maxMarks.trim()) {
      metaParts.push(`<span>${escHtml(state.header.maxMarks)}</span>`);
    }

    const logoHtml = hasLogo ? `<img class="ph-logo" src="${state.logo.dataUrl}" alt="Logo">` : '';
    const spacerHtml = hasLogo && (pos === 'left' || pos === 'right')
      ? `<div class="ph-logo-spacer" aria-hidden="true"></div>`
      : '';

    headerEl.innerHTML = `
      <div class="ph-top ${hasLogo ? 'logo-' + pos : ''}">
        ${logoHtml}
        <div class="ph-titles">${titleLines.join('')}</div>
        ${spacerHtml}
      </div>
      ${metaParts.length ? `<div class="ph-meta">${metaParts.join('')}</div>` : ''}
    `;

    const instEl = document.getElementById('paperInstructions');
    const validInst = state.instructions.items.filter(s => s && s.trim());
    if (state.instructions.show && validInst.length > 0) {
      instEl.hidden = false;
      instEl.innerHTML = `
        <h3>${escHtml(state.instructions.title || 'निर्देश:')}</h3>
        <ol>${validInst.map(s => `<li>${escHtml(s)}</li>`).join('')}</ol>
      `;
    } else {
      instEl.hidden = true;
      instEl.innerHTML = '';
    }

    const qEl = document.getElementById('paperQuestions');
    qEl.className = [
      'paper-questions',
      'cols-' + state.layout.columns,
      state.layout.columns === '2' && state.layout.showColumnRule ? 'with-rule' : '',
      'spacing-' + state.layout.spacing,
      'opt-' + state.layout.optionLayout
    ].filter(Boolean).join(' ');

    if (state.questions.length === 0) {
      qEl.innerHTML = `<p style="text-align:center;padding:24px 0;color:#555;">No questions added yet. Switch to the Questions tab to add MCQs.</p>`;
    } else {
      qEl.innerHTML = state.questions
        .map((item, idx) => {
          const opts = [
            { k: 'a', v: item.a },
            { k: 'b', v: item.b },
            { k: 'c', v: item.c },
            { k: 'd', v: item.d }
          ].filter(o => o.v !== '');

          const optsHtml = opts.length
            ? `<div class="pq-opts">${opts
                .map(o => `<span class="pq-opt"><span class="pq-opt-lbl">${o.k})</span> ${escHtml(o.v)}</span>`)
                .join('')}</div>`
            : '';

          return `
            <div class="paper-q-item">
              <div class="pq-stem"><span class="pq-num">${idx + 1}.</span>${escHtml(item.q)}</div>
              ${optsHtml}
            </div>
          `;
        })
        .join('');
    }

    const akSheet = document.getElementById('paperAnswerKeySheet');
    const akHeader = document.getElementById('answerKeyHeader');
    const akGrid = document.getElementById('answerKeyGrid');

    if (state.answerKey.show && state.questions.length > 0) {
      akSheet.hidden = false;
      akHeader.innerHTML = `
        <h3>${escHtml(state.answerKey.title || "Teacher's Answer Key")}</h3>
        <p>${escHtml(state.header.orgName)} — ${escHtml(state.header.examTitle)}</p>
      `;
      akGrid.innerHTML = state.questions
        .map((item, idx) => `
          <div class="ak-cell">
            <span class="ak-q">Q.${idx + 1}</span>
            <span class="ak-a">${item.ans ? '(' + escHtml(item.ans) + ')' : '—'}</span>
          </div>
        `)
        .join('');
    } else {
      akSheet.hidden = true;
    }

    updatePreviewScaleAndEstimate();
  }

  function updatePreviewScaleAndEstimate() {
    const viewport = document.getElementById('a4PreviewViewport');
    const frame = document.getElementById('a4PreviewFrame');
    const scaler = document.getElementById('a4PreviewScaler');
    const sheet = document.getElementById('paperSheetMain');
    const rootEl = document.getElementById('printPaperRoot');
    const estEl = document.getElementById('previewPageEstimate');

    if (viewport && frame && scaler && sheet && rootEl) {
      const paperPxWidth = 794;
      const availWidth = Math.max(260, viewport.clientWidth - 12);
      const scale = previewZoomMode === 'fit' ? Math.min(1, availWidth / paperPxWidth) : 1;

      scaler.style.transform = `scale(${scale})`;
      const rootHeight = rootEl.scrollHeight || 1123;
      frame.style.width = Math.round(paperPxWidth * scale) + 'px';
      frame.style.height = Math.ceil(rootHeight * scale) + 'px';

      const qCount = state.questions.length;
      const estPages = Math.max(1, Math.ceil(sheet.scrollHeight / 1085));
      const akNote = state.answerKey.show && qCount > 0 ? ' + 1 Answer Key Page' : '';
      const modeText = state.layout.printSide === 'double' ? 'Front-Back A4' : 'Single-Sided A4';
      const fitHint =
        qCount >= 40 && estPages <= 2
          ? ' • Fits cleanly on 1 Sheet (Front & Back) ✓'
          : qCount >= 40 && estPages > 2
          ? ' • Tip: Try 2-Col + Compact + 10pt to fit on 2 pages'
          : '';

      if (estEl) {
        estEl.textContent = `${qCount} Questions • ~${estPages} A4 Page${estPages > 1 ? 's' : ''}${akNote} (${modeText})${fitHint}`;
      }
    }
  }

  // ==================== TAB SWITCHING ====================
  function switchTab(tabName) {
    document.querySelectorAll('.nav-tab').forEach(btn => {
      const isAct = btn.dataset.tab === tabName;
      btn.classList.toggle('active', isAct);
      btn.setAttribute('aria-selected', String(isAct));
    });
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === 'panel-' + tabName);
    });
    if (tabName === 'preview') {
      renderPaperPreview();
      requestAnimationFrame(updatePreviewScaleAndEstimate);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==================== SINGLE QUESTION FORM HELPERS ====================
  function getSelectedAnswer() {
    const active = document.querySelector('#qAnswerGroup .seg-btn.active');
    return active ? active.dataset.val : '';
  }

  function resetQuestionForm() {
    editingIndex = -1;
    document.getElementById('qText').value = '';
    document.getElementById('optA').value = '';
    document.getElementById('optB').value = '';
    document.getElementById('optC').value = '';
    document.getElementById('optD').value = '';
    setSegmentedValue('qAnswerGroup', '');
    document.getElementById('editingBanner').hidden = true;
    document.getElementById('btnSaveQuestion').textContent = '+ Add Question (प्रश्न जोड़ें)';
  }

  function loadQuestionIntoForm(idx) {
    const item = state.questions[idx];
    if (!item) return;
    editingIndex = idx;
    setSegmentedValue('qModeGroup', 'single');
    document.getElementById('singleEntrySection').hidden = false;
    document.getElementById('bulkPasteSection').hidden = true;

    document.getElementById('qText').value = item.q;
    document.getElementById('optA').value = item.a;
    document.getElementById('optB').value = item.b;
    document.getElementById('optC').value = item.c;
    document.getElementById('optD').value = item.d;
    setSegmentedValue('qAnswerGroup', item.ans || '');

    document.getElementById('editingBanner').hidden = false;
    document.getElementById('editingBannerText').textContent = `Editing Question #${idx + 1}`;
    document.getElementById('btnSaveQuestion').textContent = 'Save Changes (बदलाव सहेजें)';
    document.getElementById('qText').focus();
  }

  // ==================== IMAGE COMPRESSION FOR LOGO ====================
  function handleLogoFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 560;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          const ratio = Math.min(maxDim / w, maxDim / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        state.logo.dataUrl = canvas.toDataURL('image/png');
        saveState();
        syncControlsFromState();
        renderPaperPreview();
        showToast('Logo uploaded successfully!');
      };
      img.onerror = () => showToast('Could not read that image file.');
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  // ==================== EVENT WIRING ====================
  function wireSegmented(groupId, onChange) {
    const group = document.getElementById(groupId);
    if (!group) return;
    group.addEventListener('click', e => {
      const btn = e.target.closest('.seg-btn');
      if (!btn) return;
      group.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      onChange(btn.dataset.val);
    });
  }

  function bindAllEvents() {
    document.querySelectorAll('.nav-tab').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    document.getElementById('btnGoToQuestions').addEventListener('click', () => switchTab('questions'));
    document.getElementById('btnBackToHeader').addEventListener('click', () => switchTab('header'));
    document.getElementById('btnGoToPreview').addEventListener('click', () => switchTab('preview'));

    document.getElementById('btnLoadSample').addEventListener('click', () => {
      openConfirm(
        'Load 50-MCQ Sample Paper?',
        'This will load a complete 50-question Hindi + English competitive exam paper with answer keys and sample emblem so you can test 2-page Front-Back A4 printing.',
        () => {
          const all50 = INITIAL_QUESTIONS.concat(EXTRA_DEMO_QUESTIONS).map((item, idx) => ({
            id: 'demo_' + (idx + 1) + '_' + Date.now(),
            ...item
          }));
          state.questions = all50;
          state.layout.columns = '2';
          state.layout.spacing = 'compact';
          state.layout.fontSize = 10;
          state.layout.printSide = 'double';
          if (!state.logo.dataUrl) state.logo.dataUrl = SAMPLE_EMBLEM_SVG;
          saveState();
          syncControlsFromState();
          renderQuestionList();
          renderPaperPreview();
          switchTab('preview');
          showToast('50-MCQ Sample Paper loaded!');
        }
      );
    });

    document.getElementById('btnExportJson').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'anru-exam-paper-backup.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast('Exam paper JSON backup downloaded!');
    });

    const importInput = document.getElementById('importJsonInput');
    document.getElementById('btnImportJson').addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', () => {
      const file = importInput.files && importInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result);
          if (!parsed || !Array.isArray(parsed.questions)) {
            throw new Error('Invalid format');
          }
          const def = createDefaultState();
          state = {
            header: { ...def.header, ...(parsed.header || {}) },
            logo: { ...def.logo, ...(parsed.logo || {}) },
            instructions: { ...def.instructions, ...(parsed.instructions || {}) },
            layout: { ...def.layout, ...(parsed.layout || {}) },
            answerKey: { ...def.answerKey, ...(parsed.answerKey || {}) },
            questions: parsed.questions
          };
          saveState();
          syncControlsFromState();
          renderQuestionList();
          renderPaperPreview();
          showToast(`Imported ${state.questions.length} questions successfully!`);
        } catch (err) {
          showToast('Invalid JSON backup file.');
        }
        importInput.value = '';
      };
      reader.readAsText(file);
    });

    function triggerPrint() {
      renderPaperPreview();
      window.print();
    }
    document.getElementById('btnQuickPrint').addEventListener('click', triggerPrint);
    document.getElementById('btnPrintNow').addEventListener('click', triggerPrint);

    const headerTextFields = ['orgName', 'examTitle', 'examSubtitle', 'examDate', 'examTime', 'maxMarks'];
    headerTextFields.forEach(key => {
      document.getElementById(key).addEventListener('input', e => {
        state.header[key] = e.target.value;
        saveState();
        renderPaperPreview();
      });
    });

    const headerToggles = ['showOrgName', 'showExamTitle', 'showExamSubtitle', 'showExamDate', 'showExamTime', 'showMaxMarks'];
    headerToggles.forEach(key => {
      document.getElementById(key).addEventListener('change', e => {
        state.header[key] = e.target.checked;
        saveState();
        renderPaperPreview();
      });
    });

    wireSegmented('headerStyleGroup', val => {
      state.header.style = val;
      saveState();
      renderPaperPreview();
    });

    const logoInput = document.getElementById('logoUploadInput');
    document.getElementById('btnUploadLogo').addEventListener('click', () => logoInput.click());
    logoInput.addEventListener('change', () => {
      if (logoInput.files && logoInput.files[0]) {
        handleLogoFile(logoInput.files[0]);
        logoInput.value = '';
      }
    });

    document.getElementById('btnSampleLogo').addEventListener('click', () => {
      state.logo.dataUrl = SAMPLE_EMBLEM_SVG;
      saveState();
      syncControlsFromState();
      renderPaperPreview();
      showToast('Sample emblem applied!');
    });

    document.getElementById('btnRemoveLogo').addEventListener('click', () => {
      state.logo.dataUrl = '';
      saveState();
      syncControlsFromState();
      renderPaperPreview();
      showToast('Logo removed.');
    });

    document.getElementById('showHeaderLogo').addEventListener('change', e => {
      state.logo.showHeaderLogo = e.target.checked;
      saveState();
      renderPaperPreview();
    });

    wireSegmented('headerLogoPosGroup', val => {
      state.logo.headerLogoPos = val;
      saveState();
      renderPaperPreview();
    });

    document.getElementById('headerLogoSize').addEventListener('input', e => {
      state.logo.headerLogoSize = Number(e.target.value);
      document.getElementById('headerLogoSizeVal').textContent = state.logo.headerLogoSize + 'px';
      saveState();
      renderPaperPreview();
    });

    document.getElementById('showWatermark').addEventListener('change', e => {
      state.logo.showWatermark = e.target.checked;
      saveState();
      renderPaperPreview();
    });

    document.getElementById('watermarkOpacity').addEventListener('input', e => {
      state.logo.watermarkOpacity = Number(e.target.value);
      document.getElementById('watermarkOpacityVal').textContent = state.logo.watermarkOpacity + '%';
      saveState();
      renderPaperPreview();
    });

    document.getElementById('watermarkSize').addEventListener('input', e => {
      state.logo.watermarkSize = Number(e.target.value);
      document.getElementById('watermarkSizeVal').textContent = state.logo.watermarkSize + 'px';
      saveState();
      renderPaperPreview();
    });

    document.getElementById('watermarkRotation').addEventListener('input', e => {
      state.logo.watermarkRotation = Number(e.target.value);
      document.getElementById('watermarkRotationVal').textContent = state.logo.watermarkRotation + '°';
      saveState();
      renderPaperPreview();
    });

    wireSegmented('columnModeGroup', val => {
      state.layout.columns = val;
      setSegmentedValue('quickColumnGroup', val);
      saveState();
      renderPaperPreview();
    });
    wireSegmented('quickColumnGroup', val => {
      state.layout.columns = val;
      setSegmentedValue('columnModeGroup', val);
      saveState();
      renderPaperPreview();
    });

    document.getElementById('showColumnRule').addEventListener('change', e => {
      state.layout.showColumnRule = e.target.checked;
      saveState();
      renderPaperPreview();
    });

    wireSegmented('printSideModeGroup', val => {
      state.layout.printSide = val;
      saveState();
      renderPaperPreview();
    });

    document.getElementById('fontSize').addEventListener('input', e => {
      state.layout.fontSize = Number(e.target.value);
      document.getElementById('fontSizeVal').textContent = state.layout.fontSize + 'pt';
      saveState();
      renderPaperPreview();
    });

    wireSegmented('spacingModeGroup', val => {
      state.layout.spacing = val;
      setSegmentedValue('quickSpacingGroup', val);
      saveState();
      renderPaperPreview();
    });
    wireSegmented('quickSpacingGroup', val => {
      state.layout.spacing = val;
      setSegmentedValue('spacingModeGroup', val);
      saveState();
      renderPaperPreview();
    });

    wireSegmented('optionLayoutGroup', val => {
      state.layout.optionLayout = val;
      saveState();
      renderPaperPreview();
    });

    wireSegmented('previewZoomGroup', val => {
      previewZoomMode = val;
      updatePreviewScaleAndEstimate();
    });

    document.getElementById('showInstructions').addEventListener('change', e => {
      state.instructions.show = e.target.checked;
      document.getElementById('instructionsEditorBody').style.opacity = state.instructions.show ? '1' : '0.45';
      saveState();
      renderPaperPreview();
    });

    document.getElementById('instructionsTitle').addEventListener('input', e => {
      state.instructions.title = e.target.value;
      saveState();
      renderPaperPreview();
    });

    function addInstruction() {
      const inp = document.getElementById('newInstructionInput');
      const val = inp.value.trim();
      if (!val) return;
      state.instructions.items.push(val);
      inp.value = '';
      saveState();
      renderInstructionsEditor();
      renderPaperPreview();
      showToast('Instruction added.');
    }
    document.getElementById('btnAddInstruction').addEventListener('click', addInstruction);
    document.getElementById('newInstructionInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addInstruction();
      }
    });

    wireSegmented('qModeGroup', val => {
      document.getElementById('singleEntrySection').hidden = val !== 'single';
      document.getElementById('bulkPasteSection').hidden = val !== 'bulk';
    });

    ['qText', 'optA', 'optB', 'optC', 'optD'].forEach(id => {
      const el = document.getElementById(id);
      el.addEventListener('focus', () => {
        lastFocusedInput = el;
      });
    });

    document.getElementById('mathSymbolBar').addEventListener('click', e => {
      const btn = e.target.closest('.sym-btn');
      if (!btn) return;
      const sym = btn.dataset.sym;
      const target = lastFocusedInput || document.getElementById('qText');
      const start = target.selectionStart ?? target.value.length;
      const end = target.selectionEnd ?? target.value.length;
      target.value = target.value.slice(0, start) + sym + target.value.slice(end);
      target.focus();
      const nextPos = start + sym.length;
      target.setSelectionRange(nextPos, nextPos);
    });

    wireSegmented('qAnswerGroup', () => {});
    document.getElementById('btnCancelEdit').addEventListener('click', resetQuestionForm);

    document.getElementById('btnSaveQuestion').addEventListener('click', () => {
      const q = document.getElementById('qText').value.trim();
      const a = document.getElementById('optA').value.trim();
      const b = document.getElementById('optB').value.trim();
      const c = document.getElementById('optC').value.trim();
      const d = document.getElementById('optD').value.trim();
      const ans = getSelectedAnswer();

      if (!q) {
        showToast('कृपया प्रश्न लिखें (Please enter question text).');
        document.getElementById('qText').focus();
        return;
      }

      if (editingIndex >= 0 && state.questions[editingIndex]) {
        state.questions[editingIndex] = { ...state.questions[editingIndex], q, a, b, c, d, ans };
        showToast(`Question #${editingIndex + 1} updated!`);
      } else {
        state.questions.push({
          id: 'q_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          q, a, b, c, d, ans
        });
        showToast(`Question #${state.questions.length} added!`);
      }

      resetQuestionForm();
      saveState();
      renderQuestionList();
      renderPaperPreview();
    });

    const bulkArea = document.getElementById('bulkText');
    const bulkPreview = document.getElementById('bulkParsePreview');
    function updateBulkPreviewCount() {
      const count = parseBulkQuestions(bulkArea.value).length;
      bulkPreview.textContent = `${count} question${count === 1 ? '' : 's'} detected`;
    }
    bulkArea.addEventListener('input', updateBulkPreviewCount);

    document.getElementById('btnLoadBulkExample').addEventListener('click', () => {
      bulkArea.value = `1. जल का घनत्व अधिकतम किस तापमान पर होता है?
a) 0°C b) 100°C c) 4°C d) 25°C
उत्तर: c

2. What is the SI unit of Electric Current?
(a) Volt (b) Ohm (c) Ampere (d) Watt
Ans: c

3. पृथ्वी पर सबसे बड़ा महासागर कौन सा है?
क) हिन्द महासागर ख) प्रशांत महासागर ग) अटलांटिक महासागर घ) आर्कटिक महासागर
उत्तर: ख`;
      updateBulkPreviewCount();
    });

    document.getElementById('btnBulkAppend').addEventListener('click', () => {
      const parsed = parseBulkQuestions(bulkArea.value);
      if (parsed.length === 0) {
        showToast('No valid questions detected. Check formatting.');
        return;
      }
      state.questions = state.questions.concat(parsed);
      bulkArea.value = '';
      updateBulkPreviewCount();
      saveState();
      renderQuestionList();
      renderPaperPreview();
      showToast(`Added ${parsed.length} questions to your paper!`);
    });

    document.getElementById('btnBulkReplace').addEventListener('click', () => {
      const parsed = parseBulkQuestions(bulkArea.value);
      if (parsed.length === 0) {
        showToast('No valid questions detected. Check formatting.');
        return;
      }
      openConfirm(
        'Replace All Questions?',
        `This will replace your current ${state.questions.length} questions with ${parsed.length} newly parsed questions.`,
        () => {
          state.questions = parsed;
          bulkArea.value = '';
          updateBulkPreviewCount();
          resetQuestionForm();
          saveState();
          renderQuestionList();
          renderPaperPreview();
          showToast(`Replaced with ${parsed.length} questions!`);
        }
      );
    });

    document.getElementById('questionListContainer').addEventListener('click', e => {
      const btn = e.target.closest('button[data-act]');
      if (!btn) return;
      const act = btn.dataset.act;
      const idx = Number(btn.dataset.idx);
      if (Number.isNaN(idx) || idx < 0 || idx >= state.questions.length) return;

      if (act === 'up' && idx > 0) {
        const tmp = state.questions[idx - 1];
        state.questions[idx - 1] = state.questions[idx];
        state.questions[idx] = tmp;
        saveState();
        renderQuestionList();
        renderPaperPreview();
      } else if (act === 'down' && idx < state.questions.length - 1) {
        const tmp = state.questions[idx + 1];
        state.questions[idx + 1] = state.questions[idx];
        state.questions[idx] = tmp;
        saveState();
        renderQuestionList();
        renderPaperPreview();
      } else if (act === 'edit') {
        loadQuestionIntoForm(idx);
      } else if (act === 'del') {
        state.questions.splice(idx, 1);
        if (editingIndex === idx) resetQuestionForm();
        else if (editingIndex > idx) editingIndex--;
        saveState();
        renderQuestionList();
        renderPaperPreview();
        showToast('Question deleted.');
      }
    });

    document.getElementById('qSearchInput').addEventListener('input', renderQuestionList);

    document.getElementById('btnClearAllQuestions').addEventListener('click', () => {
      if (state.questions.length === 0) return;
      openConfirm(
        'Clear All Questions?',
        `Delete all ${state.questions.length} questions from this exam paper?`,
        () => {
          state.questions = [];
          resetQuestionForm();
          saveState();
          renderQuestionList();
          renderPaperPreview();
          showToast('All questions cleared.');
        }
      );
    });

    function toggleAnswerKey(checked) {
      state.answerKey.show = checked;
      document.getElementById('showAnswerKey').checked = checked;
      document.getElementById('quickAnswerKeyCheck').checked = checked;
      document.getElementById('answerKeyTitleWrap').hidden = !checked;
      saveState();
      renderPaperPreview();
    }
    document.getElementById('showAnswerKey').addEventListener('change', e => toggleAnswerKey(e.target.checked));
    document.getElementById('quickAnswerKeyCheck').addEventListener('change', e => toggleAnswerKey(e.target.checked));

    document.getElementById('answerKeyTitle').addEventListener('input', e => {
      state.answerKey.title = e.target.value;
      saveState();
      renderPaperPreview();
    });

    document.getElementById('btnConfirmCancel').addEventListener('click', closeConfirm);
    document.getElementById('btnConfirmOk').addEventListener('click', () => {
      const fn = confirmCallback;
      closeConfirm();
      if (typeof fn === 'function') fn();
    });
    document.getElementById('confirmModal').addEventListener('click', e => {
      if (e.target.id === 'confirmModal') closeConfirm();
    });

    window.addEventListener('resize', () => {
      if (document.getElementById('panel-preview').classList.contains('active')) {
        updatePreviewScaleAndEstimate();
      }
    });
  }

  // ==================== BOOT ====================
  function init() {
    syncControlsFromState();
    renderQuestionList();
    renderPaperPreview();
    bindAllEvents();
    initPWA();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
