const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const outDir = path.join(__dirname, "..", "assets", "scenes");

const scenes = [
  ["CS001", "外部刺激で手が止まる", ["通知", "会話", "ドア音", "集中が切れる"], ["phone", "chat", "door"]],
  ["CS002", "集中が短時間で波打つ", ["10分", "ミス", "休憩", "集中の波"], ["timer", "errors", "break"]],
  ["CS003", "中断後に戻りにくい", ["中断", "元の作業", "再開できない"], ["phone", "arrow", "doc"]],
  ["CS004", "同時作業で抜ける", ["聞く", "書く", "操作", "一つずつ"], ["phone", "memo", "screen"]],
  ["CS005", "細部に入り込みすぎる", ["細部", "全体", "未完了", "提出"], ["magnifier", "clock", "doc"]],
  ["CS006", "人の気配で疲れる", ["見られている", "人の気配", "疲労"], ["eyes", "person", "desk"]],
  ["CS007", "口頭指示が一部抜ける", ["口頭指示", "1", "2が抜ける", "3"], ["speech", "steps", "gap"]],
  ["CS008", "条件と例外が抜ける", ["A→B", "Cは除く", "条件", "例外"], ["cards", "branch", "warning"]],
  ["CS009", "次の予定を忘れる", ["次の予定", "提出", "報告", "持ち物"], ["calendar", "deadline", "bag"]],
  ["CS010", "目的と終わりを失う", ["目的", "終わりの目安", "どこまで？"], ["goal", "progress", "maze"]],
  ["CS011", "用語・人名・略語が抜ける", ["人名", "略語", "担当", "質問できない"], ["namecard", "list", "memo"]],
  ["CS012", "将来の一手を忘れる", ["後で", "帰る前", "明日", "忘れた"], ["clock", "home", "tomorrow"]],
  ["CS013", "開始の一手が出ない", ["最初の一手", "ファイルを開く", "1行だけ"], ["laptop", "cursor", "hand"]],
  ["CS014", "順番が決まらない", ["順番が決まらない", "1番目は？", "手順"], ["sticky", "number", "clock"]],
  ["CS015", "優先順位がずれる", ["締切", "細部", "優先順位"], ["deadline", "detail", "tags"]],
  ["CS016", "終わりの線がない", ["ここまで", "確認終了", "提出"], ["checks", "edits", "submit"]],
  ["CS017", "ミス後に直し方が見えない", ["ミス発見", "どこを直す？", "修正手順"], ["error", "repair", "steps"]],
  ["CS018", "時間見積もりがずれる", ["5分のはず", "30分経過", "予定ずれ"], ["timer", "calendar", "bar"]],
  ["CS019", "手順変更で止まる", ["前のやり方", "新手順", "変更点"], ["manuals", "split", "update"]],
  ["CS020", "予定変更で組み直せない", ["予定変更", "担当変更", "組み直し"], ["calendar", "notice", "freeze"]],
  ["CS021", "例外で判断が止まる", ["例外", "急ぎなら？", "相談"], ["flow", "branch", "help"]],
  ["CS022", "別案に移るのに時間がかかる", ["別案", "相手の事情", "見方を変える"], ["options", "view", "arrows"]],
  ["CS023", "別の場面で使いにくい", ["研修ではできる", "場所が変わる", "実習先"], ["training", "place", "checklist"]],
  ["CS024", "先が読めず確認が増える", ["先が読めない", "確認", "先延ばし"], ["question", "messages", "delay"]],
  ["CS025", "テンポが速いと崩れる", ["速い説明", "聞き漏れ", "入力ミス"], ["slides", "speed", "typing"]],
];

function esc(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function label(x, y, text, color = "#0f766e") {
  return `<g>
    <rect x="${x}" y="${y}" rx="16" ry="16" width="${Math.max(78, text.length * 18 + 28)}" height="34" fill="#ffffff" stroke="${color}" stroke-width="2"/>
    <text x="${x + 14}" y="${y + 23}" font-size="17" font-weight="700" fill="${color}">${esc(text)}</text>
  </g>`;
}

function icon(name, x, y) {
  const common = `stroke="#475569" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  const fill = "#f8fafc";
  const accent = "#f97316";
  const teal = "#0f766e";
  const map = {
    phone: `<rect x="${x}" y="${y}" width="70" height="108" rx="14" fill="${fill}" stroke="#475569" stroke-width="4"/><circle cx="${x + 35}" cy="${y + 88}" r="5" fill="#475569"/><rect x="${x + 12}" y="${y + 18}" width="46" height="14" rx="7" fill="${accent}"/><rect x="${x + 12}" y="${y + 40}" width="46" height="14" rx="7" fill="#38bdf8"/>`,
    chat: `<path d="M${x} ${y + 20}h92a16 16 0 0 1 16 16v30a16 16 0 0 1-16 16h-44l-26 22v-22h-22a16 16 0 0 1-16-16v-30a16 16 0 0 1 16-16z" fill="${fill}" stroke="#475569" stroke-width="4"/><path d="M${x + 24} ${y + 50}h58M${x + 24} ${y + 68}h38" ${common}/>`,
    door: `<rect x="${x}" y="${y}" width="78" height="124" fill="#f8fafc" stroke="#475569" stroke-width="4"/><path d="M${x + 78} ${y}l38 18v102l-38 4z" fill="#e2e8f0" stroke="#475569" stroke-width="4"/><circle cx="${x + 94}" cy="${y + 68}" r="5" fill="${accent}"/>`,
    timer: `<circle cx="${x + 52}" cy="${y + 62}" r="48" fill="${fill}" stroke="#475569" stroke-width="4"/><path d="M${x + 52} ${y + 62}v-28M${x + 52} ${y + 62}h26M${x + 34} ${y + 8}h36" ${common}/>`,
    errors: `<rect x="${x}" y="${y}" width="112" height="88" rx="10" fill="${fill}" stroke="#475569" stroke-width="4"/><path d="M${x + 20} ${y + 24}h72M${x + 20} ${y + 44}h58M${x + 22} ${y + 68}l18-18M${x + 40} ${y + 68}l-18-18" stroke="#ef4444" stroke-width="5" stroke-linecap="round"/>`,
    break: `<rect x="${x}" y="${y + 28}" width="92" height="58" rx="12" fill="#ecfdf5" stroke="${teal}" stroke-width="4"/><text x="${x + 18}" y="${y + 65}" font-size="20" font-weight="700" fill="${teal}">休</text>`,
    arrow: `<path d="M${x} ${y + 52}c50-60 126-60 164-8" stroke="${teal}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M${x + 154} ${y + 22}l20 25-32 4" fill="none" stroke="${teal}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`,
    doc: `<rect x="${x}" y="${y}" width="104" height="130" rx="8" fill="#fff" stroke="#475569" stroke-width="4"/><path d="M${x + 20} ${y + 34}h62M${x + 20} ${y + 58}h62M${x + 20} ${y + 82}h42" ${common}/>`,
    memo: `<rect x="${x}" y="${y}" width="110" height="86" rx="8" fill="#fef9c3" stroke="#a16207" stroke-width="4"/><path d="M${x + 18} ${y + 30}h70M${x + 18} ${y + 52}h54" stroke="#a16207" stroke-width="4" stroke-linecap="round"/>`,
    screen: `<rect x="${x}" y="${y}" width="130" height="82" rx="8" fill="#eff6ff" stroke="#475569" stroke-width="4"/><path d="M${x + 18} ${y + 24}h92M${x + 18} ${y + 46}h58" ${common}/><path d="M${x + 50} ${y + 82}v28M${x + 28} ${y + 110}h74" ${common}/>`,
    magnifier: `<circle cx="${x + 42}" cy="${y + 42}" r="32" fill="#fff" stroke="#475569" stroke-width="5"/><path d="M${x + 66} ${y + 66}l34 34" ${common}/><text x="${x + 30}" y="${y + 50}" font-size="20" font-weight="800" fill="#ef4444">あ</text>`,
    clock: `<circle cx="${x + 48}" cy="${y + 48}" r="42" fill="${fill}" stroke="#475569" stroke-width="4"/><path d="M${x + 48} ${y + 48}v-24M${x + 48} ${y + 48}h22" ${common}/>`,
    eyes: `<ellipse cx="${x + 30}" cy="${y + 40}" rx="28" ry="16" fill="#fff" stroke="#475569" stroke-width="4"/><circle cx="${x + 30}" cy="${y + 40}" r="7" fill="#475569"/><ellipse cx="${x + 95}" cy="${y + 40}" rx="28" ry="16" fill="#fff" stroke="#475569" stroke-width="4"/><circle cx="${x + 95}" cy="${y + 40}" r="7" fill="#475569"/>`,
    person: `<circle cx="${x + 42}" cy="${y + 28}" r="24" fill="#cbd5e1"/><rect x="${x + 18}" y="${y + 54}" width="48" height="72" rx="22" fill="#cbd5e1"/>`,
    speech: `<path d="M${x} ${y}h112a16 16 0 0 1 16 16v42a16 16 0 0 1-16 16h-46l-30 24v-24h-36a16 16 0 0 1-16-16v-42a16 16 0 0 1 16-16z" fill="#fff" stroke="#475569" stroke-width="4"/>`,
    steps: `<rect x="${x}" y="${y}" width="130" height="110" rx="10" fill="#fff" stroke="#475569" stroke-width="4"/><text x="${x + 20}" y="${y + 35}" font-size="24" font-weight="800" fill="${teal}">1</text><text x="${x + 20}" y="${y + 68}" font-size="24" font-weight="800" fill="#ef4444">?</text><text x="${x + 20}" y="${y + 100}" font-size="24" font-weight="800" fill="${teal}">3</text>`,
    gap: `<path d="M${x} ${y}h94v94h-94z" fill="#fff7ed" stroke="#f97316" stroke-width="4"/><text x="${x + 24}" y="${y + 58}" font-size="42" font-weight="800" fill="#f97316">?</text>`,
    cards: `<rect x="${x}" y="${y}" width="102" height="58" rx="10" fill="#fff" stroke="#475569" stroke-width="4"/><text x="${x + 16}" y="${y + 38}" font-size="22" font-weight="800" fill="${teal}">A→B</text><rect x="${x + 18}" y="${y + 74}" width="118" height="58" rx="10" fill="#fff7ed" stroke="#f97316" stroke-width="4"/><text x="${x + 32}" y="${y + 112}" font-size="20" font-weight="800" fill="#f97316">C除く</text>`,
    branch: `<path d="M${x} ${y + 70}h58M${x + 58} ${y + 70}l48-38M${x + 58} ${y + 70}l48 38" ${common}/>`,
    warning: `<path d="M${x + 50} ${y}l48 86h-96z" fill="#fef3c7" stroke="#f97316" stroke-width="4"/><text x="${x + 43}" y="${y + 62}" font-size="44" font-weight="800" fill="#f97316">!</text>`,
    calendar: `<rect x="${x}" y="${y}" width="116" height="104" rx="10" fill="#fff" stroke="#475569" stroke-width="4"/><rect x="${x}" y="${y}" width="116" height="28" rx="10" fill="#e2e8f0"/><path d="M${x + 20} ${y + 48}h76M${x + 20} ${y + 70}h58" ${common}/>`,
    deadline: `<rect x="${x}" y="${y}" width="118" height="74" rx="10" fill="#fee2e2" stroke="#ef4444" stroke-width="4"/><text x="${x + 18}" y="${y + 45}" font-size="22" font-weight="800" fill="#ef4444">締切</text>`,
    bag: `<path d="M${x + 18} ${y + 44}h92v70h-92z" fill="#f8fafc" stroke="#475569" stroke-width="4"/><path d="M${x + 42} ${y + 44}v-18h44v18" ${common}/>`,
    goal: `<path d="M${x + 20} ${y + 120}v-108" ${common}/><path d="M${x + 22} ${y + 14}h74l-18 26 18 26h-74z" fill="#dcfce7" stroke="${teal}" stroke-width="4"/>`,
    progress: `<rect x="${x}" y="${y}" width="142" height="32" rx="16" fill="#e2e8f0"/><rect x="${x}" y="${y}" width="62" height="32" rx="16" fill="${teal}"/>`,
    maze: `<path d="M${x} ${y}h120v98h-120zM${x + 20} ${y}v70h32M${x + 74} ${y + 98}v-68h28" fill="none" stroke="#475569" stroke-width="4"/>`,
    namecard: `<rect x="${x}" y="${y}" width="120" height="76" rx="10" fill="#fff" stroke="#475569" stroke-width="4"/><circle cx="${x + 30}" cy="${y + 38}" r="14" fill="#cbd5e1"/><path d="M${x + 58} ${y + 28}h42M${x + 58} ${y + 50}h28" ${common}/>`,
    list: `<rect x="${x}" y="${y}" width="126" height="104" rx="10" fill="#fff" stroke="#475569" stroke-width="4"/><text x="${x + 18}" y="${y + 34}" font-size="20" font-weight="800" fill="${teal}">ABC</text><text x="${x + 18}" y="${y + 68}" font-size="20" font-weight="800" fill="#f97316">略語</text>`,
    home: `<path d="M${x + 12} ${y + 58}l52-42 52 42v66h-104z" fill="#fff" stroke="#475569" stroke-width="4"/><path d="M${x + 48} ${y + 124}v-38h32v38" ${common}/>`,
    tomorrow: `<rect x="${x}" y="${y}" width="110" height="92" rx="10" fill="#fff" stroke="#475569" stroke-width="4"/><text x="${x + 20}" y="${y + 56}" font-size="28" font-weight="800" fill="${teal}">明日</text>`,
    laptop: `<rect x="${x}" y="${y}" width="124" height="82" rx="8" fill="#eff6ff" stroke="#475569" stroke-width="4"/><path d="M${x - 8} ${y + 88}h140" ${common}/>`,
    cursor: `<rect x="${x}" y="${y}" width="106" height="84" rx="8" fill="#fff" stroke="#475569" stroke-width="4"/><path d="M${x + 28} ${y + 42}h46" stroke="${teal}" stroke-width="5" stroke-linecap="round"/>`,
    hand: `<path d="M${x} ${y + 70}c30-36 78-34 102 0" fill="none" stroke="#475569" stroke-width="10" stroke-linecap="round"/>`,
    sticky: `<rect x="${x}" y="${y}" width="82" height="66" rx="6" fill="#fef9c3" stroke="#a16207" stroke-width="4"/><rect x="${x + 94}" y="${y + 22}" width="82" height="66" rx="6" fill="#dbeafe" stroke="#2563eb" stroke-width="4"/><rect x="${x + 48}" y="${y + 92}" width="82" height="66" rx="6" fill="#dcfce7" stroke="${teal}" stroke-width="4"/>`,
    number: `<text x="${x}" y="${y + 52}" font-size="54" font-weight="900" fill="#ef4444">1?</text>`,
    detail: `<circle cx="${x + 48}" cy="${y + 48}" r="36" fill="#fff" stroke="#475569" stroke-width="4"/><text x="${x + 34}" y="${y + 57}" font-size="26" font-weight="800" fill="#ef4444">細</text>`,
    tags: `<rect x="${x}" y="${y}" width="104" height="38" rx="19" fill="#fee2e2" stroke="#ef4444" stroke-width="4"/><text x="${x + 24}" y="${y + 26}" font-size="18" font-weight="800" fill="#ef4444">高</text><rect x="${x}" y="${y + 52}" width="104" height="38" rx="19" fill="#dcfce7" stroke="${teal}" stroke-width="4"/><text x="${x + 24}" y="${y + 78}" font-size="18" font-weight="800" fill="${teal}">低</text>`,
    checks: `<rect x="${x}" y="${y}" width="112" height="104" rx="10" fill="#fff" stroke="#475569" stroke-width="4"/><path d="M${x + 22} ${y + 32}l12 12 24-28M${x + 22} ${y + 66}l12 12 24-28" stroke="${teal}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    edits: `<rect x="${x}" y="${y}" width="118" height="92" rx="10" fill="#fff" stroke="#475569" stroke-width="4"/><path d="M${x + 20} ${y + 26}h70M${x + 20} ${y + 52}h54M${x + 72} ${y + 68}l22 16" stroke="#ef4444" stroke-width="5" stroke-linecap="round"/>`,
    submit: `<rect x="${x}" y="${y}" width="118" height="50" rx="12" fill="#dcfce7" stroke="${teal}" stroke-width="4"/><text x="${x + 34}" y="${y + 33}" font-size="22" font-weight="800" fill="${teal}">提出</text>`,
    error: `<rect x="${x}" y="${y}" width="120" height="82" rx="10" fill="#fee2e2" stroke="#ef4444" stroke-width="4"/><text x="${x + 44}" y="${y + 55}" font-size="48" font-weight="900" fill="#ef4444">!</text>`,
    repair: `<path d="M${x + 12} ${y + 78}l68-68 30 30-68 68h-30z" fill="#fff7ed" stroke="#f97316" stroke-width="4"/>`,
    bar: `<rect x="${x}" y="${y}" width="142" height="30" rx="15" fill="#fee2e2"/><rect x="${x}" y="${y}" width="112" height="30" rx="15" fill="#ef4444"/>`,
    manuals: `<rect x="${x}" y="${y}" width="86" height="112" rx="8" fill="#fff" stroke="#475569" stroke-width="4"/><text x="${x + 18}" y="${y + 56}" font-size="18" font-weight="800" fill="#475569">旧</text><rect x="${x + 102}" y="${y}" width="86" height="112" rx="8" fill="#ecfdf5" stroke="${teal}" stroke-width="4"/><text x="${x + 126}" y="${y + 56}" font-size="18" font-weight="800" fill="${teal}">新</text>`,
    split: `<path d="M${x} ${y + 60}h60M${x + 60} ${y + 60}l46-36M${x + 60} ${y + 60}l46 36" ${common}/>`,
    update: `<circle cx="${x + 48}" cy="${y + 48}" r="38" fill="#dbeafe" stroke="#2563eb" stroke-width="4"/><path d="M${x + 30} ${y + 48}h38M${x + 54} ${y + 30}l18 18-18 18" stroke="#2563eb" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    notice: `<rect x="${x}" y="${y}" width="124" height="76" rx="10" fill="#fff7ed" stroke="#f97316" stroke-width="4"/><text x="${x + 28}" y="${y + 48}" font-size="24" font-weight="800" fill="#f97316">変更</text>`,
    freeze: `<path d="M${x + 18} ${y}l16 28M${x + 62} ${y}l-12 30M${x + 104} ${y + 8}l-24 24" stroke="#38bdf8" stroke-width="5" stroke-linecap="round"/>`,
    flow: `<rect x="${x}" y="${y}" width="72" height="42" rx="10" fill="#fff" stroke="#475569" stroke-width="4"/><path d="M${x + 72} ${y + 21}h42" ${common}/><rect x="${x + 114}" y="${y}" width="72" height="42" rx="10" fill="#fff7ed" stroke="#f97316" stroke-width="4"/>`,
    help: `<path d="M${x} ${y}h96a14 14 0 0 1 14 14v48a14 14 0 0 1-14 14h-38l-24 22v-22h-34a14 14 0 0 1-14-14v-48a14 14 0 0 1 14-14z" fill="#ecfdf5" stroke="${teal}" stroke-width="4"/><text x="${x + 40}" y="${y + 50}" font-size="32" font-weight="800" fill="${teal}">?</text>`,
    options: `<rect x="${x}" y="${y}" width="92" height="62" rx="10" fill="#dbeafe" stroke="#2563eb" stroke-width="4"/><text x="${x + 32}" y="${y + 40}" font-size="24" font-weight="800" fill="#2563eb">案A</text><rect x="${x + 108}" y="${y}" width="92" height="62" rx="10" fill="#dcfce7" stroke="${teal}" stroke-width="4"/><text x="${x + 140}" y="${y + 40}" font-size="24" font-weight="800" fill="${teal}">案B</text>`,
    view: `<circle cx="${x + 54}" cy="${y + 54}" r="46" fill="#fff" stroke="#475569" stroke-width="4"/><path d="M${x + 24} ${y + 54}h60M${x + 54} ${y + 24}v60" ${common}/>`,
    arrows: `<path d="M${x} ${y + 34}h90M${x + 70} ${y + 14}l22 20-22 20" stroke="${teal}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    training: `<rect x="${x}" y="${y}" width="112" height="74" rx="10" fill="#ecfdf5" stroke="${teal}" stroke-width="4"/><text x="${x + 22}" y="${y + 45}" font-size="22" font-weight="800" fill="${teal}">研修</text>`,
    place: `<path d="M${x + 48} ${y}c28 0 48 22 48 50 0 38-48 82-48 82s-48-44-48-82c0-28 20-50 48-50z" fill="#fff7ed" stroke="#f97316" stroke-width="4"/><circle cx="${x + 48}" cy="${y + 48}" r="16" fill="#f97316"/>`,
    checklist: `<rect x="${x}" y="${y}" width="106" height="98" rx="10" fill="#fff" stroke="#475569" stroke-width="4"/><path d="M${x + 18} ${y + 30}l9 9 18-22M${x + 18} ${y + 64}l9 9 18-22" stroke="${teal}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    question: `<text x="${x}" y="${y + 82}" font-size="86" font-weight="900" fill="#f97316">?</text>`,
    messages: `<rect x="${x}" y="${y}" width="110" height="42" rx="18" fill="#fff" stroke="#475569" stroke-width="4"/><rect x="${x + 24}" y="${y + 56}" width="110" height="42" rx="18" fill="#fff" stroke="#475569" stroke-width="4"/><text x="${x + 22}" y="${y + 28}" font-size="17" font-weight="800" fill="#475569">確認</text>`,
    delay: `<path d="M${x + 10} ${y + 74}h120" stroke="#94a3b8" stroke-width="6" stroke-linecap="round"/><path d="M${x + 96} ${y + 46}l34 28-34 28" stroke="#94a3b8" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    slides: `<rect x="${x}" y="${y}" width="142" height="92" rx="10" fill="#eff6ff" stroke="#475569" stroke-width="4"/><path d="M${x + 20} ${y + 28}h92M${x + 20} ${y + 52}h74" ${common}/>`,
    speed: `<path d="M${x} ${y + 24}h80M${x + 20} ${y + 52}h86M${x + 44} ${y + 80}h70" stroke="#f97316" stroke-width="6" stroke-linecap="round"/>`,
    typing: `<rect x="${x}" y="${y}" width="132" height="66" rx="10" fill="#fff" stroke="#475569" stroke-width="4"/><path d="M${x + 20} ${y + 24}h92M${x + 20} ${y + 44}h54" ${common}/><path d="M${x + 96} ${y + 20}l22 22M${x + 118} ${y + 20}l-22 22" stroke="#ef4444" stroke-width="5" stroke-linecap="round"/>`,
  };
  return map[name] || icon("doc", x, y);
}

function person() {
  return `<g>
    <ellipse cx="390" cy="386" rx="90" ry="18" fill="#dbe3ea"/>
    <path d="M342 235c-20 36-34 96-24 152h142c8-56-5-116-28-152z" fill="#f8fafc" stroke="#26313d" stroke-width="4"/>
    <circle cx="388" cy="170" r="66" fill="#f8fafc" stroke="#26313d" stroke-width="4"/>
    <path d="M356 154c12-9 24-8 34 3M406 157c12-11 26-12 38-2" stroke="#26313d" stroke-width="5" stroke-linecap="round"/>
    <path d="M372 176c8-7 18-7 26 0M420 176c8-7 18-7 26 0" stroke="#26313d" stroke-width="4" stroke-linecap="round"/>
    <path d="M386 210c12-10 30-10 44 0" stroke="#26313d" stroke-width="4" stroke-linecap="round" fill="none"/>
    <path d="M330 282c-44 14-74 44-86 86" stroke="#26313d" stroke-width="16" stroke-linecap="round" fill="none"/>
    <path d="M446 282c48 22 78 48 92 92" stroke="#26313d" stroke-width="16" stroke-linecap="round" fill="none"/>
    <circle cx="244" cy="368" r="13" fill="#f8fafc" stroke="#26313d" stroke-width="4"/>
    <circle cx="538" cy="374" r="13" fill="#f8fafc" stroke="#26313d" stroke-width="4"/>
  </g>`;
}

function svg(scene) {
  const [id, title, labels, icons] = scene;
  const iconPositions = [[62, 86], [610, 92], [664, 286]];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="768" height="432" viewBox="0 0 768 432">
    <rect width="768" height="432" fill="#eef2f6"/>
    <rect x="36" y="42" width="696" height="346" rx="24" fill="#f8fafc" stroke="#d7e0e8" stroke-width="3"/>
    <rect x="70" y="330" width="628" height="42" rx="12" fill="#d7b58d" opacity="0.55"/>
    <text x="58" y="76" font-size="24" font-weight="800" fill="#22303c">${esc(id)} ${esc(title)}</text>
    ${person()}
    ${icons.map((name, i) => icon(name, iconPositions[i][0], iconPositions[i][1])).join("")}
    ${labels.map((text, i) => label(58 + (i % 2) * 350, 394 - Math.floor(i / 2) * 42, text, i % 2 ? "#f97316" : "#0f766e")).join("")}
  </svg>`;
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  for (const scene of scenes) {
    const file = path.join(outDir, `${scene[0].toLowerCase()}.webp`);
    await sharp(Buffer.from(svg(scene))).webp({ quality: 86 }).toFile(file);
    console.log(file);
  }
})();
