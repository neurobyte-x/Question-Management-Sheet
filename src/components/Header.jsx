import { useState } from 'react';
import { Search, Plus, BarChart3, Filter, Moon, Sun } from 'lucide-react';
import useStore from '../store/useStore';
import Modal, { FormInput, FormButton } from './Modal';

export default function Header() {
  const { searchQuery, setSearchQuery, filterDifficulty, setFilterDifficulty, addTopic, getStats, darkMode, toggleDarkMode } =
    useStore();
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const stats = getStats();

  const handleAddTopic = () => {
    if (!newTopicName.trim()) return;
    addTopic(newTopicName.trim());
    setNewTopicName('');
    setIsAddingTopic(false);
  };

  return (
    <>
      <header className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Question Management Sheet
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Organize, track, and manage your coding practice
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-4">
              <div className="flex items-center gap-2 bg-indigo-50 dark:bg-gray-900 px-3 py-2 rounded-lg border dark:border-gray-800">
                <BarChart3 size={16} className="text-indigo-500 dark:text-indigo-400" />
                <div className="text-sm">
                  <span className="font-semibold text-indigo-700 dark:text-indigo-300">{stats.solved}</span>
                  <span className="text-indigo-400 dark:text-indigo-500">/{stats.total}</span>
                </div>
                <div className="w-16 h-1.5 bg-indigo-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-indigo-500 dark:text-indigo-400">
                  {stats.percentage}%
                </span>
              </div>

              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400 transition-colors"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 pb-4">
            <div className="flex-1 relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-900 transition-colors"
              />
            </div>

            <div className="flex items-center gap-1">
              <Filter size={14} className="text-gray-400 dark:text-gray-500" />
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="px-2 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="all">All Levels</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <button
              onClick={toggleDarkMode}
              className="sm:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400 transition-colors"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={() => setIsAddingTopic(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add Topic</span>
            </button>
          </div>
        </div>
      </header>

      <Modal isOpen={isAddingTopic} onClose={() => setIsAddingTopic(false)} title="Add New Topic">
        <FormInput
          label="Topic Name"
          value={newTopicName}
          onChange={setNewTopicName}
          placeholder="e.g. Dynamic Programming"
          required
        />
        <div className="flex justify-end gap-2 mt-6">
          <FormButton variant="secondary" onClick={() => setIsAddingTopic(false)}>
            Cancel
          </FormButton>
          <FormButton onClick={handleAddTopic}>Add Topic</FormButton>
        </div>
      </Modal>
    </>
  );
}
