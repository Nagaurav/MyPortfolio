import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Pencil, Trash2, Mail, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { SectionHeader } from '../../components/ui/section-header';
import type { Database } from '../../types/database.types';

type Contact = Database['public']['Tables']['contacts']['Row'];

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function AdminContactPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchContacts();
  }, []);
  
  async function fetchContacts() {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load contact messages');
    } finally {
      setLoading(false);
    }
  }
  
  const handleMarkAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ read: true })
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Message marked as read');
      fetchContacts();
    } catch (error) {
      console.error('Error updating contact:', error);
      toast.error('Failed to update message status');
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Message deleted successfully');
      fetchContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete message');
    }
  };
  
  return (
    <div>
      <SectionHeader
        title="Contact Messages"
        subtitle="Manage incoming contact form messages"
      />
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-secondary-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-secondary-900">Messages</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
              {contacts.filter(c => !c.read).length} Unread
            </span>
          </div>
        </div>
        
        <div>
          {loading ? (
            <div className="p-6 text-center">Loading...</div>
          ) : contacts.length > 0 ? (
            <div className="divide-y divide-secondary-200">
              {contacts.map((contact) => (
                <div 
                  key={contact.id} 
                  className={`p-6 ${!contact.read ? 'bg-primary-50' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center">
                        <h4 className="text-lg font-medium text-secondary-900">
                          {contact.subject}
                        </h4>
                        {!contact.read && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            New
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-secondary-500">
                        From: {contact.name} ({contact.email})
                      </p>
                      <p className="mt-2 text-sm text-secondary-600">
                        {contact.message}
                      </p>
                      <p className="mt-2 text-xs text-secondary-400">
                        Received: {new Date(contact.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-secondary-400 hover:text-secondary-500"
                      >
                        <Mail size={20} />
                      </a>
                      {!contact.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(contact.id)}
                        >
                          <Check size={16} />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(contact.id)}
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
              No messages found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}