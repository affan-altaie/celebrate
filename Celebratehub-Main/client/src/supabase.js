
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qqddrkntojdmurgkhirw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxZGRya250b2pkbXVyZ2toaXJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNTg3NzksImV4cCI6MjA4ODczNDc3OX0.b941ZQpJH9haXHBPiNTHCqtqNaLaPC1wDpfCpztD5ng'
const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase
