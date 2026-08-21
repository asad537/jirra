const fs = require('fs');

let content = fs.readFileSync('components/dashboards/ManagerDashboard.tsx', 'utf8');

// Remove ♛ Users button
content = content.replace(/\{user\.role === "super_admin" && <button className=\{view === "Users" \? "on" : ""\} onClick=\{.*?♛ Users<\/button>\}/, '');

// Remove ⚙ Project settings button
content = content.replace(/<button className=\{view === "Settings" \? "on" : ""\} onClick=\{\(\) => setView\("Settings"\)\}>.*?<\/button>/s, '');

// Remove Users view rendering entirely
content = content.replace(/\{view === "Users" \? \([\s\S]*?\) : view === "Settings" \? \(/, '{view === "Settings" ? (');

// Remove Settings view rendering entirely
content = content.replace(/\{view === "Settings" \? \([\s\S]*?\) : view === "Board" \? \(/, '{view === "Board" ? (');

fs.writeFileSync('components/dashboards/ManagerDashboard.tsx', content);
