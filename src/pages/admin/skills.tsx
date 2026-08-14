import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { SectionHeader } from '../../components/ui/section-header';
import { cn } from '../../lib/utils';
import { sortCategories } from '../../lib/skill-categories';
import type { Database } from '../../types/database.types';

type Skill = Database['public']['Tables']['skills']['Row'];

interface SkillFormData {
  name: string;
  category: string;
  proficiency: number;
}

// Order here matches the order these render in on the public pages -- see
// LABEL_ORDER in lib/skill-categories.ts. Any value added here also needs an
// entry in CATEGORY_META there, or it falls back to a generic wrench icon.
const SKILL_CATEGORIES = [
  'Frontend Development',
  'Mobile Development',
  'Backend Development',
  'Databases',
  'AI / Machine Learning',
  'Cloud & DevOps',
  'Tools & Design',
];

export function AdminSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Only categories that actually hold a skill -- offering the full
  // SKILL_CATEGORIES list would show filters that match nothing.
  const usedCategories = useMemo(
    () => sortCategories(Array.from(new Set(skills.map((s) => s.category)))),
    [skills]
  );

  const countsByCategory = useMemo(() => {
    return skills.reduce<Record<string, number>>((acc, s) => {
      acc[s.category] = (acc[s.category] || 0) + 1;
      return acc;
    }, {});
  }, [skills]);

  const filteredSkills = useMemo(() => {
    const q = query.trim().toLowerCase();
    return skills.filter((s) => {
      const categoryOk = !activeCategory || s.category === activeCategory;
      const queryOk =
        !q || s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
      return categoryOk && queryOk;
    });
  }, [skills, query, activeCategory]);

  const filtersActive = Boolean(activeCategory) || query.trim().length > 0;

  const clearFilters = () => {
    setQuery('');
    setActiveCategory(null);
  };


  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SkillFormData>();
  
  useEffect(() => {
    fetchSkills();
  }, []);
  
  useEffect(() => {
    if (editingSkill) {
      setValue('name', editingSkill.name);
      setValue('category', editingSkill.category);
      setValue('proficiency', editingSkill.proficiency ?? 0);
    }
  }, [editingSkill, setValue]);
  
  async function fetchSkills() {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('category', { ascending: true })
        .order('proficiency', { ascending: false });
      
      if (error) throw error;
      
      setSkills(data || []);
    } catch (error) {
      console.error('Error fetching skills:', error);
      toast.error('Failed to load skills');
    } finally {
      setLoading(false);
    }
  }
  
  const onSubmit = async (data: SkillFormData) => {
    try {
      if (editingSkill) {
        const { error } = await supabase
          .from('skills')
          .update(data)
          .eq('id', editingSkill.id);
        
        if (error) throw error;
        
        toast.success('Skill updated successfully');
      } else {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user?.id) {
          toast.error('User not authenticated');
          return;
        }

        const { error } = await supabase
          .from('skills')
          .insert([{ ...data, user_id: userData.user.id }]);
        
        if (error) throw error;
        
        toast.success('Skill created successfully');
      }
      
      reset();
      setEditingSkill(null);
      fetchSkills();
    } catch (error) {
      console.error('Error saving skill:', error);
      toast.error('Failed to save skill');
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;
    
    try {
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Skill deleted successfully');
      fetchSkills();
    } catch (error) {
      console.error('Error deleting skill:', error);
      toast.error('Failed to delete skill');
    }
  };
  
  return (
    <div>
      <SectionHeader
        title={editingSkill ? 'Edit Skill' : 'Add New Skill'}
        subtitle="Manage your skills and proficiency levels"
      />
      
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow p-6 mb-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
              Skill Name
            </label>
            <input
              type="text"
              id="name"
              className="mt-1 input"
              {...register('name', { required: 'Skill name is required' })}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
              Category
            </label>
            <select
              id="category"
              className="mt-1 input"
              {...register('category', { required: 'Category is required' })}
            >
              <option value="">Select a category</option>
              {SKILL_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="proficiency" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200">
              Proficiency (1-5)
            </label>
            <input
              type="number"
              id="proficiency"
              min="1"
              max="5"
              className="mt-1 input"
              {...register('proficiency', {
                required: 'Proficiency is required',
                min: { value: 1, message: 'Minimum value is 1' },
                max: { value: 5, message: 'Maximum value is 5' },
              })}
            />
            {errors.proficiency && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.proficiency.message}</p>
            )}
          </div>
          
          <div className="flex gap-4">
            <Button
              type="submit"
              loading={isSubmitting}
              leftIcon={editingSkill ? <Pencil size={16} /> : <Plus size={16} />}
            >
              {editingSkill ? 'Update Skill' : 'Add Skill'}
            </Button>
            
            {editingSkill && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditingSkill(null);
                  reset();
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>
      
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-lg font-medium text-secondary-900 dark:text-white">Skills List</h3>
            <span className="text-sm text-secondary-500 dark:text-secondary-400">
              {filtersActive
                ? `${filteredSkills.length} of ${skills.length}`
                : `${skills.length} ${skills.length === 1 ? 'skill' : 'skills'}`}
            </span>
          </div>

          {skills.length > 0 && (
            <>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
                  size={16}
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by skill or category…"
                  className="input pl-9 pr-9"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-200"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                <FilterChip
                  active={!activeCategory}
                  onClick={() => setActiveCategory(null)}
                  label="All"
                  count={skills.length}
                />
                {usedCategories.map((category) => (
                  <FilterChip
                    key={category}
                    active={activeCategory === category}
                    // Clicking the active chip clears it, so the filter can be
                    // undone without hunting for the All button.
                    onClick={() =>
                      setActiveCategory((current) => (current === category ? null : category))
                    }
                    label={category}
                    count={countsByCategory[category] ?? 0}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="border-t border-secondary-200 dark:border-secondary-700">
          {loading ? (
            <div className="p-6 text-center text-secondary-500 dark:text-secondary-400">Loading...</div>
          ) : filteredSkills.length > 0 ? (
            <div className="divide-y divide-secondary-200 dark:divide-secondary-700">
              {filteredSkills.map((skill) => (
                <div key={skill.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center">
                        <h4 className="text-lg font-medium text-secondary-900 dark:text-white">
                          {skill.name}
                        </h4>
                      </div>
                      <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
                        {skill.category}
                      </p>
                      <div className="mt-2">
                        <div className="flex justify-between text-sm text-secondary-600 dark:text-secondary-300 mb-1">
                          <span>Proficiency</span>
                          <span>{Math.round(((skill.proficiency ?? 0) / 5) * 100)}%</span>
                        </div>
                        <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${((skill.proficiency ?? 0) / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingSkill(skill)}
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(skill.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filtersActive ? (
            // Distinct from the empty-table case: the skills exist, the filters
            // just hid them, so offer a way back rather than telling the user to
            // add their first skill.
            <div className="p-6 text-center">
              <p className="text-secondary-500 dark:text-secondary-400">
                No skills match {query.trim() ? `"${query.trim()}"` : 'this filter'}
                {activeCategory && query.trim() ? ` in ${activeCategory}` : ''}.
              </p>
              <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="p-6 text-center text-secondary-500 dark:text-secondary-400">
              No skills found. Add your first skill using the form above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'border-brand-500 bg-brand-500 text-white shadow-sm'
          : 'border-secondary-200 bg-white text-secondary-700 hover:bg-secondary-100 dark:border-secondary-700 dark:bg-secondary-900/60 dark:text-secondary-200 dark:hover:bg-secondary-800/60'
      )}
    >
      {label}
      <span
        className={cn(
          'rounded px-1 text-xs font-mono',
          active ? 'bg-white/20' : 'bg-secondary-100 dark:bg-secondary-800'
        )}
      >
        {count}
      </span>
    </button>
  );
}