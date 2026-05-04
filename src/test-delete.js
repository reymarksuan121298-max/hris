import { supabase } from '../supabaseClient';

async function testDelete() {
  console.log('Testing Deletion Logic');
  const { data, error } = await supabase.from('cases').insert([{ case_name: 'TEST DELETE', area: 'TEST', status: 'OPEN' }]).select();
  if (error) {
    console.error('Insert failed:', error);
    return;
  }
  const id = data[0].id;
  console.log('Inserted test case with ID:', id);
  
  const { error: delError } = await supabase.from('cases').delete().eq('id', id);
  if (delError) {
    console.error('Delete failed:', delError);
  } else {
    console.log('Delete call succeeded (Supabase returned no error)');
  }
  
  const { data: finalData } = await supabase.from('cases').select('*').eq('id', id);
  if (finalData && finalData.length > 0) {
    console.warn('DELETE FAILED SILENTLY! Row still exists. Likely an RLS or policy issue.');
  } else {
    console.log('Delete truly successful! Row no longer exists.');
  }
}

testDelete();
