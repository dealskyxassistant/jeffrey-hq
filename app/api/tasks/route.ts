import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const TASKS_FILE = path.join(process.cwd(), "data", "tasks.json");

export async function GET() {
  try {
    const raw = await fs.readFile(TASKS_FILE, "utf-8");
    const tasks = JSON.parse(raw);
    return NextResponse.json(tasks);
  } catch {
    return NextResponse.json({ scheduled: [], running: [], done: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { status, title, agent, description } = body;

    if (!status || !title || !agent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const raw = await fs.readFile(TASKS_FILE, "utf-8");
    const tasks = JSON.parse(raw);

    const newTask = {
      id: Date.now().toString(),
      title,
      agent,
      description: description || "",
      createdAt: new Date().toISOString(),
    };

    if (!tasks[status]) tasks[status] = [];
    tasks[status].push(newTask);

    await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));

    return NextResponse.json(newTask, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, fromStatus, toStatus } = body;

    if (!id || !fromStatus || !toStatus) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const raw = await fs.readFile(TASKS_FILE, "utf-8");
    const tasks = JSON.parse(raw);

    const taskIndex = tasks[fromStatus]?.findIndex((t: { id: string }) => t.id === id);
    if (taskIndex === -1 || taskIndex === undefined) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const [task] = tasks[fromStatus].splice(taskIndex, 1);
    if (!tasks[toStatus]) tasks[toStatus] = [];
    tasks[toStatus].push(task);

    await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));

    return NextResponse.json(task);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
