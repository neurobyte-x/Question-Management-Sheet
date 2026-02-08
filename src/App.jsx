import { useMemo, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useState } from 'react';
import useStore from './store/useStore';
import Header from './components/Header';
import TopicCard from './components/TopicCard';

function App() {
  const {
    topics,
    searchQuery,
    filterDifficulty,
    reorderTopics,
    reorderSubTopics,
    reorderQuestions,
    darkMode,
  } = useStore();

  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

   const filteredTopics = useMemo(() => {
    if (!searchQuery && filterDifficulty === 'all') return topics;

    const query = searchQuery.toLowerCase();

    return topics
      .map((topic) => {
        const filterQuestion = (q) => {
          const matchesSearch = !query || q.title.toLowerCase().includes(query);
          const matchesDifficulty =
            filterDifficulty === 'all' || q.difficulty === filterDifficulty;
          return matchesSearch && matchesDifficulty;
        };

        const filteredQuestions = topic.questions.filter(filterQuestion);
        const filteredSubTopics = topic.subTopics
          .map((st) => ({
            ...st,
            questions: st.questions.filter(filterQuestion),
          }))
          .filter((st) => st.questions.length > 0);

        const topicNameMatches = !query || topic.name.toLowerCase().includes(query);

        if (
          filteredQuestions.length > 0 ||
          filteredSubTopics.length > 0 ||
          (topicNameMatches && filterDifficulty === 'all')
        ) {
          return {
            ...topic,
            questions: topicNameMatches && filterDifficulty === 'all'
              ? topic.questions
              : filteredQuestions,
            subTopics: topicNameMatches && filterDifficulty === 'all'
              ? topic.subTopics
              : filteredSubTopics,
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [topics, searchQuery, filterDifficulty]);

  const topicIds = filteredTopics.map((t) => t.id);

   const findItemContext = useCallback(
     (id) => {
       const topicIdx = topics.findIndex((t) => t.id === id);
       if (topicIdx !== -1) return { type: 'topic', topicIdx };

       for (let ti = 0; ti < topics.length; ti++) {
         const stIdx = topics[ti].subTopics.findIndex((st) => st.id === id);
         if (stIdx !== -1)
           return { type: 'subtopic', topicId: topics[ti].id, subTopicIdx: stIdx };
       }

       for (let ti = 0; ti < topics.length; ti++) {
         const qIdx = topics[ti].questions.findIndex((q) => q.id === id);
         if (qIdx !== -1)
           return {
             type: 'question',
             topicId: topics[ti].id,
             subTopicId: null,
             questionIdx: qIdx,
           };

         for (let si = 0; si < topics[ti].subTopics.length; si++) {
           const sqIdx = topics[ti].subTopics[si].questions.findIndex(
             (q) => q.id === id
           );
           if (sqIdx !== -1)
             return {
               type: 'question',
               topicId: topics[ti].id,
               subTopicId: topics[ti].subTopics[si].id,
               questionIdx: sqIdx,
             };
         }
       }

       return null;
     },
    [topics]
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

     if (!over || active.id === over.id) return;

     const activeCtx = findItemContext(active.id);
     const overCtx = findItemContext(over.id);

     if (!activeCtx || !overCtx) return;

     if (activeCtx.type === 'topic' && overCtx.type === 'topic') {
      reorderTopics(activeCtx.topicIdx, overCtx.topicIdx);
    } else if (
      activeCtx.type === 'subtopic' &&
      overCtx.type === 'subtopic' &&
      activeCtx.topicId === overCtx.topicId
    ) {
      reorderSubTopics(activeCtx.topicId, activeCtx.subTopicIdx, overCtx.subTopicIdx);
    } else if (
      activeCtx.type === 'question' &&
      overCtx.type === 'question' &&
      activeCtx.topicId === overCtx.topicId &&
      activeCtx.subTopicId === overCtx.subTopicId
    ) {
      reorderQuestions(
        activeCtx.topicId,
        activeCtx.subTopicId,
        activeCtx.questionIdx,
        overCtx.questionIdx
      );
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-black transition-colors ${darkMode ? 'dark' : ''}`}>
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={topicIds} strategy={verticalListSortingStrategy}>
            {filteredTopics.map((topic, idx) => (
              <TopicCard key={topic.id} topic={topic} index={idx} />
            ))}
          </SortableContext>
        </DndContext>

        {filteredTopics.length === 0 && (
           <div className="text-center py-16">
             <div className="text-gray-300 dark:text-gray-600 mb-4">
              <svg
                className="mx-auto h-16 w-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 2a10 10 0 110 20 10 10 0 010-20z"
                />
              </svg>
            </div>
             <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">No results found</h3>
             <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
