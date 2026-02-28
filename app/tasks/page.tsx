import Nav from "@/components/Nav";
import TaskBoard from "@/components/TaskBoard";

export default function TasksPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Nav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Task Board</h1>
          <p className="text-gray-400 text-sm">Kanban-Übersicht aller Agent-Tasks</p>
        </div>
        <TaskBoard />
      </main>
    </div>
  );
}
