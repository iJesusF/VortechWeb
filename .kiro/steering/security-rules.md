# Security Rules

## Authentication & Authorization
- Supabase Auth for admin authentication
- No public registration - admins created manually
- All `/admin` routes protected by middleware
- Row Level Security (RLS) enforced at database level
- Never trust frontend-only authorization checks

## Environment Variables
- Never commit secrets to the repository
- `SUPABASE_SERVICE_ROLE_KEY` is server-only, never exposed to client
- `NEXT_PUBLIC_*` prefix only for truly public values
- All sensitive values in `.env.local` (gitignored)

## Data Validation
- Validate all inputs on both client and server
- Use Zod for schema validation
- Sanitize user-generated content (HTML, markdown)
- File uploads: validate type, size, and generate unique names

## RLS Policies
- Anonymous users: SELECT only on active records
- Authenticated admins: full CRUD
- Storage policies match data access policies

## File Uploads
- Allowed types: image/jpeg, image/png, image/webp, image/avif
- Maximum file size: 5MB (configurable)
- Unique filenames using UUID
- Alt text required for accessibility
- Physical file deletion when record is deleted
