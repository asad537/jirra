const fs = require('fs');

let content = fs.readFileSync('components/dashboards/UserDashboard.tsx', 'utf8');

// 1. Remove Users button
content = content.replace(/\{user\.role === "super_admin" && <button className=\{view === "Users" \? "on" : ""\} onClick=\{.*?♛ Users<\/button>\}/, '');

// 2. Remove Settings button
content = content.replace(/<button className=\{view === "Settings" \? "on" : ""\} onClick=\{\(\) => setView\("Settings"\)\}>.*?<\/button>/s, '');

// 3. Remove Users view rendering
content = content.replace(/\{view === "Users" \? \([\s\S]*?\) : view === "Settings" \? \(/, '{view === "Settings" ? (');

// 4. Remove Settings view rendering
content = content.replace(/\{view === "Settings" \? \([\s\S]*?\) : view === "Board" \? \(/, '{view === "Board" ? (');

// 5. Remove New ticket buttons
// In board view
content = content.replace(/<button className="add" onClick=\{\(\) => setModal\(true\)\}>[\s\S]*?＋ Add ticket[\s\S]*?<\/button>/g, '');
// In header
content = content.replace(/<button className="primary" onClick=\{\(\) => setModal\(true\)\}>[\s\S]*?＋ New ticket[\s\S]*?<\/button>/g, '');

// 6. Remove ticket reassignment dropdowns
// Board view: replace `<span ... title="Reassign ticket" ...><i ...>{t.who}</i><select ...>...</select></span>`
content = content.replace(/<span onClick=\{\(e\) => e\.stopPropagation\(\)\} title="Reassign ticket" className="avatar-select-wrapper">[\s\S]*?<\/span>/g, '<Avatar id={t.who} />');
content = content.replace(/<span onClick=\{\(e\) => e\.stopPropagation\(\)\} title="Reassign ticket" style=\{\{ position: 'relative'.*?<\/span>/gs, '<Avatar id={t.who} />');

// List view: replace `<span onClick={(e) => e.stopPropagation()}><select ...>...</select></span>`
content = content.replace(/<span onClick=\{\(e\) => e\.stopPropagation\(\)\}>\s*<select[\s\S]*?<\/select>\s*<\/span>/g, '<span>{teamMembers.find((m)=>m.initials===t.who)?.name || t.who}</span>');

// Details panel: replace `<select value=... onChange={... changeAssignee ...}>...</select>`
content = content.replace(/<select value=\{teamMembers\.find\(m=>m\.initials===selected\.who\)\?\.id\??""\} onChange=\{\(e\)=>void changeAssignee[\s\S]*?<\/select>/, '<span style={{ fontWeight: "bold", padding: "4px 8px", background: "#f0f0f0", borderRadius: "4px" }}>{teamMembers.find(m=>m.initials===selected.who)?.name || selected.who}</span>');

// 7. Make "My tickets" active by default
content = content.replace(/const \[assigneeFilter, setAssigneeFilter\] = useState\("All assignees"\),/g, 'const [assigneeFilter, setAssigneeFilter] = useState("All assignees"),');
content = content.replace(/<select value=\{assigneeFilter\} onChange=\{\(e\) => setAssigneeFilter\(e\.target\.value\)\}>[\s\S]*?<\/select>/, '');

fs.writeFileSync('components/dashboards/UserDashboard.tsx', content);
console.log("UserDashboard modified successfully.");
