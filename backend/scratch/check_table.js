require('dotenv').config();
const supabase = require('../config/supabaseClient');

async function checkTable() {
  console.log('Checking if profiles table is reachable...');
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error reading profiles table:', error.message);
    } else {
      console.log('Profiles table is reachable. Current rows:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err.message);
  }
}

checkTable();
