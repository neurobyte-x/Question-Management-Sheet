import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Pencil,
  Trash2,
  Plus,
  FolderPlus,
} from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useStore from '../store/useStore';
import SubTopicCard from './SubTopicCard';
import QuestionItem from './QuestionItem';
import Modal, { FormInput, FormSelect, FormButton } from './Modal';

export default function TopicCard({ topic, index }) {
  const { editTopic, deleteTopic, addSubTopic, addQuestion } = useStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(topic.name);
  const [isAddingSubTopic, setIsAddingSubTopic] = useState(false);
  const [newSubTopicName, setNewSubTopicName] = useState('');
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
    id: topic.id,
    data: { type: 'topic', index },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const totalQuestions =
    topic.questions.length +
    topic.subTopics.reduce((sum, st) => sum + st.questions.length, 0);

  const solvedQuestions =
    topic.questions.filter((q) => q.isSolved).length +
    topic.subTopics.reduce(
      (sum, st) => sum + st.questions.filter((q) => q.isSolved).length,
      0
    );

  const handleEditSave = () => {
    editTopic(topic.id, editName);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Delete topic "${topic.name}" and all its contents?`)) {
      deleteTopic(topic.id);
    }
  };

  const handleAddSubTopic = () => {
    if (!newSubTopicName.trim()) return;
    addSubTopic(topic.id, newSubTopicName.trim());
    setNewSubTopicName('');
    setIsAddingSubTopic(false);
  };

  const handleAddQuestion = () => {
    if (!newQuestion.title.trim()) return;
    addQuestion(topic.id, null, {
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

  const subTopicIds = topic.subTopics.map((st) => st.id);
  const questionIds = topic.questions.map((q) => q.id);

  const progressPct = totalQuestions > 0 ? (solvedQuestions / totalQuestions) * 100 : 0;

  return (
    <>
       <div ref={setNodeRef} style={style} className="mb-4">
         <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
           <div className="group flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-indigo-50/80 to-white dark:from-black dark:to-gray-900 border-b border-gray-100 dark:border-gray-800">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 dark:text-gray-700 dark:hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <GripVertical size={18} />
            </button>

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
            >
              {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
            </button>

            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white truncate">
                {topic.name}
              </h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {solvedQuestions}/{totalQuestions} solved
                </span>
                <div className="flex-1 max-w-[120px] h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setIsAddingQuestion(true)}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-black text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                title="Add question"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={() => setIsAddingSubTopic(true)}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-black text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                title="Add sub-topic"
              >
                <FolderPlus size={16} />
              </button>
              <button
                onClick={() => {
                  setEditName(topic.name);
                  setIsEditing(true);
                }}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-black text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Edit topic"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={handleDelete}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-black text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Delete topic"
              >
                <Trash2 size={16} />
              </button>
            </div>
           </div>

           {!isCollapsed && (
             <div className="px-5 py-3">
               {topic.subTopics.length > 0 && (
                <div className="mb-3">
                  <SortableContext
                    items={subTopicIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {topic.subTopics.map((st, idx) => (
                      <SubTopicCard
                        key={st.id}
                        subTopic={st}
                        topicId={topic.id}
                        index={idx}
                      />
                    ))}
                  </SortableContext>
                </div>
               )}

               {topic.questions.length > 0 && (
                <div className="space-y-1">
                  {topic.subTopics.length > 0 && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-medium mb-2 mt-1">
                      General Questions
                    </p>
                  )}
                  <SortableContext
                    items={questionIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {topic.questions.map((q, idx) => (
                      <QuestionItem
                        key={q.id}
                        question={q}
                        topicId={topic.id}
                        subTopicId={null}
                        index={idx}
                      />
                    ))}
                  </SortableContext>
                </div>
              )}

              {topic.questions.length === 0 && topic.subTopics.length === 0 && (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
                  No questions yet. Add a question or sub-topic to get started.
                </p>
              )}
            </div>
          )}
         </div>
       </div>

       <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="Edit Topic">
        <FormInput
          label="Topic Name"
          value={editName}
          onChange={setEditName}
          placeholder="Enter topic name"
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
         isOpen={isAddingSubTopic}
         onClose={() => setIsAddingSubTopic(false)}
         title={`Add Sub-topic to "${topic.name}"`}
      >
        <FormInput
          label="Sub-topic Name"
          value={newSubTopicName}
          onChange={setNewSubTopicName}
          placeholder="Enter sub-topic name"
          required
        />
        <div className="flex justify-end gap-2 mt-6">
          <FormButton variant="secondary" onClick={() => setIsAddingSubTopic(false)}>
            Cancel
          </FormButton>
          <FormButton onClick={handleAddSubTopic}>Add Sub-topic</FormButton>
        </div>
       </Modal>

       <Modal
         isOpen={isAddingQuestion}
         onClose={() => setIsAddingQuestion(false)}
         title={`Add Question to "${topic.name}"`}
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
