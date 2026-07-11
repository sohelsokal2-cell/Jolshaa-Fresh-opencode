require('dotenv').config();
const supabase = require('../config/supabaseClient');

async function test() {
  console.log('Testing Supabase connection and auth signup...');
  try {
    const email = `test_${Date.now()}@example.com`;
    const password = 'Password123!';
    
    console.log(`Attempting signup for email: ${email}`);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.error('Auth signup failed:', authError.message);
      return;
    }

    console.log('Auth signup succeeded, user ID:', authData.user.id);

    // Try profiles insert
    const profileRow = {
      id: authData.user.id,
      name: 'Test User',
      email,
      phone: null,
      date_of_birth: '1990-01-01',
      gender: 'male',
    };

    console.log('Attempting profiles insert...');
    const { error: profileError } = await supabase
      .from('profiles')
      .insert(profileRow);

    if (profileError) {
      console.error('Profile insert failed:', profileError.message);
      return;
    }

    console.log('Profile insert succeeded! Connection is fully working.');
  } catch (err) {
    console.error('Unexpected error during test:', err.message);
  }
}

test();
