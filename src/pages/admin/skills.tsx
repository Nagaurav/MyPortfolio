import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { SectionHeader } from '../../components/ui/section-header';
import type { Database } from '../../types/database.types';

type Skill = Database['public']['Tables']['skills']['Row'];

interface SkillFormData {
  name: string;
  category: string;
  proficiency: number;
  icon_name: string;
}

const SKILL_CATEGORIES = [
  'Frontend Development',
  'Backend Development',
  'Mobile Development',
  'Database',
  'DevOps',
  'Tools & Technologies',
  'Soft Skills',
];

export function AdminSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  
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
      setValue('proficiency', editingSkill.proficiency);
      setValue('icon_name', editingSkill.icon_name || '');
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
        const { error } = await supabase
          .from('skills')
          .insert([{ ...data, user_id: (await supabase.auth.getUser()).data.user?.id }]);
        
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
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-secondary-700">
              Skill Name
            </label>
            <input
              type="text"
              id="name"
              className="mt-1 input"
              {...register('name', { required: 'Skill name is required' })}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-secondary-700">
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
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="proficiency" className="block text-sm font-medium text-secondary-700">
              Proficiency (1-10)
            </label>
            <input
              type="number"
              id="proficiency"
              min="1"
              max="10"
              className="mt-1 input"
              {...register('proficiency', {
                required: 'Proficiency is required',
                min: { value: 1, message: 'Minimum value is 1' },
                max: { value: 10, message: 'Maximum value is 10' },
              })}
            />
            {errors.proficiency && (
              <p className="mt-1 text-sm text-red-600">{errors.proficiency.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="icon_name" className="block text-sm font-medium text-secondary-700">
              Icon Name (emoji or icon class)
            </label>
            <input
              type="text"
              id="icon_name"
              className="mt-1 input"
              {...register('icon_name')}
            />
          </div>
          
          <div className="flex gap-4">
            <Button
              type="submit"
              isLoading={isSubmitting}
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
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-medium text-secondary-900">Skills List</h3>
        </div>
        
        <div className="border-t border-secondary-200">
          {loading ? (
            <div className="p-6 text-center">Loading...</div>
          ) : skills.length > 0 ? (
            <div className="divide-y divide-secondary-200">
              {skills.map((skill) => (
                <div key={skill.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center">
                        {skill.icon_name && (
                          <span className="mr-2 text-xl">{skill.icon_name}</span>
                        )}
                        <h4 className="text-lg font-medium text-secondary-900">
                          {skill.name}
                        </h4>
                      </div>
                      <p className="mt-1 text-sm text-secondary-500">
                        {skill.category}
                      </p>
                      <div className="mt-2">
                        <div className="w-full bg-secondary-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${skill.proficiency * 10}%` }}
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
          ) : (
            <div className="p-6 text-center text-secondary-500">
              No skills found. Add your first skill using the form above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}