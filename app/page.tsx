"use client";
import { useEffect, useMemo, useState } from "react";
const apiPath = (path: string) =>
  typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? `http://localhost:4001${path}`
    : path;
const apiFetch = (path: string, init: RequestInit = {}) =>
  fetch(apiPath(path), { ...init, credentials: "include" });
type Status = "To Do" | "In Progress" | "In Review" | "Done";
type P = "Low" | "Medium" | "High" | "Urgent";
type Project = {
  key: string;
  name: string;
  description: string;
  color: string;
  status: string;
};
type Ticket = {
  id: string;
  title: string;
  type: string;
  priority: P;
  status: Status;
  who: string;
  due?: string;
  comments: number;
  tag: string;
};
type Activity = {
  id: number;
  kind: "comment" | "status" | "created";
  author: string;
  text: string;
  time: string;
  from?: Status;
  to?: Status;
};
const people: { [k: string]: [string, string] } = {
  AK: ["Ahmed Khan", "#ed9276"],
  ZM: ["Zara Malik", "#8576df"],
  SR: ["Saad Raza", "#4fa68c"],
  HN: ["Hira Noor", "#db6586"],
};
const seed: Ticket[] = [
  {
    id: "PF-124",
    title: "Invoice PDF alignment breaks on mobile",
    type: "Bug",
    priority: "Urgent",
    status: "To Do",
    who: "AK",
    due: "Today",
    comments: 5,
    tag: "Mobile",
  },
  {
    id: "PF-118",
    title: "Add bulk print option to orders",
    type: "Feature",
    priority: "High",
    status: "To Do",
    who: "ZM",
    due: "Aug 24",
    comments: 2,
    tag: "Orders",
  },
  {
    id: "PF-121",
    title: "Improve customer search speed",
    type: "Improvement",
    priority: "Medium",
    status: "To Do",
    who: "SR",
    due: "Aug 28",
    comments: 1,
    tag: "Performance",
  },
  {
    id: "PF-119",
    title: "Payment status not syncing",
    type: "Bug",
    priority: "Urgent",
    status: "In Progress",
    who: "HN",
    due: "Today",
    comments: 8,
    tag: "Payments",
  },
  {
    id: "PF-116",
    title: "Redesign order detail header",
    type: "Task",
    priority: "High",
    status: "In Progress",
    who: "AK",
    due: "Aug 23",
    comments: 3,
    tag: "UI",
  },
  {
    id: "PF-112",
    title: "Add CSV import validation",
    type: "Feature",
    priority: "Medium",
    status: "In Review",
    who: "ZM",
    due: "Aug 25",
    comments: 4,
    tag: "Import",
  },
  {
    id: "PF-109",
    title: "Update product tax calculations",
    type: "Bug",
    priority: "High",
    status: "In Review",
    who: "SR",
    due: "Aug 22",
    comments: 6,
    tag: "Billing",
  },
  {
    id: "PF-104",
    title: "Add keyboard shortcuts",
    type: "Improvement",
    priority: "Low",
    status: "Done",
    who: "HN",
    comments: 2,
    tag: "UX",
  },
  {
    id: "PF-101",
    title: "Migrate customer notes",
    type: "Task",
    priority: "Medium",
    status: "Done",
    who: "AK",
    comments: 1,
    tag: "Data",
  },
];
const cols: Status[] = ["To Do", "In Progress", "In Review", "Done"];
const initialProjects: Project[] = [
  {
    key: "PF",
    name: "PrintFlow",
    description: "Order, billing and production management",
    color: "#ed9276",
    status: "active",
  },
  {
    key: "HD",
    name: "HelpDesk",
    description: "Customer support and service requests",
    color: "#62a4cb",
    status: "active",
  },
  {
    key: "WB",
    name: "Website Build",
    description: "Website design and development",
    color: "#55a987",
    status: "active",
  },
];
const Avatar = ({ id }: { id: string }) => (
  <i className="avatar" style={{ background: people[id]?.[1] }}>
    {id}
  </i>
);
const starterActivity: { [key: string]: Activity[] } = {
  "PF-124": [
    {
      id: 1,
      kind: "comment",
      author: "ZM",
      text: "Issue reproduced on iPhone 15. PDF preview looks fine, exported file shifts the totals.",
      time: "35 minutes ago",
    },
    {
      id: 2,
      kind: "status",
      author: "AK",
      text: "Moved this ticket",
      from: "In Progress",
      to: "To Do",
      time: "2 hours ago",
    },
  ],
  "PF-119": [
    {
      id: 3,
      kind: "comment",
      author: "HN",
      text: "Webhook retry is now running in staging. Monitoring the next payment batch.",
      time: "1 hour ago",
    },
  ],
};
export default function Home() {
  const [tickets, setTickets] = useState(seed),
    [query, setQuery] = useState(""),
    [statusFilter, setStatusFilter] = useState("All tickets"),
    [assigneeFilter, setAssigneeFilter] = useState("All assignees"),
    [typeFilter, setTypeFilter] = useState("All types"),
    [priorityFilter, setPriorityFilter] = useState("All priorities"),
    [view, setView] = useState<"Board" | "List" | "Reports" | "Users">("Board"),
    [modal, setModal] = useState(false),
    [selected, setSelected] = useState<Ticket | null>(null),
    [drag, setDrag] = useState(""),
    [title, setTitle] = useState(""),
    [newType, setNewType] = useState("Task"),
    [newPriority, setNewPriority] = useState("Medium"),
    [newDescription, setNewDescription] = useState(""),
    [newAssigneeId, setNewAssigneeId] = useState<number | null>(null),
    [teamMembers, setTeamMembers] = useState<Array<{id:number;name:string;email:string;color:string;initials:string}>>([]),
    [projects, setProjects] = useState<Project[]>(initialProjects),
    [activeProject, setActiveProject] = useState<Project>(initialProjects[0]),
    [projectName, setProjectName] = useState(""),
    [projectKey, setProjectKey] = useState(""),
    [projectDescription, setProjectDescription] = useState(""),
    [activities, setActivities] = useState(starterActivity),
    [comment, setComment] = useState(""),
    [pending, setPending] = useState<{
      id: string;
      from: Status;
      to: Status;
    } | null>(null),
    [statusComment, setStatusComment] = useState(""),
    [panel, setPanel] = useState<
      | null
      | "invite"
      | "notifications"
      | "settings"
      | "help"
      | "projects"
      | "admin"
      | "actions"
    >(null),
    [notice, setNotice] = useState(""),
    [syncing, setSyncing] = useState(true),
    [dataError, setDataError] = useState(""),
    [user, setUser] = useState<{id:number;name:string;email:string;role:string}|null>(null),
    [authLoading, setAuthLoading] = useState(true),
    [loginEmail, setLoginEmail] = useState("admin@jirra.local"),
    [loginPassword, setLoginPassword] = useState(""),
    [loginError, setLoginError] = useState(""),
    [adminUsers, setAdminUsers] = useState<Array<{id:number;name:string;email:string;role:string;active:number}>>([]),
    [inviteName, setInviteName] = useState(""),
    [inviteEmail, setInviteEmail] = useState(""),
    [invitePassword, setInvitePassword] = useState(""),
    [inviteRole, setInviteRole] = useState("user"),
    [workspaceSettings, setWorkspaceSettings] = useState({workspaceName:"TaskFlow",allowInvites:true,emailNotifications:true,defaultView:"Board"});
  const shown = useMemo(
    () =>
      tickets.filter(
        (t) =>
          `${t.id} ${t.title} ${t.tag}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (statusFilter === "All tickets" || t.status === statusFilter) &&
          (assigneeFilter === "All assignees" || t.who === assigneeFilter) &&
          (typeFilter === "All types" || t.type === typeFilter) &&
          (priorityFilter === "All priorities" ||
            t.priority === priorityFilter),
      ),
    [tickets, query, statusFilter, assigneeFilter, typeFilter, priorityFilter],
  );
  const clearFilters = () => {
    setStatusFilter("All tickets");
    setAssigneeFilter("All assignees");
    setTypeFilter("All types");
    setPriorityFilter("All priorities");
  };
  const activeFilters = [
    statusFilter !== "All tickets",
    assigneeFilter !== "All assignees",
    typeFilter !== "All types",
    priorityFilter !== "All priorities",
  ].filter(Boolean).length;
  const flash = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  };
  const loadProjects = async () => {
    try {
      const r = await apiFetch("/api/projects", { cache: "no-store" }),
        d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setProjects(d.projects);
    } catch (e) {
      setDataError(e instanceof Error ? e.message : "Unable to load projects");
    }
  };
  const loadMembers = async () => {
    const response = await apiFetch("/api/members", { cache: "no-store" });
    if (response.ok) { const data=await response.json(); setTeamMembers(data.members); setNewAssigneeId((current)=>current??data.members[0]?.id??null); }
  };
  const loadData = async (key = activeProject.key) => {
    try {
      const response = await apiFetch(
        `/api/tickets?project=${encodeURIComponent(key)}`,
        { cache: "no-store" },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load tickets");
      const grouped: { [key: string]: Activity[] } = {};
      for (const a of data.activities as Array<{
        id: number;
        ticketId: string;
        kind: Activity["kind"];
        authorName: string;
        body: string;
        fromStatus?: Status;
        toStatus?: Status;
        createdAt: string;
      }>) {
        const initials =
          Object.entries(people).find(([, p]) =>
            a.authorName
              .toLowerCase()
              .includes(p[0].split(" ")[0].toLowerCase()),
          )?.[0] || "AK";
        (grouped[a.ticketId] ||= []).push({
          id: a.id,
          kind: a.kind,
          author: initials,
          text: a.body,
          time: new Date(a.createdAt.replace(" ", "T") + "Z").toLocaleString(),
          from: a.fromStatus,
          to: a.toStatus,
        });
      }
      const rows = (
        data.tickets as Array<{
          id: string;
          title: string;
          type: string;
          priority: P;
          status: Status;
          assignee: string;
          dueDate?: string;
          label: string;
        }>
      ).map((t) => ({
        id: t.id,
        title: t.title,
        type: t.type,
        priority: t.priority,
        status: t.status,
        who: t.assignee,
        due: t.dueDate || undefined,
        comments: (grouped[t.id] || []).filter((a) => a.kind === "comment")
          .length,
        tag: t.label,
      }));
      setTickets(rows);
      setActivities(grouped);
      setDataError("");
    } catch (e) {
      setDataError(e instanceof Error ? e.message : "Unable to load data");
    } finally {
      setSyncing(false);
    }
  };
  useEffect(() => {
    void (async () => {
      try {
        const response = await apiFetch("/api/auth/me", { cache: "no-store" });
        const data = await response.json();
        if (response.ok) {
          setUser(data.user);
          await loadProjects();
          await loadMembers();
          await loadData("PF");
        }
      } finally { setAuthLoading(false); }
    })();
    const keys = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        document.querySelector<HTMLInputElement>(".search input")?.focus();
      }
      if (
        e.key.toLowerCase() === "c" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          (e.target as HTMLElement).tagName,
        )
      )
        setModal(true);
      if (e.key === "Escape") {
        setPanel(null);
        setSelected(null);
        setModal(false);
        setPending(null);
      }
    };
    window.addEventListener("keydown", keys);
    return () => window.removeEventListener("keydown", keys);
  }, []);
  const switchProject = async (project: Project) => {
    setActiveProject(project);
    setSelected(null);
    clearFilters();
    setSyncing(true);
    await loadData(project.key);
    flash(`${project.name} board opened`);
  };
  const createProject = async () => {
    setSyncing(true);
    try {
      const r = await apiFetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: projectName,
            key: projectKey,
            description: projectDescription,
          }),
        }),
        d = await r.json();
      if (!r.ok) throw new Error(d.error || "Unable to create project");
      setProjectName("");
      setProjectKey("");
      setProjectDescription("");
      setPanel(null);
      await loadProjects();
      await switchProject(d.project);
    } catch (e) {
      flash(e instanceof Error ? e.message : "Unable to create project");
      setSyncing(false);
    }
  };
  const loadAdmin = async () => {
    const [usersResponse, settingsResponse] = await Promise.all([apiFetch("/api/users"), apiFetch("/api/settings")]);
    if (usersResponse.ok) setAdminUsers((await usersResponse.json()).users);
    if (settingsResponse.ok) setWorkspaceSettings((await settingsResponse.json()).settings);
  };
  const addUser = async () => {
    try {
      const response = await apiFetch("/api/users", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({name:inviteName,email:inviteEmail,password:invitePassword,role:inviteRole}) });
      const data=await response.json(); if(!response.ok) throw new Error(data.error);
      setInviteName(""); setInviteEmail(""); setInvitePassword(""); await loadAdmin(); setPanel("admin"); flash("User added successfully");
    } catch(error) { flash(error instanceof Error ? error.message : "Unable to add user"); }
  };
  const saveSettings = async () => {
    try {
      const response=await apiFetch("/api/settings", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify(workspaceSettings) });
      const data=await response.json(); if(!response.ok) throw new Error(data.error);
      setWorkspaceSettings(data.settings); setPanel(null); flash("Workspace settings saved in MySQL");
    } catch(error) { flash(error instanceof Error ? error.message : "Unable to save settings"); }
  };
  const requestMove = (id: string, to: Status) => {
    const t = tickets.find((x) => x.id === id);
    if (t && t.status !== to) setPending({ id, from: t.status, to });
  };
  const confirmMove = async () => {
    if (!pending) return;
    setSyncing(true);
    try {
      const response = await apiFetch("/api/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: pending.id,
          status: pending.to,
          comment: statusComment,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Update failed");
      setPending(null);
      setStatusComment("");
      setDrag("");
      await loadData(activeProject.key);
      if (selected?.id === pending.id)
        setSelected((s) => (s ? { ...s, status: pending.to } : s));
      flash("Ticket status saved");
    } catch (e) {
      flash(e instanceof Error ? e.message : "Update failed");
      setSyncing(false);
    }
  };
  const addComment = async () => {
    if (!selected || !comment.trim()) return;
    setSyncing(true);
    try {
      const response = await apiFetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: selected.id, body: comment }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Comment failed");
      setComment("");
      await loadData(activeProject.key);
      setSelected((s) => (s ? { ...s, comments: s.comments + 1 } : s));
      flash("Comment saved");
    } catch (e) {
      flash(e instanceof Error ? e.message : "Comment failed");
      setSyncing(false);
    }
  };
  const changeAssignee = async (ticketId: string, assigneeId: number) => {
    setSyncing(true);
    try {
      const response=await apiFetch("/api/tickets",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:ticketId,assigneeId})});
      const data=await response.json(); if(!response.ok)throw new Error(data.error||"Assignment failed");
      await loadData(activeProject.key);
      const member=teamMembers.find(m=>m.id===assigneeId); if(member)setSelected(s=>s?{...s,who:member.initials}:s);
      flash(`Assigned to ${member?.name||"team member"}`);
    } catch(error){flash(error instanceof Error?error.message:"Assignment failed");setSyncing(false);}
  };
  const create = async () => {
    if (!title.trim()) return;
    setSyncing(true);
    try {
      const response = await apiFetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          type: newType,
          priority: newPriority,
          description: newDescription,
          assignee: "AK",
          assigneeId: newAssigneeId,
          projectKey: activeProject.key,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Create failed");
      setTitle("");
      setNewDescription("");
      setModal(false);
      await loadData(activeProject.key);
      flash(`${data.ticket.id} created`);
    } catch (e) {
      flash(e instanceof Error ? e.message : "Create failed");
      setSyncing(false);
    }
  };
  const login = async (event: React.FormEvent) => {
    event.preventDefault(); setLoginError(""); setAuthLoading(true);
    try {
      const response = await apiFetch("/api/auth/login", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email:loginEmail,password:loginPassword}) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");
      setUser(data.user); await loadProjects(); await loadMembers(); await loadData("PF");
    } catch (error) { setLoginError(error instanceof Error ? error.message : "Login failed"); }
    finally { setAuthLoading(false); }
  };
  if (authLoading && !user) return <div className="auth-page"><div className="auth-card"><div className="auth-logo">T</div><h1>TaskFlow</h1><p>Connecting to your local MySQL workspace…</p></div></div>;
  if (!user) return <div className="auth-page"><form className="auth-card" onSubmit={login}><div className="auth-logo">T</div><h1>Welcome back</h1><p>Sign in to manage projects, tickets and your team.</p><label>Email<input type="email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} required /></label><label>Password<input type="password" value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} autoFocus required /></label>{loginError&&<div className="auth-error">{loginError}</div>}<button className="panel-primary" disabled={authLoading}>Sign in</button><small>Local XAMPP · MySQL secured session</small></form></div>;
  return (
    <main>
      <aside>
        <div className="brand">
          <b>T</b>
          <strong>TaskFlow</strong>
        </div>
        <button className="create" onClick={() => setModal(true)}>
          ＋ <span>New ticket</span>
          <kbd>C</kbd>
        </button>
        <nav>
          <small>Workspace</small>
          <a
            onClick={() => {
              clearFilters();
              flash(`Showing all ${activeProject.name} tickets`);
            }}
          >
            ⌂ <span>My projects</span>
          </a>
          <a
            onClick={() => {
              setAssigneeFilter("AK");
              flash("Showing tickets assigned to you");
            }}
          >
            ✓ <span>My tickets</span>
            <em>8</em>
          </a>
          <a onClick={() => setPanel("notifications")}>
            ♧ <span>Notifications</span>
            <em className="red">3</em>
          </a>
          <small>
            Projects <button onClick={() => setPanel("projects")}>＋</button>
          </small>
          {projects.map((project) => (
            <a
              key={project.key}
              className={activeProject.key === project.key ? "active" : ""}
              onClick={() => switchProject(project)}
            >
              <b className="badge" style={{ background: project.color }}>
                {project.key}
              </b>
              <span>{project.name}</span>
            </a>
          ))}
        </nav>
        <div className="aside-bottom">
          <a onClick={() => setView("Reports")}>▥ Reports</a>
          <a onClick={() => { setView("Users"); setPanel(null); void loadAdmin(); }}>♛ User Management</a>
          <a onClick={() => { setPanel("settings"); void loadAdmin(); }}>⚙ Settings</a>
          <div className="profile">
            <button
              className="profile-trigger"
              onClick={() => setPanel("admin")}
            >
              <Avatar id="AK" />
            </button>
            <span>
              <b>Ahmed Khan</b>
              <small>Super Admin</small>
            </span>
          </div>
        </div>
      </aside>
      <section className="workspace">
        <header>
          <div className="search">
            ⌕{" "}
            <input
              placeholder="Search tickets..."
              aria-label="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <kbd>⌘ K</kbd>
          </div>
          <div className="account">
            <button onClick={() => setPanel("help")}>?</button>
            <button onClick={() => setPanel("notifications")}>
              ♧<em>3</em>
            </button>
            <button
              className="profile-trigger"
              onClick={() => setPanel("admin")}
            >
              <Avatar id="AK" />
            </button>
          </div>
        </header>
        <div className="content">
          {dataError && (
            <div className="data-banner error">
              <span>Database connection failed: {dataError}</span>
              <button onClick={loadData}>Retry</button>
            </div>
          )}
          {syncing && (
            <div className="sync-indicator">
              <i /> Saving and syncing…
            </div>
          )}
          <div className="project">
            <div>
              <p>Projects　/　{activeProject.name}</p>
              <h1>{activeProject.name}</h1>
              <small>
                {activeProject.description || "No project description"}
              </small>
            </div>
            <div className="project-actions">
              <span className="stack">
                {Object.keys(people).map((x) => (
                  <Avatar id={x} key={x} />
                ))}
              </span>
              <button onClick={() => setPanel("invite")}>♙ Invite</button>
              <button onClick={() => setPanel("actions")}>•••</button>
            </div>
          </div>
          <div className="tabs">
            <button
              className={view === "Board" ? "on" : ""}
              onClick={() => setView("Board")}
            >
              ▦ Board
            </button>
            <button
              className={view === "List" ? "on" : ""}
              onClick={() => setView("List")}
            >
              ☷ List
            </button>
            <button
              className={view === "Reports" ? "on" : ""}
              onClick={() => setView("Reports")}
            >
              ◫ Reports
            </button>
            {user.role === "super_admin" && <button className={view === "Users" ? "on" : ""} onClick={() => { setView("Users"); void loadAdmin(); }}>♛ Users</button>}
            <span />
            <button onClick={() => setPanel("settings")}>
              ⚙ Project settings
            </button>
          </div>
          {view !== "Users" && <div className="tools">
            <div>
              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All tickets</option>
                {cols.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
              <select
                aria-label="Filter by assignee"
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
              >
                <option>All assignees</option>
                {Object.entries(people).map(([id, p]) => (
                  <option value={id} key={id}>
                    ♙ {p[0]}
                  </option>
                ))}
              </select>
              <select
                aria-label="Filter by type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option>All types</option>
                {["Task", "Bug", "Feature", "Improvement"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
              <select
                aria-label="Filter by priority"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option>All priorities</option>
                {["Urgent", "High", "Medium", "Low"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
              <button
                className={
                  activeFilters ? "clear-filter active" : "clear-filter"
                }
                onClick={clearFilters}
                disabled={!activeFilters}
              >
                × Clear {activeFilters ? `(${activeFilters})` : ""}
              </button>
            </div>
            <button
              className="mini-stack"
              onClick={() =>
                setAssigneeFilter(
                  assigneeFilter === "All assignees" ? "AK" : "All assignees",
                )
              }
            >
              <Avatar id="AK" />
              <Avatar id="ZM" />
              <Avatar id="SR" />
            </button>
          </div>}
          {view === "Users" ? (
            <div className="users-page">
              <div className="users-heading"><div><small>ADMINISTRATION</small><h2>User management</h2><p>Accounts, system roles and access status ek hi jagah manage karein.</p></div><button className="primary" onClick={()=>setPanel("invite")}>＋ Add user</button></div>
              <div className="user-stats">
                <div><small>Total users</small><b>{adminUsers.length}</b></div>
                <div><small>Active</small><b>{adminUsers.filter(x=>x.active).length}</b></div>
                <div><small>Disabled</small><b>{adminUsers.filter(x=>!x.active).length}</b></div>
                <div><small>Managers</small><b>{adminUsers.filter(x=>x.role==="manager").length}</b></div>
              </div>
              <section className="role-guide"><b>3 roles</b><span><strong>Admin</strong> — users, settings aur tamam projects.</span><span><strong>Manager</strong> — projects, tickets aur assignments.</span><span><strong>User</strong> — assigned tickets par kaam.</span></section>
              <div className="users-table">
                <div className="user-row user-head"><span>User</span><span>System role</span><span>Status</span><span>Actions</span></div>
                {adminUsers.map(member=><div className="user-row" key={member.id}>
                  <span className="user-identity"><i className="avatar" style={{background:"#6052d7"}}>{member.name.split(/\s+/).map(x=>x[0]).join("").slice(0,2)}</i><i><b>{member.name}</b><small>{member.email}</small></i></span>
                  <span><select value={member.role} disabled={member.id===user.id} onChange={async e=>{await apiFetch(`/api/users/${member.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({role:e.target.value,active:Boolean(member.active)})});await loadAdmin();flash("User role updated");}}><option value="user">User</option><option value="manager">Manager</option><option value="super_admin">Admin</option></select></span>
                  <span><em className={member.active?"status-active":"status-disabled"}>{member.active?"Active":"Disabled"}</em></span>
                  <span><button disabled={member.id===user.id} onClick={async()=>{await apiFetch(`/api/users/${member.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({role:member.role,active:!member.active})});await loadAdmin();flash(member.active?"User disabled":"User enabled");}}>{member.active?"Disable":"Enable"}</button></span>
                </div>)}
              </div>
            </div>
          ) : view === "Board" ? (
            <div className="board">
              {cols.map((col, i) => (
                <section
                  className="column"
                  key={col}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => drag && requestMove(drag, col)}
                >
                  <div className="col-head">
                    <i className={`dot d${i}`} />
                    <b>{col}</b>
                    <em>{shown.filter((t) => t.status === col).length}</em>
                    <button onClick={() => setModal(true)}>•••　＋</button>
                  </div>
                  <div className="cards">
                    {shown
                      .filter((t) => t.status === col)
                      .map((t) => (
                        <article
                          draggable
                          onDragStart={() => setDrag(t.id)}
                          onClick={() => setSelected(t)}
                          key={t.id}
                        >
                          <div className="meta">
                            <span className={t.type.toLowerCase()}>
                              {t.type === "Bug"
                                ? "◆"
                                : t.type === "Feature"
                                  ? "⬡"
                                  : "■"}{" "}
                              {t.type}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelected(t);
                                setPanel("actions");
                              }}
                            >
                              •••
                            </button>
                          </div>
                          <h3>{t.title}</h3>
                          <div className="tags">
                            <b className={t.priority.toLowerCase()}>
                              ⚑ {t.priority}
                            </b>
                            <b>{t.tag}</b>
                          </div>
                          <footer>
                            <strong>{t.id}</strong>
                            {t.due && (
                              <span
                                className={t.due === "Today" ? "today" : ""}
                              >
                                ◷ {t.due}
                              </span>
                            )}
                            <span>▱ {t.comments}</span>
                            <Avatar id={t.who} />
                          </footer>
                        </article>
                      ))}
                    <button className="add" onClick={() => setModal(true)}>
                      ＋ Add ticket
                    </button>
                  </div>
                </section>
              ))}
            </div>
          ) : view === "List" ? (
            <div className="list">
              <div className="row head">
                <span>Ticket</span>
                <span>Status</span>
                <span>Priority</span>
                <span>Assignee</span>
              </div>
              {shown.map((t) => (
                <button
                  className="row"
                  key={t.id}
                  onClick={() => setSelected(t)}
                >
                  <span>
                    <b>{t.id}</b>
                    {t.title}
                  </span>
                  <span>{t.status}</span>
                  <span className={t.priority.toLowerCase()}>{t.priority}</span>
                  <span>{teamMembers.find((m)=>m.initials===t.who)?.name || people[t.who]?.[0] || "Unassigned"}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="reports-view">
              <div className="report-card">
                <small>Total tickets</small>
                <b>{tickets.length}</b>
                <span>Across {activeProject.name}</span>
              </div>
              <div className="report-card">
                <small>Open tickets</small>
                <b>{tickets.filter((t) => t.status !== "Done").length}</b>
                <span>Needs attention</span>
              </div>
              <div className="report-card">
                <small>Completed</small>
                <b>{tickets.filter((t) => t.status === "Done").length}</b>
                <span>This project</span>
              </div>
              <div className="report-card urgent-card">
                <small>Urgent</small>
                <b>{tickets.filter((t) => t.priority === "Urgent").length}</b>
                <span>Resolve today</span>
              </div>
              <section className="status-report">
                <h3>Tickets by status</h3>
                {cols.map((c) => (
                  <div key={c}>
                    <span>{c}</span>
                    <i>
                      <b
                        style={{
                          width: `${Math.max(8, (tickets.filter((t) => t.status === c).length / tickets.length) * 100)}%`,
                        }}
                      />
                    </i>
                    <strong>
                      {tickets.filter((t) => t.status === c).length}
                    </strong>
                  </div>
                ))}
              </section>
              <section className="status-report">
                <h3>Workload by assignee</h3>
                {Object.entries(people).map(([id, p]) => (
                  <div key={id}>
                    <span>
                      <Avatar id={id} />
                      {p[0]}
                    </span>
                    <i>
                      <b
                        style={{
                          width: `${Math.max(8, (tickets.filter((t) => t.who === id).length / tickets.length) * 100)}%`,
                        }}
                      />
                    </i>
                    <strong>
                      {tickets.filter((t) => t.who === id).length}
                    </strong>
                  </div>
                ))}
              </section>
            </div>
          )}
        </div>
      </section>
      {(modal || selected) && (
        <div
          className="overlay"
          onMouseDown={() => {
            setModal(false);
            setSelected(null);
          }}
        >
          <div
            className={`modal ${selected ? "ticket-modal" : ""}`}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              className="close"
              onClick={() => {
                setModal(false);
                setSelected(null);
              }}
            >
              ×
            </button>
            {modal ? (
              <>
                <small>PRINTFLOW / NEW TICKET</small>
                <h2>Create a ticket</h2>
                <label>
                  Title
                  <input
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && create()}
                    placeholder="What needs to be done?"
                  />
                </label>
                <div className="form-row">
                  <label>
                    Type
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                    >
                      <option>Task</option>
                      <option>Bug</option>
                      <option>Feature</option>
                    </select>
                  </label>
                  <label>
                    Priority
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value)}
                    >
                      <option>Medium</option>
                      <option>High</option>
                      <option>Urgent</option>
                    </select>
                  </label>
                </div>
                <label>
                  Assignee
                  <select value={newAssigneeId??""} onChange={(e)=>setNewAssigneeId(Number(e.target.value))}>
                    {teamMembers.map((member)=><option key={member.id} value={member.id}>{member.name} · {member.email}</option>)}
                  </select>
                </label>
                <label>
                  Description
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Add context or acceptance criteria..."
                  />
                </label>
                <div className="modal-actions">
                  <button onClick={() => setModal(false)}>Cancel</button>
                  <button
                    className="primary"
                    disabled={syncing || title.trim().length < 3}
                    onClick={create}
                  >
                    Create ticket
                  </button>
                </div>
              </>
            ) : (
              selected && (
                <>
                  <small>
                    {selected.id} · {selected.type}
                  </small>
                  <h2>{selected.title}</h2>
                  <div className="details">
                    <label>
                      Status
                      <select
                        value={selected.status}
                        onChange={(e) =>
                          requestMove(selected.id, e.target.value as Status)
                        }
                      >
                        {cols.map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Priority
                      <b className={selected.priority.toLowerCase()}>
                        ⚑ {selected.priority}
                      </b>
                    </label>
                    <label>
                      Assignee
                      <select value={teamMembers.find(m=>m.initials===selected.who)?.id??""} onChange={(e)=>void changeAssignee(selected.id,Number(e.target.value))} disabled={syncing}>
                        {teamMembers.map((member)=><option key={member.id} value={member.id}>{member.name}</option>)}
                      </select>
                    </label>
                    <label>
                      Due date<b>{selected.due || "No due date"}</b>
                    </label>
                  </div>
                  <div className="comment-box">
                    <Avatar id="AK" />
                    <div>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add a comment… Use @ to mention someone"
                      />
                      <div>
                        <span>☺　📎　@</span>
                        <button
                          disabled={syncing || !comment.trim()}
                          onClick={addComment}
                        >
                          Comment
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="activity-heading">
                    <h4>Activity</h4>
                    <span>{selected.comments} comments</span>
                  </div>
                  <div className="activity-list">
                    {(activities[selected.id] || []).length ? (
                      (activities[selected.id] || []).map((item) => (
                        <div className={`activity ${item.kind}`} key={item.id}>
                          <Avatar id={item.author} />
                          <div>
                            <p>
                              <b>{people[item.author]?.[0] || item.author}</b>
                              {item.kind === "status"
                                ? " changed the status"
                                : item.kind === "created"
                                  ? " created this ticket"
                                  : " commented"}
                            </p>
                            {item.kind === "status" && (
                              <p className="status-change">
                                <span>{item.from}</span>
                                <i>→</i>
                                <span>{item.to}</span>
                              </p>
                            )}
                            {item.text && (
                              <p className="activity-text">{item.text}</p>
                            )}
                            <small>{item.time}　·　Reply</small>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="empty-activity">
                        No activity yet. Add the first comment.
                      </p>
                    )}
                  </div>
                </>
              )
            )}
          </div>
        </div>
      )}
      {pending && (
        <div className="status-overlay" onMouseDown={() => setPending(null)}>
          <div
            className="status-dialog"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="status-icon">↗</div>
            <div>
              <small>STATUS CHANGE</small>
              <h3>
                Move {pending.id} to {pending.to}?
              </h3>
            </div>
            <p>
              <span>{pending.from}</span>
              <i>→</i>
              <span>{pending.to}</span>
            </p>
            <label>
              Comment <em>Optional</em>
              <textarea
                autoFocus
                value={statusComment}
                onChange={(e) => setStatusComment(e.target.value)}
                placeholder="Explain what changed, share a handoff note, or mention @someone…"
              />
            </label>
            <div className="modal-actions">
              <button onClick={() => setPending(null)}>Cancel</button>
              <button
                className="primary"
                disabled={syncing}
                onClick={confirmMove}
              >
                Move ticket
              </button>
            </div>
          </div>
        </div>
      )}
      {panel && (
        <div className="panel-overlay" onMouseDown={() => setPanel(null)}>
          <div className="side-panel" onMouseDown={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setPanel(null)}>
              ×
            </button>
            {panel === "invite" && (
              <>
                <small>PROJECT ACCESS</small>
                <h2>Invite people</h2>
                <p>
                  Add a teammate to {activeProject.name}. They will be able to
                  view and update project tickets.
                </p>
                <label>Full name<input autoFocus value={inviteName} onChange={e=>setInviteName(e.target.value)} placeholder="Full name" /></label>
                <label>Email address<input type="email" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} placeholder="name@company.com" /></label>
                <label>Temporary password<input type="password" value={invitePassword} onChange={e=>setInvitePassword(e.target.value)} placeholder="Minimum 8 characters" /></label>
                <label>Role<select value={inviteRole} onChange={e=>setInviteRole(e.target.value)}><option value="user">User</option><option value="manager">Manager</option><option value="super_admin">Admin</option></select></label>
                <button
                  className="panel-primary"
                  disabled={inviteName.length<2||!inviteEmail.includes("@")||invitePassword.length<8}
                  onClick={addUser}
                >
                  Create user
                </button>
              </>
            )}
            {panel === "notifications" && (
              <>
                <small>INBOX</small>
                <h2>Notifications</h2>
                <div className="notification">
                  <b>PF-124 assigned to you</b>
                  <span>Invoice PDF alignment breaks on mobile</span>
                  <small>12 minutes ago</small>
                </div>
                <div className="notification">
                  <b>Hira mentioned you</b>
                  <span>Payment webhook is ready for review.</span>
                  <small>1 hour ago</small>
                </div>
                <div className="notification">
                  <b>PF-109 moved to review</b>
                  <span>Saad changed the ticket status.</span>
                  <small>Yesterday</small>
                </div>
                <button
                  className="panel-primary"
                  onClick={() => {
                    setPanel(null);
                    flash("All notifications marked as read");
                  }}
                >
                  Mark all as read
                </button>
              </>
            )}
            {panel === "settings" && (
              <>
                <small>MYSQL WORKSPACE</small>
                <h2>Workspace settings</h2>
                <label>Workspace name<input value={workspaceSettings.workspaceName} onChange={e=>setWorkspaceSettings({...workspaceSettings,workspaceName:e.target.value})} /></label>
                <label>Default view<select value={workspaceSettings.defaultView} onChange={e=>setWorkspaceSettings({...workspaceSettings,defaultView:e.target.value})}><option>Board</option><option>List</option><option>Reports</option></select></label>
                <label><input type="checkbox" checked={workspaceSettings.allowInvites} onChange={e=>setWorkspaceSettings({...workspaceSettings,allowInvites:e.target.checked})} /> Allow admins to add users</label>
                <label><input type="checkbox" checked={workspaceSettings.emailNotifications} onChange={e=>setWorkspaceSettings({...workspaceSettings,emailNotifications:e.target.checked})} /> Enable notifications</label>
                <button
                  className="panel-primary"
                  onClick={saveSettings}
                >
                  Save changes
                </button>
              </>
            )}
            {panel === "help" && (
              <>
                <small>HELP CENTER</small>
                <h2>How TaskFlow works</h2>
                <p>
                  Open any card to view comments and activity. Drag a card
                  between columns to change status. Use the filters to narrow
                  tickets.
                </p>
                <div className="shortcut">
                  <b>⌘ K</b>
                  <span>Focus search</span>
                </div>
                <div className="shortcut">
                  <b>C</b>
                  <span>Create ticket</span>
                </div>
                <div className="shortcut">
                  <b>Esc</b>
                  <span>Close panels</span>
                </div>
              </>
            )}
            {panel === "projects" && (
              <>
                <small>NEW WORKSPACE</small>
                <h2>Create project</h2>
                <label>
                  Project name
                  <input
                    autoFocus
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. Mobile App"
                  />
                </label>
                <label>
                  Project key
                  <input
                    value={projectKey}
                    onChange={(e) =>
                      setProjectKey(e.target.value.toUpperCase())
                    }
                    placeholder="e.g. MA"
                    maxLength={5}
                  />
                </label>
                <label>
                  Project description
                  <textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="What is this project for?"
                  />
                </label>
                <button
                  className="panel-primary"
                  disabled={
                    syncing ||
                    projectName.trim().length < 3 ||
                    projectKey.trim().length < 2
                  }
                  onClick={createProject}
                >
                  Create project
                </button>
              </>
            )}
            {panel === "admin" && (
              <>
                <small>AUTHENTICATED SESSION</small>
                <h2>Super Admin Console</h2>
                <div className="admin-user">
                  <Avatar id="AK" />
                  <span>
                    <b>{user.name}</b>
                    <small>{user.email} · Signed in securely</small>
                  </span>
                </div>
                <h3 className="panel-section">User management</h3>
                {adminUsers.map((member) => (
                  <div className="member-row" key={member.id}>
                    <i className="avatar" style={{ background: "#6052d7" }}>{member.name.split(/\s+/).map((x) => x[0]).join("").slice(0, 2)}</i>
                    <span><b>{member.name}</b><small>{member.email} · {member.role.replace("_", " ")}</small></span>
                    <button onClick={async () => { await apiFetch(`/api/users/${member.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: member.role, active: !member.active }) }); await loadAdmin(); flash(member.active ? "User disabled" : "User enabled"); }}>{member.active ? "Disable" : "Enable"}</button>
                  </div>
                ))}
                <button
                  className="panel-primary"
                  onClick={() => setPanel("invite")}
                >
                  ＋ Add user
                </button>
                <button className="signout" onClick={async()=>{await apiFetch("/api/auth/logout",{method:"POST"});setUser(null);setPanel(null);}}>Sign out securely</button>
              </>
            )}
            {panel === "actions" && (
              <>
                <small>{selected?.id || "PRINTFLOW"}</small>
                <h2>More actions</h2>
                <button
                  className="action-item"
                  onClick={() => {
                    setPanel(null);
                    selected && setSelected(selected);
                  }}
                >
                  ✎ Edit ticket
                </button>
                <button
                  className="action-item"
                  onClick={() => {
                    navigator.clipboard?.writeText(selected?.id || "PrintFlow");
                    setPanel(null);
                    flash("Link copied");
                  }}
                >
                  ↗ Copy link
                </button>
                <button
                  className="action-item"
                  onClick={() => {
                    setPanel(null);
                    flash("Ticket added to your watch list");
                  }}
                >
                  ◎ Watch ticket
                </button>
                <button
                  className="action-item danger"
                  onClick={() => {
                    setPanel(null);
                    flash("Delete is restricted to project managers");
                  }}
                >
                  ♲ Move to trash
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {notice && <div className="toast">✓ {notice}</div>}
    </main>
  );
}
