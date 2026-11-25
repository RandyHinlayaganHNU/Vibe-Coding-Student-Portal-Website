/* Northfield Student Portal — static, no backend. Edit the DATA section to use real info.
   Profile edits, read announcements, and theme are saved in the browser's localStorage. */

// ===== DATA =====
const DEFAULT_PROFILE = {
  first: "Maya", last: "Santos", id: "2024-10382", email: "maya.santos@northfield.edu",
  phone: "+63 912 345 6789", program: "BS Computer Science", year: "3rd Year", advisor: "Dr. Elena Ruiz", bio: ""
};
const COURSES = [
  { id: "cs301", code: "CS 301", name: "Algorithms", teacher: "Dr. Ruiz", credits: 4, color: "#f2b632",
    items: [["Problem Set 1", 46, 50, 10], ["Problem Set 2", 41, 50, 10], ["Midterm", 84, 100, 30]] },
  { id: "ma220", code: "MA 220", name: "Linear Algebra", teacher: "Prof. Okafor", credits: 3, color: "#7fd1b9",
    items: [["Quiz 1", 18, 20, 10], ["Quiz 2", 15, 20, 10], ["Midterm", 91, 100, 30]] },
  { id: "en210", code: "EN 210", name: "Technical Writing", teacher: "Ms. Lindqvist", credits: 2, color: "#f4a6a0",
    items: [["Essay 1", 88, 100, 20], ["Peer Review", 19, 20, 10]] },
  { id: "cs320", code: "CS 320", name: "Databases", teacher: "Dr. Tan", credits: 3, color: "#a9bcf5",
    items: [["Lab 1", 95, 100, 10], ["Lab 2", 72, 100, 10], ["Project Proposal", 27, 30, 10]] },
  { id: "pe101", code: "PE 101", name: "Fitness & Wellness", teacher: "Coach Bell", credits: 1, color: "#d9c7f2",
    items: [["Participation", 96, 100, 50]] }
];
// day: 1=Mon … 5=Fri
const SCHEDULE = [
  { c: "cs301", day: 1, s: "09:00", e: "10:30", room: "Eng 204" }, { c: "ma220", day: 1, s: "11:00", e: "12:00", room: "Sci 110" },
  { c: "cs320", day: 1, s: "14:00", e: "15:30", room: "Lab B" },
  { c: "en210", day: 2, s: "10:00", e: "11:30", room: "Hum 12" }, { c: "pe101", day: 2, s: "15:00", e: "16:00", room: "Gym" },
  { c: "cs301", day: 3, s: "09:00", e: "10:30", room: "Eng 204" }, { c: "ma220", day: 3, s: "11:00", e: "12:00", room: "Sci 110" },
  { c: "cs320", day: 4, s: "13:00", e: "14:30", room: "Lab B" }, { c: "en210", day: 4, s: "15:00", e: "16:00", room: "Hum 12" },
  { c: "ma220", day: 5, s: "09:00", e: "10:00", room: "Sci 110" }, { c: "cs301", day: 5, s: "10:30", e: "12:00", room: "Eng 204" }
];
// due = days from today, so the demo always looks current
const DEADLINES = [
  { t: "Problem Set 3", c: "cs301", due: 1 }, { t: "Linear Algebra Quiz 3", c: "ma220", due: 3 },
  { t: "Database Lab 3", c: "cs320", due: 5 }, { t: "Essay 2 Draft", c: "en210", due: 9 }
];
const ANNOUNCEMENTS = [
  { id: 1, cat: "Academics", title: "Final exam schedule posted", ago: 0, from: "Registrar", body: "The final exam timetable is now available. Check for conflicts and report them to the Registrar's office within one week." },
  { id: 2, cat: "Campus", title: "Library extends hours during exam week", ago: 1, from: "Library", body: "The main library will stay open until midnight from Monday through Friday. Quiet floors are on levels 3 and 4." },
  { id: 3, cat: "Events", title: "Career fair: 40+ employers on campus", ago: 2, from: "Career Center", body: "Bring printed resumes and register for a slot at the Career Center. Business casual recommended." },
  { id: 4, cat: "Finance", title: "Tuition payment deadline", ago: 4, from: "Bursar", body: "Second-term balances are due in 10 days. Payment plans can be set up at the Bursar's window." },
  { id: 5, cat: "Academics", title: "Course registration opens next week", ago: 6, from: "Registrar", body: "Registration windows are assigned by year level. Meet your advisor first to clear your advising hold." }
];

// ===== HELPERS =====
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem("np_" + k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem("np_" + k, JSON.stringify(v)); } catch { } }
};
const course = id => COURSES.find(c => c.id === id);
const letter = p => p >= 93 ? ["A", 4] : p >= 90 ? ["A-", 3.7] : p >= 87 ? ["B+", 3.3] : p >= 83 ? ["B", 3] : p >= 80 ? ["B-", 2.7] : p >= 77 ? ["C+", 2.3] : p >= 70 ? ["C", 2] : ["D", 1];
const pct = c => { const w = c.items.reduce((a, i) => a + i[3], 0); return c.items.reduce((a, i) => a + i[1] / i[2] * i[3], 0) / w * 100; };
const gpa = () => { const cr = COURSES.reduce((a, c) => a + c.credits, 0); return COURSES.reduce((a, c) => a + letter(pct(c))[1] * c.credits, 0) / cr; };
const fmtTime = t => { const [h, m] = t.split(":").map(Number); return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`; };
const mins = t => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const when = n => n === 0 ? "Today" : n === 1 ? "Tomorrow" : `In ${n} days`;
const toast = msg => { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toast.id); toast.id = setTimeout(() => t.classList.remove("show"), 2200); };
const profile = () => ({ ...DEFAULT_PROFILE, ...store.get("profile", {}) });
const readSet = () => new Set(store.get("read", []));
const slotHTML = x => { const c = course(x.c); return `<div class="slot" style="background:${c.color}"><b>${esc(c.name)}</b>${fmtTime(x.s)} – ${fmtTime(x.e)}<br>${esc(x.room)}</div>`; };

// ===== VIEWS =====
const views = {
  dashboard() {
    const p = profile(), now = new Date(), d = now.getDay(), cur = now.getHours() * 60 + now.getMinutes();
    const today = SCHEDULE.filter(x => x.day === d).sort((a, b) => mins(a.s) - mins(b.s));
    const hr = now.getHours(), hello = hr < 12 ? "Good morning" : hr < 18 ? "Good afternoon" : "Good evening";
    const credits = COURSES.reduce((a, c) => a + c.credits, 0);
    const latest = ANNOUNCEMENTS.slice(0, 3).map(a => `<div class="row"><div><div class="t">${esc(a.title)}</div><small>${esc(a.from)} · ${a.ago ? a.ago + "d ago" : "today"}</small></div></div>`).join("");
    return `<div class="head"><h1>${hello}, ${esc(p.first)}</h1><p>${dayName[d]}, ${now.toLocaleDateString(undefined, { month: "long", day: "numeric" })}. ${today.length ? `You have ${today.length} class${today.length > 1 ? "es" : ""} today.` : "No classes today."}</p></div>
    <div class="grid g4" style="margin-bottom:18px">
      <div class="card stat hero"><strong>${gpa().toFixed(2)}</strong><span>Current GPA</span></div>
      <div class="card stat"><strong>${credits}</strong><span>Credits this term</span></div>
      <div class="card stat"><strong>${COURSES.length}</strong><span>Active courses</span></div>
      <div class="card stat"><strong>94%</strong><span>Attendance</span><div class="bar"><i style="width:94%"></i></div></div>
    </div>
    <div class="grid g2">
      <section class="card"><h2>Today's classes</h2>${today.length ? today.map(x => { const c = course(x.c), on = cur >= mins(x.s) && cur < mins(x.e);
        return `<div class="row ${on ? "now" : ""}"><span class="dot" style="background:${c.color}"></span><div><div class="t">${esc(c.name)}</div><small>${esc(x.room)} · ${esc(c.teacher)}</small></div><div class="end">${fmtTime(x.s)}<br>${on ? '<span class="pill">In progress</span>' : `<small>${fmtTime(x.e)}</small>`}</div></div>`; }).join("") : '<p class="muted">Nothing scheduled. Check the <a href="#schedule">weekly schedule</a>.</p>'}</section>
      <section class="card"><h2>Upcoming deadlines</h2>${DEADLINES.map(x => { const c = course(x.c);
        return `<div class="row"><span class="dot" style="background:${c.color}"></span><div><div class="t">${esc(x.t)}</div><small>${esc(c.code)}</small></div><div class="end"><span class="pill ${x.due <= 1 ? "warn" : ""}">${when(x.due)}</span></div></div>`; }).join("")}</section>
      <section class="card"><h2>Latest announcements</h2>${latest}<p style="margin-top:12px"><a href="#announcements">See all announcements</a></p></section>
      <section class="card"><h2>Course standing</h2>${COURSES.map(c => { const p = pct(c);
        return `<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between"><span>${esc(c.name)}</span><b>${p.toFixed(1)}%</b></div><div class="bar"><i style="width:${p}%;background:${c.color}"></i></div></div>`; }).join("")}</section>
    </div>`;
  },

  schedule() {
    const t = new Date().getDay();
    const cols = [1, 2, 3, 4, 5].map(d => `<section class="day ${d === t ? "today" : ""}"><h3>${dayName[d]}</h3>${SCHEDULE.filter(x => x.day === d).sort((a, b) => mins(a.s) - mins(b.s)).map(slotHTML).join("") || '<p class="muted">Free day</p>'}</section>`).join("");
    const hrs = SCHEDULE.reduce((a, x) => a + (mins(x.e) - mins(x.s)) / 60, 0);
    return `<div class="head"><h1>Class schedule</h1><p>${SCHEDULE.length} sessions · ${hrs} contact hours per week</p></div><div class="week">${cols}</div>
    <section class="card" style="margin-top:22px"><h2>Courses and instructors</h2>${COURSES.map(c => `<div class="row"><span class="dot" style="background:${c.color}"></span><div><div class="t">${esc(c.code)} · ${esc(c.name)}</div><small>${esc(c.teacher)}</small></div><div class="end muted">${c.credits} credits</div></div>`).join("")}</section>`;
  },

  grades() {
    const rows = COURSES.map(c => { const p = pct(c), l = letter(p)[0];
      return `<details class="card"><summary><span class="dot" style="background:${c.color};height:40px"></span><div><h3 style="font-weight:700">${esc(c.name)}</h3><small>${esc(c.code)} · ${c.credits} credits</small></div><div class="end"><span class="grade">${l}</span><br><small>${p.toFixed(1)}%</small></div></summary>
      <table><thead><tr><th>Assessment</th><th class="num">Score</th><th class="num">Weight</th></tr></thead><tbody>${c.items.map(i => `<tr><td>${esc(i[0])}</td><td class="num">${i[1]}/${i[2]}</td><td class="num">${i[3]}%</td></tr>`).join("")}</tbody></table></details>`; }).join("");
    return `<div class="head"><h1>Grades</h1><p>Open a course to see how each assessment counts toward your grade.</p></div>
    <div class="grid g4" style="margin-bottom:18px"><div class="card stat hero"><strong>${gpa().toFixed(2)}</strong><span>Term GPA (4.0 scale)</span></div>
    <div class="card stat"><strong>${COURSES.reduce((a, c) => a + c.credits, 0)}</strong><span>Credits attempted</span></div></div><div class="grid">${rows}</div>`;
  },

  announcements() {
    return `<div class="head"><h1>Announcements</h1><p>Select an item to read it. Unread items are marked.</p></div>
    <input class="search" id="q" type="search" placeholder="Search announcements" aria-label="Search announcements">
    <div class="tabs" id="cats">${["All", "Academics", "Campus", "Events", "Finance"].map((c, i) => `<button type="button" aria-pressed="${i === 0}" data-c="${c}">${c}</button>`).join("")}</div>
    <div class="grid" id="annlist"></div>`;
  },

  profile() {
    const p = profile();
    const f = (k, label, extra = "") => `<label>${label}<input name="${k}" value="${esc(p[k])}" ${extra}></label>`;
    return `<div class="head"><h1>Student profile</h1><p>Contact details can be edited and are saved in this browser.</p></div>
    <div class="card" style="margin-bottom:18px"><div class="who"><div class="avatar">${esc(p.first[0] || "?")}${esc(p.last[0] || "")}</div><div><h2>${esc(p.first)} ${esc(p.last)}</h2><p class="muted">${esc(p.program)} · ${esc(p.year)}</p></div></div></div>
    <form class="card" id="pf">${f("first", "First name", "required")}${f("last", "Last name", "required")}${f("id", "Student ID", "readonly")}${f("program", "Program", "readonly")}${f("year", "Year level", "readonly")}${f("advisor", "Advisor", "readonly")}
      ${f("email", "Email", 'type="email" required')}${f("phone", "Phone", 'type="tel"')}
      <div style="grid-column:1/-1;display:flex;gap:10px;flex-wrap:wrap"><button class="btn primary" type="submit">Save changes</button><button class="btn" type="button" id="rs">Reset to defaults</button><button class="btn" type="button" id="th2">Switch theme</button></div></form>`;
  }
};

// ===== INTERACTIONS =====
function bindAnnouncements() {
  let cat = "All", q = "";
  const draw = () => {
    const read = readSet();
    const list = ANNOUNCEMENTS.filter(a => (cat === "All" || a.cat === cat) && (a.title + a.body).toLowerCase().includes(q));
    $("#annlist").innerHTML = list.map(a => `<article class="card ann ${read.has(a.id) ? "" : "unread"}" data-id="${a.id}" tabindex="0" role="button" aria-expanded="false">
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><h2>${esc(a.title)}</h2><span class="pill">${a.cat}</span><small class="muted" style="margin-left:auto">${a.ago ? a.ago + "d ago" : "Today"} · ${esc(a.from)}</small></div></article>`).join("") || '<p class="muted">No announcements match. Try a different search or category.</p>';
  };
  const open = el => {
    const id = +el.dataset.id, a = ANNOUNCEMENTS.find(x => x.id === id), exp = el.getAttribute("aria-expanded") === "true";
    if (exp) { el.querySelector("p")?.remove(); el.setAttribute("aria-expanded", "false"); return; }
    el.insertAdjacentHTML("beforeend", `<p>${esc(a.body)}</p>`); el.setAttribute("aria-expanded", "true");
    const r = readSet(); r.add(id); store.set("read", [...r]); el.classList.remove("unread"); badge();
  };
  $("#q").oninput = e => { q = e.target.value.toLowerCase(); draw(); };
  $("#cats").onclick = e => { const b = e.target.closest("button"); if (!b) return; cat = b.dataset.c;
    document.querySelectorAll("#cats button").forEach(x => x.setAttribute("aria-pressed", x === b)); draw(); };
  $("#annlist").onclick = e => { const a = e.target.closest(".ann"); if (a) open(a); };
  $("#annlist").onkeydown = e => { if (e.key === "Enter" || e.key === " ") { const a = e.target.closest(".ann"); if (a) { e.preventDefault(); open(a); } } };
  draw();
}
function bindProfile() {
  $("#pf").onsubmit = e => { e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target)); store.set("profile", { first: d.first.trim(), last: d.last.trim(), email: d.email.trim(), phone: d.phone.trim() });
    toast("Profile saved"); render(); };
  $("#rs").onclick = () => { store.set("profile", {}); toast("Profile reset"); render(); };
  $("#th2").onclick = toggleTheme;
}
function badge() { const n = ANNOUNCEMENTS.filter(a => !readSet().has(a.id)).length, b = $("#unread"); b.hidden = !n; b.textContent = n; }
function toggleTheme() { const t = document.documentElement.dataset.theme === "dark" ? "light" : "dark"; document.documentElement.dataset.theme = t; store.set("theme", t); }

function render() {
  const v = (location.hash.slice(1) in views) ? location.hash.slice(1) : "dashboard";
  $("#main").innerHTML = views[v]();
  document.querySelectorAll("#nav a").forEach(a => { a.classList.toggle("on", a.dataset.v === v); a.toggleAttribute("aria-current", a.dataset.v === v); });
  if (v === "announcements") bindAnnouncements();
  if (v === "profile") bindProfile();
  document.title = v[0].toUpperCase() + v.slice(1) + " · Northfield Student Portal";
  window.scrollTo(0, 0);
}

document.documentElement.dataset.theme = store.get("theme", matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
$("#theme").onclick = toggleTheme;
addEventListener("hashchange", render);
badge(); render();
