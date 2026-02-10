import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import sampleData from '../data/sampleData.json';

function buildInitialState() {
  const topics = sampleData.map((topicData, topicIdx) => {
    const subTopicMap = {};
    const noSubTopicQuestions = [];

    topicData.questions.forEach((q) => {
      if (q.subTopic) {
        if (!subTopicMap[q.subTopic]) subTopicMap[q.subTopic] = [];
        subTopicMap[q.subTopic].push(q);
      } else {
        noSubTopicQuestions.push(q);
      }
    });

    const subTopics = Object.entries(subTopicMap).map(([name, questions], idx) => ({
      id: uuidv4(),
      name,
      order: idx,
      questions: questions.map((q, qIdx) => ({
        id: q.id || uuidv4(),
        title: q.title,
        difficulty: q.difficulty || 'Medium',
        platform: q.platform || 'leetcode',
        problemUrl: q.problemUrl || '',
        resource: q.resource || '',
        tags: q.tags || [],
        isSolved: false,
        order: qIdx,
      })),
    }));

    const topLevelQuestions = noSubTopicQuestions.map((q, qIdx) => ({
      id: q.id || uuidv4(),
      title: q.title,
      difficulty: q.difficulty || 'Medium',
      platform: q.platform || 'leetcode',
      problemUrl: q.problemUrl || '',
      resource: q.resource || '',
      tags: q.tags || [],
      isSolved: false,
      order: qIdx,
    }));

    return {
      id: uuidv4(),
      name: topicData.name,
      order: topicIdx,
      subTopics,
      questions: topLevelQuestions,
    };
  });

  return topics;
}

const useStore = create(
  persist(
    (set, get) => ({
      topics: buildInitialState(),
      searchQuery: '',
      filterDifficulty: 'all',
      darkMode: false,

      setSearchQuery: (query) => set({ searchQuery: query }),
      setFilterDifficulty: (difficulty) => set({ filterDifficulty: difficulty }),

      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

      addTopic: (name) =>
        set((state) => ({
          topics: [
            ...state.topics,
            {
              id: uuidv4(),
              name,
              order: state.topics.length,
              subTopics: [],
              questions: [],
            },
          ],
        })),

      editTopic: (topicId, name) =>
        set((state) => ({
          topics: state.topics.map((t) => (t.id === topicId ? { ...t, name } : t)),
        })),

      deleteTopic: (topicId) =>
        set((state) => ({
          topics: state.topics.filter((t) => t.id !== topicId),
        })),

      reorderTopics: (oldIndex, newIndex) =>
        set((state) => {
          const newTopics = [...state.topics];
          const [removed] = newTopics.splice(oldIndex, 1);
          newTopics.splice(newIndex, 0, removed);
          return { topics: newTopics.map((t, i) => ({ ...t, order: i })) };
        }),

      addSubTopic: (topicId, name) =>
        set((state) => ({
          topics: state.topics.map((t) =>
            t.id === topicId
              ? {
                  ...t,
                  subTopics: [
                    ...t.subTopics,
                    {
                      id: uuidv4(),
                      name,
                      order: t.subTopics.length,
                      questions: [],
                    },
                  ],
                }
              : t
          ),
        })),

      editSubTopic: (topicId, subTopicId, name) =>
        set((state) => ({
          topics: state.topics.map((t) =>
            t.id === topicId
              ? {
                  ...t,
                  subTopics: t.subTopics.map((st) =>
                    st.id === subTopicId ? { ...st, name } : st
                  ),
                }
              : t
          ),
        })),

      deleteSubTopic: (topicId, subTopicId) =>
        set((state) => ({
          topics: state.topics.map((t) =>
            t.id === topicId
              ? { ...t, subTopics: t.subTopics.filter((st) => st.id !== subTopicId) }
              : t
          ),
        })),

      reorderSubTopics: (topicId, oldIndex, newIndex) =>
        set((state) => ({
          topics: state.topics.map((t) => {
            if (t.id !== topicId) return t;
            const newSubs = [...t.subTopics];
            const [removed] = newSubs.splice(oldIndex, 1);
            newSubs.splice(newIndex, 0, removed);
            return { ...t, subTopics: newSubs.map((s, i) => ({ ...s, order: i })) };
          }),
        })),

      addQuestion: (topicId, subTopicId, questionData) => {
        const newQuestion = {
          id: uuidv4(),
          title: questionData.title,
          difficulty: questionData.difficulty || 'Medium',
          platform: questionData.platform || 'leetcode',
          problemUrl: questionData.problemUrl || '',
          resource: questionData.resource || '',
          tags: questionData.tags || [],
          isSolved: false,
          order: 0,
        };

        set((state) => ({
          topics: state.topics.map((t) => {
            if (t.id !== topicId) return t;
            if (subTopicId) {
              return {
                ...t,
                subTopics: t.subTopics.map((st) => {
                  if (st.id !== subTopicId) return st;
                  const q = { ...newQuestion, order: st.questions.length };
                  return { ...st, questions: [...st.questions, q] };
                }),
              };
            }
            const q = { ...newQuestion, order: t.questions.length };
            return { ...t, questions: [...t.questions, q] };
          }),
        }));
      },

      editQuestion: (topicId, subTopicId, questionId, questionData) =>
        set((state) => ({
          topics: state.topics.map((t) => {
            if (t.id !== topicId) return t;
            if (subTopicId) {
              return {
                ...t,
                subTopics: t.subTopics.map((st) => {
                  if (st.id !== subTopicId) return st;
                  return {
                    ...st,
                    questions: st.questions.map((q) =>
                      q.id === questionId ? { ...q, ...questionData } : q
                    ),
                  };
                }),
              };
            }
            return {
              ...t,
              questions: t.questions.map((q) =>
                q.id === questionId ? { ...q, ...questionData } : q
              ),
            };
          }),
        })),

      deleteQuestion: (topicId, subTopicId, questionId) =>
        set((state) => ({
          topics: state.topics.map((t) => {
            if (t.id !== topicId) return t;
            if (subTopicId) {
              return {
                ...t,
                subTopics: t.subTopics.map((st) => {
                  if (st.id !== subTopicId) return st;
                  return {
                    ...st,
                    questions: st.questions.filter((q) => q.id !== questionId),
                  };
                }),
              };
            }
            return { ...t, questions: t.questions.filter((q) => q.id !== questionId) };
          }),
        })),

      reorderQuestions: (topicId, subTopicId, oldIndex, newIndex) =>
        set((state) => ({
          topics: state.topics.map((t) => {
            if (t.id !== topicId) return t;
            if (subTopicId) {
              return {
                ...t,
                subTopics: t.subTopics.map((st) => {
                  if (st.id !== subTopicId) return st;
                  const newQs = [...st.questions];
                  const [removed] = newQs.splice(oldIndex, 1);
                  newQs.splice(newIndex, 0, removed);
                  return { ...st, questions: newQs.map((q, i) => ({ ...q, order: i })) };
                }),
              };
            }
            const newQs = [...t.questions];
            const [removed] = newQs.splice(oldIndex, 1);
            newQs.splice(newIndex, 0, removed);
            return { ...t, questions: newQs.map((q, i) => ({ ...q, order: i })) };
          }),
        })),

      toggleSolved: (topicId, subTopicId, questionId) =>
        set((state) => ({
          topics: state.topics.map((t) => {
            if (t.id !== topicId) return t;
            if (subTopicId) {
              return {
                ...t,
                subTopics: t.subTopics.map((st) => {
                  if (st.id !== subTopicId) return st;
                  return {
                    ...st,
                    questions: st.questions.map((q) =>
                      q.id === questionId ? { ...q, isSolved: !q.isSolved } : q
                    ),
                  };
                }),
              };
            }
            return {
              ...t,
              questions: t.questions.map((q) =>
                q.id === questionId ? { ...q, isSolved: !q.isSolved } : q
              ),
            };
          }),
        })),

      getStats: () => {
        const state = get();
        let total = 0;
        let solved = 0;
        state.topics.forEach((t) => {
          t.questions.forEach((q) => {
            total++;
            if (q.isSolved) solved++;
          });
          t.subTopics.forEach((st) => {
            st.questions.forEach((q) => {
              total++;
              if (q.isSolved) solved++;
            });
          });
        });
        return { total, solved, percentage: total ? Math.round((solved / total) * 100) : 0 };
      },
    }),
    {
      name: 'question-management-storage',
      partialize: (state) => ({
        topics: state.topics,
        darkMode: state.darkMode,
      }),
    }
  )
);

export default useStore;
