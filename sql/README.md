# Society Arts - Database Migrations

## Migration Strategy

All migrations in this folder are **SAFE** to run multiple times:
- Uses `CREATE TABLE IF NOT EXISTS`
- Uses `CREATE INDEX IF NOT EXISTS`
- Uses `DROP POLICY IF EXISTS` before `CREATE POLICY`
- Uses `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`
- Uses `ON CONFLICT DO NOTHING` for inserts
- Uses `CREATE OR REPLACE` for functions and views

## Execution Order

Run the files in numerical order:

1. **01-auth-schema.sql** - User profiles, roles, and authentication
2. **02-projects-schema.sql** - User projects and favorites
3. **03-user-preferences.sql** - User preference columns
4. **04-v19-fixes.sql** - RLS fixes and collections table
5. **05-style-attributes.sql** - Style classification for faceted search

## Running Migrations

### Option 1: Automated (using sql_update.bat)
Place the ZIP file next to `sql_update.bat` and double-click to run all migrations automatically.

### Option 2: Manual (Supabase SQL Editor)
1. Go to Supabase Dashboard → SQL Editor
2. Copy/paste each file's contents in order
3. Click "Run" for each file

### Option 3: psql Command Line
```bash
psql "postgresql://postgres.[PROJECT]:[PASSWORD]@[HOST]:5432/postgres" -f 01-auth-schema.sql
psql "postgresql://postgres.[PROJECT]:[PASSWORD]@[HOST]:5432/postgres" -f 02-projects-schema.sql
# ... etc
```

## Notes

- All files include a `SELECT 'Migration completed!'` at the end for confirmation
- If you see `NOTICE: relation already exists, skipping` - that's normal and safe
- These migrations are additive - they won't delete existing data
