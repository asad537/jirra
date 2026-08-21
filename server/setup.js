import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import "dotenv/config";

const here = path.dirname(fileURLToPath(import.meta.url));
const connection = await mysql.createConnection({
  host: process.env.MYSQL_HOST || "127.0.0.1", port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || "root", password: process.env.MYSQL_PASSWORD || "", multipleStatements: true,
});
try {
  await connection.query(await fs.readFile(path.join(here, "../mysql/schema.sql"), "utf8"));
  await connection.query(`USE \`${process.env.MYSQL_DATABASE || "jirra"}\``);
  const adminEmail = process.env.ADMIN_EMAIL || "admin@jirra.local";
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const hash = await bcrypt.hash(adminPassword, 12);
  await connection.execute("INSERT INTO users(name,email,password_hash,global_role,avatar_color) VALUES(?,?,?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name),password_hash=VALUES(password_hash),global_role='super_admin',active=1", ["Ahmed Khan", adminEmail, hash, "super_admin", "#ed9276"]);
  const users = [
    ["Zara Malik", "zara@jirra.local", "#8576df"], ["Saad Raza", "saad@jirra.local", "#4fa68c"], ["Hira Noor", "hira@jirra.local", "#db6586"],
  ];
  for (const [name,email,color] of users) {
    await connection.execute("INSERT IGNORE INTO users(name,email,password_hash,avatar_color) VALUES(?,?,?,?)", [name,email,await bcrypt.hash("Member123!", 10),color]);
  }
  const [[admin]] = await connection.execute("SELECT id FROM users WHERE email=?", [adminEmail]);
  for (const p of [["PF","PrintFlow","Order, billing and production management","#ed9276"],["HD","HelpDesk","Customer support and service requests","#62a4cb"],["WB","Website Build","Website design and development","#55a987"]]) {
    await connection.execute("INSERT IGNORE INTO projects(project_key,name,description,color,created_by) VALUES(?,?,?,?,?)", [...p,admin.id]);
  }
  await connection.execute("INSERT IGNORE INTO project_members(project_id,user_id,role) SELECT p.id,u.id,IF(u.id=?,'project_manager','member') FROM projects p CROSS JOIN users u", [admin.id]);
  const [[count]] = await connection.query("SELECT COUNT(*) total FROM tickets");
  if (!Number(count.total)) {
    const samples = [["Invoice PDF alignment breaks on mobile","Bug","Urgent","To Do","Mobile"],["Add bulk print option to orders","Feature","High","To Do","Orders"],["Payment status not syncing","Bug","Urgent","In Progress","Payments"],["Redesign order detail header","Task","High","In Progress","UI"],["Add CSV import validation","Feature","Medium","In Review","Import"],["Add keyboard shortcuts","Improvement","Low","Done","UX"]];
    const [[project]] = await connection.execute("SELECT id FROM projects WHERE project_key='PF'");
    const [memberRows] = await connection.query("SELECT id FROM users ORDER BY id");
    for (let i=0;i<samples.length;i++) {
      const [title,type,priority,status,label] = samples[i];
      const number = i + 1;
      const [result] = await connection.execute("INSERT INTO tickets(project_id,ticket_number,ticket_key,title,description,type,priority,status,assignee_id,reporter_id) VALUES(?,?,?,?,?,?,?,?,?,?)", [project.id,number,`PF-${number}`,title,`${title}. Add implementation details and acceptance criteria here.`,type,priority,status,memberRows[i%memberRows.length].id,admin.id]);
      await connection.execute("INSERT IGNORE INTO labels(project_id,name) VALUES(?,?)", [project.id,label]);
      await connection.execute("INSERT INTO ticket_labels(ticket_id,label_id) SELECT ?,id FROM labels WHERE project_id=? AND name=?", [result.insertId,project.id,label]);
      await connection.execute("INSERT INTO activity_logs(ticket_id,user_id,action,comment) VALUES(?,?,?,?)", [result.insertId,admin.id,"created","Ticket created"]);
    }
    await connection.execute("UPDATE projects SET next_ticket_number=? WHERE id=?", [samples.length+1,project.id]);
  }
  await connection.execute("INSERT INTO app_settings(setting_key,setting_value,updated_by) VALUES('workspace',?,?) ON DUPLICATE KEY UPDATE setting_key=setting_key", [JSON.stringify({workspaceName:"TaskFlow",allowInvites:true,emailNotifications:true,defaultView:"Board"}),admin.id]);
  console.log(`MySQL ready. Admin: ${adminEmail}`);
} finally { await connection.end(); }
