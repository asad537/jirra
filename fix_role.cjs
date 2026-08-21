const fs = require('fs');

const files = [
  'components/dashboards/AdminDashboard.tsx',
  'components/dashboards/ManagerDashboard.tsx',
  'components/dashboards/UserDashboard.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Fix user.role.replace
  content = content.replace(
    /\{user\.role\.replace\("_", " "\)\}/g,
    '{user?.role ? user.role.replace("_", " ") : "User"}'
  );

  fs.writeFileSync(file, content);
}
console.log("Fixed user role rendering");
