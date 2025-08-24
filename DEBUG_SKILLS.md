# Skills Debugging Guide

## 🚨 Issue: Skills Not Displaying

Your skills section is not showing data even though skills exist in the backend.

## 🔍 Root Cause Analysis

### Problem 1: User ID Mismatch
- **Seed data** uses mock user ID: `550e8400-e29b-41d4-a716-446655440000`
- **Your actual user ID** is different
- Skills exist but are associated with wrong user

### Problem 2: Category Mismatch
- **Seed data** includes "Tools & Technologies" category
- **Frontend** was missing this category (now fixed)

## ✅ Solutions

### Solution 1: Fix User ID in Database (Recommended)

1. **Find your actual user ID:**
   ```sql
   SELECT id, email FROM profiles LIMIT 5;
   ```

2. **Update skills to use your user ID:**
   ```sql
   UPDATE skills 
   SET user_id = 'YOUR_ACTUAL_USER_ID'
   WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';
   ```

3. **Verify the update:**
   ```sql
   SELECT COUNT(*) as total_skills, user_id FROM skills GROUP BY user_id;
   ```

### Solution 2: Use the Migration File

1. **Edit** `supabase/migrations/20250520000000_fix_skills_user_id.sql`
2. **Replace** `'your-email@example.com'` with your actual email
3. **Run** the migration in Supabase

### Solution 3: Check Console Logs

I've added debugging to the skills page. Check your browser console for:
- Total skills in database
- Sample skills data
- Any fetch errors

## 🔧 Quick Fix Steps

1. **Open browser console** on skills page
2. **Look for console logs** showing skills data
3. **Check for errors** in the console
4. **Update user ID** in database using Solution 1
5. **Refresh page** to see skills

## 📊 Expected Console Output

```
Fetching skills...
Total skills in database: 67
Sample skills: [Array(3)]
Fetched skills for display: 67
Skills data: [Array(67)]
```

## 🚀 Next Steps

1. **Check console logs** first
2. **Fix user ID** in database
3. **Test skills page**
4. **Remove debugging code** once fixed

## 💡 Alternative: Make Skills Truly Public

If you want skills to be visible regardless of user ID, you could modify the RLS policy:

```sql
-- This would make ALL skills visible to everyone
DROP POLICY "Public skills are viewable by everyone" ON skills;
CREATE POLICY "All skills are viewable by everyone"
    ON skills FOR SELECT
    USING (true);
```

But the recommended approach is to fix the user ID association.
