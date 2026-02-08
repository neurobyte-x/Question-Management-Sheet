import { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  GripVertical,
  Pencil,
  Trash2,
  ExternalLink,
  Youtube,
} from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useStore from '../store/useStore';
import Modal, { FormInput, FormSelect, FormButton } from './Modal';

const difficultyColors = {
  Easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  Hard: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
};

export default function QuestionItem({ question, topicId, subTopicId, index }) {
  const { editQuestion, deleteQuestion, toggleSolved } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: question.id,
    data: { type: 'question', topicId, subTopicId, index },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const openEdit = () => {
    setEditData({
      title: question.title,
      difficulty: question.difficulty,
      platform: question.platform,
      problemUrl: question.problemUrl,
      resource: question.resource,
      tags: question.tags.join(', '),
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    editQuestion(topicId, subTopicId, question.id, {
      ...editData,
      tags: editData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Delete "${question.title}"?`)) {
      deleteQuestion(topicId, subTopicId, question.id);
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`group flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-sm transition-all ${
          question.isSolved ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''
        }`}
       >
         <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 dark:text-gray-700 dark:hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        >
           <GripVertical size={16} />
         </button>

         <button
          onClick={() => toggleSolved(topicId, subTopicId, question.id)}
          className="flex-shrink-0 transition-colors"
        >
          {question.isSolved ? (
            <CheckCircle2 size={20} className="text-emerald-500" />
          ) : (
            <Circle size={20} className="text-gray-300 hover:text-indigo-400 dark:text-gray-700 dark:hover:text-indigo-400" />
           )}
         </button>

         <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-sm font-medium ${
                question.isSolved ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'
              }`}
            >
              {question.title}
            </span>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                difficultyColors[question.difficulty] || difficultyColors.Medium
              }`}
            >
              {question.difficulty}
            </span>
          </div>
          {question.tags && question.tags.length > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {question.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
         </div>

         <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          {question.problemUrl && (
            <a
              href={question.problemUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
              title="Open problem"
            >
              <ExternalLink size={14} />
            </a>
          )}
          {question.resource && (
            <a
              href={question.resource}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
              title="Video solution"
            >
              <Youtube size={14} />
            </a>
          )}
          <button
            onClick={openEdit}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
       </div>

       <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="Edit Question">
        <FormInput
          label="Title"
          value={editData.title || ''}
          onChange={(v) => setEditData({ ...editData, title: v })}
          placeholder="Question title"
          required
        />
        <FormSelect
          label="Difficulty"
          value={editData.difficulty || 'Medium'}
          onChange={(v) => setEditData({ ...editData, difficulty: v })}
          options={[
            { value: 'Easy', label: 'Easy' },
            { value: 'Medium', label: 'Medium' },
            { value: 'Hard', label: 'Hard' },
          ]}
        />
        <FormInput
          label="Platform"
          value={editData.platform || ''}
          onChange={(v) => setEditData({ ...editData, platform: v })}
          placeholder="e.g. leetcode"
        />
        <FormInput
          label="Problem URL"
          value={editData.problemUrl || ''}
          onChange={(v) => setEditData({ ...editData, problemUrl: v })}
          placeholder="https://..."
        />
        <FormInput
          label="Video Resource URL"
          value={editData.resource || ''}
          onChange={(v) => setEditData({ ...editData, resource: v })}
          placeholder="https://youtu.be/..."
        />
        <FormInput
          label="Tags (comma separated)"
          value={editData.tags || ''}
          onChange={(v) => setEditData({ ...editData, tags: v })}
          placeholder="Arrays, HashMap, ..."
        />
        <div className="flex justify-end gap-2 mt-6">
          <FormButton variant="secondary" onClick={() => setIsEditing(false)}>
            Cancel
          </FormButton>
          <FormButton onClick={handleSave}>Save Changes</FormButton>
        </div>
      </Modal>
    </>
  );
}
