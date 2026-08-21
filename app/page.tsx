"use client";
import { useEffect, useMemo, useState } from "react";
type Status = "To Do" | "In Progress" | "In Review" | "Done";
type P = "Low" | "Medium" | "High" | "Urgent";
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
  kind: "comment" | "status";
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
    [view, setView] = useState<"Board" | "List" | "Reports">("Board"),
    [modal, setModal] = useState(false),
    [selected, setSelected] = useState<Ticket | null>(null),
    [drag, setDrag] = useState(""),
    [title, setTitle] = useState(""),
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
      | "actions"
    >(null),
    [notice, setNotice] = useState("");
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
  useEffect(() => {
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
  const requestMove = (id: string, to: Status) => {
    const t = tickets.find((x) => x.id === id);
    if (t && t.status !== to) setPending({ id, from: t.status, to });
  };
  const confirmMove = () => {
    if (!pending) return;
    setTickets((x) =>
      x.map((t) =>
        t.id === pending.id
          ? {
              ...t,
              status: pending.to,
              comments: t.comments + (statusComment.trim() ? 1 : 0),
            }
          : t,
      ),
    );
    setActivities((x) => ({
      ...x,
      [pending.id]: [
        {
          id: Date.now(),
          kind: "status",
          author: "AK",
          text: statusComment.trim() || "Status updated",
          from: pending.from,
          to: pending.to,
          time: "Just now",
        },
        ...(x[pending.id] || []),
      ],
    }));
    if (selected?.id === pending.id)
      setSelected({
        ...selected,
        status: pending.to,
        comments: selected.comments + (statusComment.trim() ? 1 : 0),
      });
    setPending(null);
    setStatusComment("");
    setDrag("");
  };
  const addComment = () => {
    if (!selected || !comment.trim()) return;
    const text = comment.trim();
    setActivities((x) => ({
      ...x,
      [selected.id]: [
        {
          id: Date.now(),
          kind: "comment",
          author: "AK",
          text,
          time: "Just now",
        },
        ...(x[selected.id] || []),
      ],
    }));
    setTickets((x) =>
      x.map((t) =>
        t.id === selected.id ? { ...t, comments: t.comments + 1 } : t,
      ),
    );
    setSelected({ ...selected, comments: selected.comments + 1 });
    setComment("");
  };
  const create = () => {
    if (!title.trim()) return;
    const n = Math.max(...tickets.map((t) => +t.id.split("-")[1])) + 1;
    setTickets([
      {
        id: `PF-${n}`,
        title: title.trim(),
        type: "Task",
        priority: "Medium",
        status: "To Do",
        who: "AK",
        comments: 0,
        tag: "New",
      },
      ...tickets,
    ]);
    setTitle("");
    setModal(false);
  };
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
              flash("Showing all PrintFlow tickets");
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
          <a
            className="active"
            onClick={() => flash("PrintFlow project selected")}
          >
            <b className="badge pf">PF</b>
            <span>PrintFlow</span>
          </a>
          <a
            onClick={() =>
              flash("HelpDesk project is ready to open in the full version")
            }
          >
            <b className="badge hd">HD</b>
            <span>HelpDesk</span>
          </a>
          <a
            onClick={() =>
              flash(
                "Website Build project is ready to open in the full version",
              )
            }
          >
            <b className="badge wb">WB</b>
            <span>Website Build</span>
          </a>
        </nav>
        <div className="aside-bottom">
          <a onClick={() => setView("Reports")}>▥ Reports</a>
          <a onClick={() => setPanel("settings")}>⚙ Settings</a>
          <div className="profile">
            <Avatar id="AK" />
            <span>
              <b>Ahmed Khan</b>
              <small>Project manager</small>
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
            <Avatar id="AK" />
          </div>
        </header>
        <div className="content">
          <div className="project">
            <div>
              <p>Projects　/　PrintFlow</p>
              <h1>PrintFlow</h1>
              <small>Order, billing and production management</small>
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
            <span />
            <button onClick={() => setPanel("settings")}>
              ⚙ Project settings
            </button>
          </div>
          <div className="tools">
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
          </div>
          {view === "Board" ? (
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
                  <span>{people[t.who][0]}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="reports-view">
              <div className="report-card">
                <small>Total tickets</small>
                <b>{tickets.length}</b>
                <span>Across PrintFlow</span>
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
                    <select>
                      <option>Task</option>
                      <option>Bug</option>
                      <option>Feature</option>
                    </select>
                  </label>
                  <label>
                    Priority
                    <select>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Urgent</option>
                    </select>
                  </label>
                </div>
                <label>
                  Description
                  <textarea placeholder="Add context or acceptance criteria..." />
                </label>
                <div className="modal-actions">
                  <button onClick={() => setModal(false)}>Cancel</button>
                  <button className="primary" onClick={create}>
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
                      <span>
                        <Avatar id={selected.who} />
                        {people[selected.who][0]}
                      </span>
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
                        <button disabled={!comment.trim()} onClick={addComment}>
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
                              <b>{people[item.author][0]}</b>
                              {item.kind === "status"
                                ? " changed the status"
                                : " commented"}
                            </p>
                            {item.kind === "status" && (
                              <p className="status-change">
                                <span>{item.from}</span>
                                <i>→</i>
                                <span>{item.to}</span>
                              </p>
                            )}
                            <p className="activity-text">{item.text}</p>
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
              <button className="primary" onClick={confirmMove}>
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
                  Add a teammate to PrintFlow. They will be able to view and
                  update project tickets.
                </p>
                <label>
                  Email address
                  <input autoFocus placeholder="name@company.com" />
                </label>
                <label>
                  Project role
                  <select>
                    <option>Member</option>
                    <option>Project manager</option>
                    <option>Viewer</option>
                  </select>
                </label>
                <button
                  className="panel-primary"
                  onClick={() => {
                    setPanel(null);
                    flash("Invitation prepared successfully");
                  }}
                >
                  Send invitation
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
                <small>PRINTFLOW</small>
                <h2>Project settings</h2>
                <label>
                  Project name
                  <input defaultValue="PrintFlow" />
                </label>
                <label>
                  Project key
                  <input defaultValue="PF" />
                </label>
                <label>
                  Description
                  <textarea defaultValue="Order, billing and production management" />
                </label>
                <button
                  className="panel-primary"
                  onClick={() => {
                    setPanel(null);
                    flash("Project settings saved");
                  }}
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
                  <input autoFocus placeholder="e.g. Mobile App" />
                </label>
                <label>
                  Project key
                  <input placeholder="e.g. MA" maxLength={5} />
                </label>
                <button
                  className="panel-primary"
                  onClick={() => {
                    setPanel(null);
                    flash("New project draft created");
                  }}
                >
                  Create project
                </button>
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
