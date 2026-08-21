const fs = require('fs');

const files = [
  { path: 'components/dashboards/ManagerDashboard.tsx', title: 'Manager Profile' },
  { path: 'components/dashboards/UserDashboard.tsx', title: 'User Profile' }
];

for (const file of files) {
  let content = fs.readFileSync(file.path, 'utf8');

  // Fix sidebar
  content = content.replace(
    /<Avatar id="AK" \/>\s*<\/button>\s*<span>\s*<b>Ahmed Khan<\/b>\s*<small>Super Admin<\/small>\s*<\/span>/,
    `<Avatar id={myInitials} />
            </button>
            <span>
              <b>{user.name}</b>
              <small>{user.role.replace("_", " ")}</small>
            </span>`
  );

  // Fix modal panel title and avatar
  content = content.replace(
    /<h2>Super Admin Console<\/h2>\s*<div className="admin-user">\s*<Avatar id="AK" \/>/,
    `<h2>${file.title}</h2>
                <div className="admin-user">
                  <Avatar id={myInitials} />`
  );

  // Remove the entire "User management" section from Manager and User dashboard modals
  // They shouldn't be able to manage users anyway.
  content = content.replace(
    /<h3 className="panel-section">User management<\/h3>[\s\S]*?<button\s*className="panel-primary"\s*onClick=\{\(\) => setPanel\("invite"\)\}\s*>\s*＋ Add user\s*<\/button>/,
    ''
  );

  fs.writeFileSync(file.path, content);
}

console.log("Profiles fixed");
