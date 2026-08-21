const fs = require('fs');

let content = fs.readFileSync('components/dashboards/UserDashboard.tsx', 'utf8');

// 1. Remove + New ticket button
content = content.replace(/<button className="create"[^>]*>[\s\S]*?<\/button>/, '');

// 2. Remove Projects + button
content = content.replace(/<small>\s*Projects <button[^>]*>＋<\/button>\s*<\/small>/, '<small>Projects</small>');

// 3. Remove User Management and Settings links
content = content.replace(/<a onClick=\{[^\}]*\}>♛ User Management<\/a>/, '');
content = content.replace(/<a onClick=\{[^\}]*\}>⚙ Settings<\/a>/, '');

// 4. Remove Invite and ... buttons in project-members
content = content.replace(/<button onClick=\{[^}]*\}\>♙ Invite<\/button>\s*<button onClick=\{[^}]*\}\>•••<\/button>/, '');

// 5. Remove Project settings text-btn
content = content.replace(/<button className="text-btn"[^>]*>\s*⚙ Project settings\s*<\/button>/, '');

// 6. Remove add-list-wrapper
content = content.replace(/<div className="add-list-wrapper">[\s\S]*?<\/div>/, '');

// 7. Remove + Add issue inside lists
content = content.replace(/<button\s*className="add-card"\s*onClick=\{[^}]*\}\s*>\s*＋ Add issue\s*<\/button>/g, '');

fs.writeFileSync('components/dashboards/UserDashboard.tsx', content);
console.log("Stripped UserDashboard.tsx");
