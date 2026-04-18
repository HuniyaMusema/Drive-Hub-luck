require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function setupBucket() {
  const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
  
  if (listError) {
    console.error('Error listing buckets:', listError);
    return;
  }

  const lotteryBucket = buckets.find(b => b.name === 'lottery');

  if (!lotteryBucket) {
    console.log('Creating "lottery" bucket...');
    const { data, error } = await supabaseAdmin.storage.createBucket('lottery', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    });

    if (error) {
      console.error('Error creating bucket:', error);
    } else {
      console.log('Bucket "lottery" created successfully.');
    }
  } else {
    console.log('Bucket "lottery" already exists.');
    
    // Ensure it is public
    if (!lotteryBucket.public) {
        console.log('Updating bucket to be public...');
        const { error: updateError } = await supabaseAdmin.storage.updateBucket('lottery', { public: true });
        if (updateError) console.error('Error updating bucket:', updateError);
        else console.log('Bucket updated to public.');
    }
  }
}

setupBucket();
