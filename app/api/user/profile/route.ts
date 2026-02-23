import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data || null });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: user.id,
      family_members: body.family_members || [],
      preferred_airlines: body.preferred_airlines || [],
      preferred_hotel_rating: body.preferred_hotel_rating || 4,
      preferred_amenities: body.preferred_amenities || [],
      departure_city: body.departure_city || 'Mumbai',
      preferred_flight_time: body.preferred_flight_time || 'morning',
      budget_preference: body.budget_preference || 'mid_range',
      learned_preferences: body.learned_preferences || {},
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id'
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}
