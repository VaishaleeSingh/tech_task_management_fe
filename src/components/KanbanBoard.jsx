import React, { useState } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core';
import { 
  SortableContext, 
  arrayMove, 
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import TaskCard from './TaskCard';
import useTaskStore from '../store/useTaskStore';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

function KanbanColumn({ id, title, tasks, onAddTask, onEditTask, onDeleteTask }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="kanban-col flex-1 min-w-[85vw] md:min-w-[300px] snap-center">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-[var(--text-primary)]">{title}</h3>
          <span className="bg-[var(--bg-card)] text-[var(--text-secondary)] text-xs py-0.5 px-2 rounded-full font-semibold border border-[var(--border)]">
            {tasks.length}
          </span>
        </div>
        <button 
          onClick={() => onAddTask(id)}
          className="p-1 rounded hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border-none bg-transparent cursor-pointer transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>

      <div 
        ref={setNodeRef} 
        className="flex-1 overflow-y-auto scrollbar-hide min-h-[150px] p-1"
      >
        <SortableContext 
          id={id} 
          items={tasks.map(t => t.id)} 
          strategy={verticalListSortingStrategy}
        >
          {tasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="h-24 border-2 border-dashed border-[var(--border)] rounded-[var(--radius-md)] flex items-center justify-center text-[var(--text-muted)] text-sm">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}

export default function KanbanBoard({ onEditTask, onAddTask }) {
  const { tasks, moveTask, deleteTask } = useTaskStore();
  const [activeTask, setActiveTask] = useState(null);

  const columns = [
    { id: 'todo', title: 'To Do' },
    { id: 'in_progress', title: 'In Progress' },
    { id: 'done', title: 'Done' }
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Require 5px movement before drag starts (allows clicks to work)
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task);
  };

  const handleDragOver = (event) => {
    // Only handle column changes when dropped
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Determine target column
    let newStatus;
    if (columns.find(c => c.id === overId)) {
      newStatus = overId; // Dropped on empty column
    } else {
      // Dropped on another task
      const overTask = tasks.find(t => t.id === overId);
      if (overTask) newStatus = overTask.status;
    }

    if (!newStatus) return;

    const taskToMove = tasks.find(t => t.id === activeId);
    if (taskToMove && taskToMove.status !== newStatus) {
      const res = await moveTask(activeId, newStatus);
      if (!res.success) toast.error(res.error);
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      const res = await deleteTask(taskId);
      if (res.success) toast.success('Task deleted');
      else toast.error(res.error);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 md:gap-6 h-[calc(100vh-140px)] overflow-x-auto pb-4 snap-x snap-mandatory">
        {columns.map(col => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            tasks={tasks.filter(t => t.status === col.id)}
            onAddTask={onAddTask}
            onEditTask={onEditTask}
            onDeleteTask={handleDelete}
          />
        ))}
      </div>
      
      <DragOverlay>
        {activeTask ? (
          <div className="opacity-90 rotate-2 scale-105 transition-transform cursor-grabbing">
            <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
