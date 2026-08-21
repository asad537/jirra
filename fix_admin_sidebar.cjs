const fs = require('fs');

let content = fs.readFileSync('components/dashboards/AdminDashboard.tsx', 'utf8');

content = content.replace(
  /<Avatar id="AK" \/>\s*<\/button>\s*<span>\s*<b>Ahmed Khan<\/b>\s*<small>Super Admin<\/small>\s*<\/span>/,
  `<Avatar id={myInitials} />
            </button>
            <span>
              <b>{user.name}</b>
              <small>{user.role.replace("_", " ")}</small>
            </span>`
);

fs.writeFileSync('components/dashboards/AdminDashboard.tsx', content);
console.log("Admin sidebar fixed");
