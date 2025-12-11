import { promises as fs } from "fs";
import path from "path";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  createdAt: string;
}

const dbPath = path.join(process.cwd(), "data", "tasks.json");

async function ensureDbExists() {
  try {
    await fs.access(dbPath);
  } catch {
    await fs.mkdir(path.dirname(dbPath), { recursive: true });
    await fs.writeFile(dbPath, JSON.stringify([]));
  }
}

export async function getTasks(): Promise<Task[]> {
  await ensureDbExists();
  const data = await fs.readFile(dbPath, "utf-8");
  return JSON.parse(data);
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  await ensureDbExists();
  await fs.writeFile(dbPath, JSON.stringify(tasks, null, 2));
}

export async function createTask(
  task: Omit<Task, "id" | "createdAt">
): Promise<Task> {
  const tasks = await getTasks();
  const newTask: Task = {
    ...task,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  await saveTasks(tasks);
  return newTask;
}

export async function updateTask(
  id: string,
  updates: Partial<Task>
): Promise<Task | null> {
  const tasks = await getTasks();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;
  tasks[index] = { ...tasks[index], ...updates };
  await saveTasks(tasks);
  return tasks[index];
}

export async function deleteTask(id: string): Promise<boolean> {
  const tasks = await getTasks();
  const filtered = tasks.filter((t) => t.id !== id);
  if (filtered.length === tasks.length) return false;
  await saveTasks(filtered);
  return true;
}