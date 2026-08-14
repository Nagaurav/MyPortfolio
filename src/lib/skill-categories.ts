import { Code2, Database as DatabaseIcon, Server, Smartphone, Wrench, Brain, Cloud } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface CategoryMeta {
  icon: LucideIcon;
  label: string;
  hint: string;
}

/**
 * Presentation for a skill category. Categories are free text typed in the
 * admin form, so the same idea arrives under several spellings ("Frontend",
 * "Frontend Development"); each variant maps to one shared look and label.
 *
 * Shared by the Skills page and the Home page skills section so the two can
 * never drift apart.
 */
export const CATEGORY_META: Record<string, CategoryMeta> = {
  'Frontend Development': { icon: Code2, label: 'Frontend', hint: 'UI, design systems, motion' },
  Frontend: { icon: Code2, label: 'Frontend', hint: 'UI, design systems, motion' },
  'Backend Development': { icon: Server, label: 'Backend', hint: 'APIs, services, business logic' },
  Backend: { icon: Server, label: 'Backend', hint: 'APIs, services, business logic' },
  'Backend & Python Development': {
    icon: Server,
    label: 'Backend & Python',
    hint: 'APIs, services, business logic',
  },
  'Mobile Development': { icon: Smartphone, label: 'Mobile', hint: 'Cross-platform apps' },
  Mobile: { icon: Smartphone, label: 'Mobile', hint: 'Cross-platform apps' },
  Database: { icon: DatabaseIcon, label: 'Database', hint: 'Schema, queries, scale' },
  Databases: { icon: DatabaseIcon, label: 'Database', hint: 'Schema, queries, scale' },
  'AI / Machine Learning': {
    icon: Brain,
    label: 'AI / Machine Learning',
    hint: 'Models, inference, pipelines',
  },
  Cloud: { icon: Cloud, label: 'Cloud', hint: 'Hosting, storage, serverless' },
  'Cloud & DevOps': { icon: Cloud, label: 'Cloud & DevOps', hint: 'Hosting and delivery' },
  'Tools & Design': { icon: Wrench, label: 'Tools & Design', hint: 'Editor, API client, design' },
  DevOps: { icon: Wrench, label: 'DevOps', hint: 'Deploy, infra, CI/CD' },
  'Development Tools': { icon: Wrench, label: 'Development Tools', hint: 'Editor, version control, glue' },
  'Tools & Technologies': { icon: Wrench, label: 'Tools', hint: 'Editor, version control, glue' },
  'Tools & DevOps': { icon: Wrench, label: 'Tools & DevOps', hint: 'Tooling and deployment' },
  Tools: { icon: Wrench, label: 'Tools', hint: 'Editor, version control, glue' },
  'Soft Skills': { icon: Brain, label: 'Soft Skills', hint: 'How I work with people' },
  'Core Skills': { icon: Brain, label: 'Core Skills', hint: 'How I approach the work' },
};

/** Reading order by display label; anything unrecognised sorts to the end. */
const LABEL_ORDER = [
  'Frontend',
  'Mobile',
  'Backend & Python',
  'Backend',
  'Database',
  'AI / Machine Learning',
  'Cloud',
  'Cloud & DevOps',
  'DevOps',
  'Development Tools',
  'Tools & Design',
  'Tools',
  'Tools & DevOps',
  'Core Skills',
  'Soft Skills',
];

/**
 * Categories describing how someone works rather than what they build. The Home
 * page's tech section excludes these -- "Problem Solving" is not part of a tech
 * stack, and listing it under that heading misdescribes it. They still appear
 * in full on the Skills page.
 */
const NON_TECH_LABELS = ['Core Skills', 'Soft Skills'];

export function isTechCategory(category: string): boolean {
  return !NON_TECH_LABELS.includes(categoryMeta(category).label);
}

export function categoryMeta(category: string): CategoryMeta {
  // Unknown categories still render -- with the raw name and a neutral icon --
  // rather than being dropped from the page.
  return CATEGORY_META[category] ?? { icon: Wrench, label: category, hint: '' };
}

/**
 * Orders categories front-of-stack first rather than alphabetically, so the
 * list reads the way people describe their own work.
 */
export function sortCategories(categories: string[]): string[] {
  const rank = (category: string) => {
    const index = LABEL_ORDER.indexOf(categoryMeta(category).label);
    return index === -1 ? LABEL_ORDER.length : index;
  };
  return [...categories].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}
