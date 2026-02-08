import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Pencil,
  Trash2,
  Plus,
} from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useStore from '../store/useStore';
import QuestionItem from './QuestionItem';
import Modal, { FormInput, FormSelect, FormButton } from './Modal';

export default function SubTopicCard({ subTopic, topicId, index }) {
  const { editSubTopic, deleteSubTopic, addQuestion } = useStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(subTopic.name);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    difficulty: 'Medium',
    platform: 'leetcode',
    problemUrl: '',
    resource: '',
    tags: '',
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: subTopic.id,
    data: { type: 'subtopic', topicId, index },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const handleEditSave = () => {
    editSubTopic(topicId, subTopic.id, editName);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Delete sub-topic "${subTopic.name}" and all its questions?`)) {
      deleteSubTopic(topicId, subTopic.id);
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestion.title.trim()) return;
    addQuestion(topicId, subTopic.id, {
      ...newQuestion,
      tags: newQuestion.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });
    setNewQuestion({
      title: '',
      difficulty: 'Medium',
      platform: 'leetcode',
      problemUrl: '',
      resource: '',
      tags: '',
    });
    setIsAddingQuestion(false);
  };

  const questionIds = subTopic.questions.map((q) => q.id);

  return (
     <>
       <div ref={setNodeRef} style={style} className="mb-2">
         <div className="group flex items-center gap-2 px-3 py-2.5 bg-gray-50 dark:bg-black rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors border dark:border-gray-800">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 dark:text-gray-700 dark:hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <GripVertical size={14} />
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
          </button>

          <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-200">
            {subTopic.name}
          </span>

          <span className="text-xs text-gray-400 dark:text-gray-500 mr-2">
            {subTopic.questions.length} questions
          </span>

          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsAddingQuestion(true)}
              className="p-1 rounded hover:bg-white dark:hover:bg-gray-800 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              title="Add question"
            >
              <Plus size={14} />
            </button>
            <button
              onClick={() => {
                setEditName(subTopic.name);
                setIsEditing(true);
              }}
              className="p-1 rounded hover:bg-white dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 rounded hover:bg-white dark:hover:bg-gray-800 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
         </div>

         {!isCollapsed && subTopic.questions.length > 0 && (
          <div className="ml-6 mt-1 space-y-1">
            <SortableContext items={questionIds} strategy={verticalListSortingStrategy}>
              {subTopic.questions.map((q, idx) => (
                <QuestionItem
                  key={q.id}
                  question={q}
                  topicId={topicId}
                  subTopicId={subTopic.id}
                  index={idx}
                />
              ))}
            </SortableContext>
          </div>
        )}
       </div>

       <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="Edit Sub-topic">
        <FormInput
          label="Sub-topic Name"
          value={editName}
          onChange={setEditName}
          placeholder="Enter sub-topic name"
          required
        />
        <div className="flex justify-end gap-2 mt-6">
          <FormButton variant="secondary" onClick={() => setIsEditing(false)}>
            Cancel
          </FormButton>
          <FormButton onClick={handleEditSave}>Save</FormButton>
        </div>
       </Modal>

       <Modal
         isOpen={isAddingQuestion}
         onClose={() => setIsAddingQuestion(false)}
         title={`Add Question to "${subTopic.name}"`}
      >
        <FormInput
          label="Title"
          value={newQuestion.title}
          onChange={(v) => setNewQuestion({ ...newQuestion, title: v })}
          placeholder="Question title"
          required
        />
        <FormSelect
          label="Difficulty"
          value={newQuestion.difficulty}
          onChange={(v) => setNewQuestion({ ...newQuestion, difficulty: v })}
          options={[
            { value: 'Easy', label: 'Easy' },
            { value: 'Medium', label: 'Medium' },
            { value: 'Hard', label: 'Hard' },
          ]}
        />
        <FormInput
          label="Platform"
          value={newQuestion.platform}
          onChange={(v) => setNewQuestion({ ...newQuestion, platform: v })}
          placeholder="e.g. leetcode"
        />
        <FormInput
          label="Problem URL"
          value={newQuestion.problemUrl}
          onChange={(v) => setNewQuestion({ ...newQuestion, problemUrl: v })}
          placeholder="https://..."
        />
        <FormInput
          label="Video Resource URL"
          value={newQuestion.resource}
          onChange={(v) => setNewQuestion({ ...newQuestion, resource: v })}
          placeholder="https://youtu.be/..."
        />
        <FormInput
          label="Tags (comma separated)"
          value={newQuestion.tags}
          onChange={(v) => setNewQuestion({ ...newQuestion, tags: v })}
          placeholder="Arrays, HashMap, ..."
        />
        <div className="flex justify-end gap-2 mt-6">
          <FormButton variant="secondary" onClick={() => setIsAddingQuestion(false)}>
            Cancel
          </FormButton>
          <FormButton onClick={handleAddQuestion}>Add Question</FormButton>
        </div>
      </Modal>
    </>
  );
}
