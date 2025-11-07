# Database Setup Instructions

## Settings ko Database mein Store karne ke liye:

### Step 1: Supabase Schema Run karein

Supabase dashboard mein jao aur `supabase/schema.sql` file ka content run karein:

1. Supabase Dashboard → SQL Editor
2. `supabase/schema.sql` file ka content copy karein
3. SQL Editor mein paste karein
4. "Run" button click karein

### Step 2: Environment Variables Set karein

`.env.local` file mein ye add karein:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 3: Verify Table Creation

SQL Editor mein ye query run karein:

```sql
SELECT * FROM public.user_settings LIMIT 5;
```

Agar table exist karti hai to settings database mein permanently save hongi.

### Important Notes:

- **Agar Supabase configured hai**: Settings database mein permanently save hongi
- **Agar Supabase configured nahi hai**: Settings in-memory storage mein save hongi (server restart ke baad clear ho jayengi)
- **RLS Policies**: Demo mode ke liye `user_id = '00000000-0000-0000-0000-000000000000'` allow kiya gaya hai

### Troubleshooting:

1. **Settings delete ho rahi hain**: Check karein ki Supabase properly configured hai
2. **Permission denied error**: RLS policies check karein
3. **Table doesn't exist**: `supabase/schema.sql` run karein

