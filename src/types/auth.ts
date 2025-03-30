
import { User as SupabaseUser } from '@supabase/supabase-js';
import { UserType } from '@/contexts/AuthContext';

// Extended user type that includes our custom fields
export interface ExtendedUser extends SupabaseUser {
  userType?: UserType;
  fullName?: string;
  clubName?: string;
  clubRole?: string;
}
