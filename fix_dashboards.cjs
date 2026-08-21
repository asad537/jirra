const fs = require('fs');

const files = [
  'components/dashboards/AdminDashboard.tsx',
  'components/dashboards/ManagerDashboard.tsx',
  'components/dashboards/UserDashboard.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Remove login function
  content = content.replace(/const login = async \([\s\S]*?loadUser\(\);\n  \};/m, '');

  // Remove the authLoading set in loadUser if it's there
  content = content.replace(/setAuthLoading\(false\);/g, '');

  // Remove the two if statements at the bottom
  content = content.replace(/if \(authLoading && !user\) return [\s\S]*?<\/div>;\n/g, '');
  content = content.replace(/if \(!user\) return [\s\S]*?<\/div>;\n/g, '');

  fs.writeFileSync(file, content);
}
console.log("Fixed dashboards");
