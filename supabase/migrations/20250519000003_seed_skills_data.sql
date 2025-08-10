/*
  # Seed Skills Data
  
  This migration populates the skills table with realistic developer skills
  that would be expected in a professional portfolio.
  
  Note: These skills will be associated with a mock user ID for development.
  In production, you should replace the user_id with your actual user ID.
*/

-- Mock user ID for development (replace with your actual user ID in production)
DO $$
DECLARE
  mock_user_id uuid := '550e8400-e29b-41d4-a716-446655440000';
BEGIN
  -- Insert Frontend Development Skills
  INSERT INTO skills (name, category, proficiency, icon_name, user_id) VALUES
    ('React', 'Frontend Development', 9, 'react'),
    ('TypeScript', 'Frontend Development', 8, 'typescript'),
    ('JavaScript', 'Frontend Development', 9, 'javascript'),
    ('HTML5', 'Frontend Development', 9, 'html5'),
    ('CSS3', 'Frontend Development', 8, 'css3'),
    ('Tailwind CSS', 'Frontend Development', 8, 'tailwind'),
    ('Next.js', 'Frontend Development', 7, 'nextjs'),
    ('Vue.js', 'Frontend Development', 6, 'vuejs'),
    ('Sass/SCSS', 'Frontend Development', 7, 'sass'),
    ('Redux', 'Frontend Development', 7, 'redux');

  -- Insert Backend Development Skills
  INSERT INTO skills (name, category, proficiency, icon_name, user_id) VALUES
    ('Node.js', 'Backend Development', 8, 'nodejs'),
    ('Express.js', 'Backend Development', 8, 'express'),
    ('Python', 'Backend Development', 7, 'python'),
    ('Django', 'Backend Development', 6, 'django'),
    ('FastAPI', 'Backend Development', 6, 'fastapi'),
    ('Java', 'Backend Development', 6, 'java'),
    ('Spring Boot', 'Backend Development', 5, 'spring'),
    ('C#', 'Backend Development', 6, 'csharp'),
    ('ASP.NET Core', 'Backend Development', 5, 'dotnet'),
    ('GraphQL', 'Backend Development', 7, 'graphql');

  -- Insert Database Skills
  INSERT INTO skills (name, category, proficiency, icon_name, user_id) VALUES
    ('PostgreSQL', 'Database', 8, 'postgresql'),
    ('MongoDB', 'Database', 7, 'mongodb'),
    ('MySQL', 'Database', 6, 'mysql'),
    ('Redis', 'Database', 6, 'redis'),
    ('Supabase', 'Database', 8, 'supabase'),
    ('Firebase', 'Database', 7, 'firebase'),
    ('Prisma', 'Database', 7, 'prisma'),
    ('TypeORM', 'Database', 6, 'typeorm');

  -- Insert DevOps Skills
  INSERT INTO skills (name, category, proficiency, icon_name, user_id) VALUES
    ('Docker', 'DevOps', 7, 'docker'),
    ('Git', 'DevOps', 9, 'git'),
    ('GitHub Actions', 'DevOps', 6, 'github'),
    ('AWS', 'DevOps', 6, 'aws'),
    ('Vercel', 'DevOps', 8, 'vercel'),
    ('Netlify', 'DevOps', 7, 'netlify'),
    ('CI/CD', 'DevOps', 7, 'cicd'),
    ('Linux', 'DevOps', 6, 'linux');

  -- Insert Mobile Development Skills
  INSERT INTO skills (name, category, proficiency, icon_name, user_id) VALUES
    ('React Native', 'Mobile Development', 6, 'react'),
    ('Flutter', 'Mobile Development', 5, 'flutter'),
    ('Mobile UI/UX', 'Mobile Development', 7, 'mobile'),
    ('Responsive Design', 'Mobile Development', 8, 'responsive');

  -- Insert Tools & Technologies Skills
  INSERT INTO skills (name, category, proficiency, icon_name, user_id) VALUES
    ('VS Code', 'Tools & Technologies', 9, 'vscode'),
    ('Figma', 'Tools & Technologies', 6, 'figma'),
    ('Postman', 'Tools & Technologies', 7, 'postman'),
    ('Jest', 'Tools & Technologies', 7, 'jest'),
    ('Cypress', 'Tools & Technologies', 6, 'cypress'),
    ('Webpack', 'Tools & Technologies', 6, 'webpack'),
    ('Vite', 'Tools & Technologies', 8, 'vite'),
    ('npm/yarn', 'Tools & Technologies', 8, 'npm');

  -- Insert Soft Skills
  INSERT INTO skills (name, category, proficiency, icon_name, user_id) VALUES
    ('Problem Solving', 'Soft Skills', 9, 'problem-solving'),
    ('Team Collaboration', 'Soft Skills', 8, 'collaboration'),
    ('Communication', 'Soft Skills', 8, 'communication'),
    ('Time Management', 'Soft Skills', 7, 'time-management'),
    ('Agile/Scrum', 'Soft Skills', 7, 'agile'),
    ('Code Review', 'Soft Skills', 8, 'code-review'),
    ('Technical Writing', 'Soft Skills', 7, 'writing'),
    ('Mentoring', 'Soft Skills', 6, 'mentoring');

EXCEPTION
  WHEN duplicate_key_violation THEN
    -- Skills already exist, skip insertion
    NULL;
END $$;
