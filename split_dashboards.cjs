const fs = require('fs');
const path = require('path');

function processFile(filePath, componentName) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace export default function Home() with export default function DashboardName({ user, setUser }: any)
  content = content.replace('export default function Home() {', `export default function ${componentName}({ user, setUser }: { user: any, setUser: any }) {`);
  
  // Remove local user state and auth loading state
  content = content.replace(/\[user,\s*setUser\].*?\n/g, '');
  content = content.replace(/\[authLoading,\s*setAuthLoading\].*?\n/g, '');
  content = content.replace(/\[loginEmail,\s*setLoginEmail\].*?\n/g, '');
  content = content.replace(/\[loginPassword,\s*setLoginPassword\].*?\n/g, '');
  content = content.replace(/\[loginError,\s*setLoginError\].*?\n/g, '');
  
  // Remove loadUser and login logic
  content = content.replace(/const loadUser = async \(\) => {[\s\S]*?loadUser\(\);\n  }, \[\]\);/m, '');
  content = content.replace(/const handleLogin = async \(\) => {[\s\S]*?setLoginError\(false\);\n    }\n  };/m, '');
  
  // Remove authLoading and user check from the return statement
  // Current pattern: return authLoading ? (...) : !user ? (...) : ( <div className="app"> ... )
  content = content.replace(/return authLoading \? \(.*?\) : !user \? \(.*?\) : \(/ms, 'return (');
  // There is a closing parenthesis at the very end of the component return.
  
  fs.writeFileSync(filePath, content);
}

processFile('./components/dashboards/AdminDashboard.tsx', 'AdminDashboard');
processFile('./components/dashboards/ManagerDashboard.tsx', 'ManagerDashboard');
processFile('./components/dashboards/UserDashboard.tsx', 'UserDashboard');

console.log("Files processed");
