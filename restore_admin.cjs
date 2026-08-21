const fs = require('fs');

function restoreAdminDashboard() {
  let content = fs.readFileSync('components/dashboards/AdminDashboard.tsx', 'utf8');
  
  content = content.replace('export default function Home() {', `export default function AdminDashboard({ user, setUser }: { user: any, setUser: any }) {`);
  
  content = content.replace(/const \[user, setUser\] = useState.*?\n/g, '');
  content = content.replace(/const \[authLoading, setAuthLoading\].*?\n/g, '');
  content = content.replace(/const \[loginEmail, setLoginEmail\].*?\n/g, '');
  content = content.replace(/const \[loginPassword, setLoginPassword\].*?\n/g, '');
  content = content.replace(/const \[loginError, setLoginError\].*?\n/g, '');
  
  // The original app/page.tsx didn't have loadUser or handleLogin. It had a login function.
  content = content.replace(/const login = async[\s\S]*?finally \{  \}\n  };\n/m, '');
  
  // The original authLoading check
  content = content.replace(/if \(authLoading && !user\) return <div[^>]*>.*?<\/div>;\n/m, '');
  content = content.replace(/if \(!user\) return \([\s\S]*?\);\n/m, '');
  
  fs.writeFileSync('components/dashboards/AdminDashboard.tsx', content);
}
restoreAdminDashboard();
console.log("Restored AdminDashboard");
