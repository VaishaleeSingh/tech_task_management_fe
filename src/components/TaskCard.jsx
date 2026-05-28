import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, isPast, parseISO } from 'date-fns';
import { Clock, Edit2, Trash2 } from 'lucide-react';

export default function TaskCard({ task, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue = task.dueDate && task.status !== 'done' && isPast(parseISO(task.dueDate));

  if (isDragging) {
    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        className="card opacity-30 border-2 border-dashed border-[var(--accent)] min-h-[120px] rounded-[var(--radius-md)] mb-3"
      />
    );
  }

  const priorityColors = {
    urgent: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-amber-500',
    low: 'bg-green-500'
  };
  
  const priorityBorder = priorityColors[task.priority] || priorityColors.medium;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white/80 backdrop-blur-md border border-[var(--border)] rounded-xl mb-3 shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_24px_rgba(192,132,252,0.12)] hover:-translate-y-1 transition-all duration-300 group relative flex flex-col cursor-grab active:cursor-grabbing overflow-hidden`}
      {...attributes}
      {...listeners}
    >
      {/* Priority Color Stripe */}
      <div className={`absolute left-0 top-0 bottom-0 w-[6px] ${priorityBorder}`} />
      
      {/* Inner Padding Container */}
      <div 
        className="flex flex-col gap-3 relative z-10 w-full"
        style={{ padding: '20px', paddingLeft: '26px' }}
      >
        <div className="flex justify-between items-start gap-3">
          <h4 className="font-semibold text-sm text-[var(--text-primary)] leading-snug break-words flex-1 pr-2">{task.title}</h4>
          
          {/* Action buttons appear on hover */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(task); }} 
              className="p-1 text-[var(--text-muted)] hover:text-[var(--accent)] bg-transparent border-none cursor-pointer rounded"
            >
              <Edit2 size={14} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} 
              className="p-1 text-[var(--text-muted)] hover:text-[var(--danger)] bg-transparent border-none cursor-pointer rounded"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        
        {task.description && (
          <p className="text-xs text-[var(--text-secondary)] line-clamp-3 break-words mt-1">{task.description}</p>
        )}

        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-2">
            <span className={`badge badge-${task.priority || 'medium'}`}>
              {task.priority || 'Medium'}
            </span>
            {task.assigneeName && (
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                style={{ backgroundColor: task.assigneeAvatarColor || '#ccc' }}
                title={`Assigned to ${task.assigneeName}`}
              >
                {task.assigneeName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          {task.dueDate && (
            <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-[var(--danger)] font-medium' : 'text-[var(--text-muted)]'}`}>
              <Clock size={12} />
              <span>{format(parseISO(task.dueDate), 'MMM d')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
