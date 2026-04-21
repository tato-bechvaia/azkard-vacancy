const supabase = require('../supabase');

const getMyProfile = async (req, res, next) => {
  try {
    if (req.user.role === 'CANDIDATE') {
      const { data: profile, error } = await supabase
        .from('candidate_profiles')
        .select('*, users!user_id(email, phone)')
        .eq('user_id', req.user.id)
        .maybeSingle();
      if (error) throw error;
      if (!profile) return res.status(404).json({ message: 'პროფილი ვერ მოიძებნა' });

      res.json({
        id: profile.id,
        userId: profile.user_id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        headline: profile.headline,
        location: profile.location,
        cvUrl: profile.cv_url,
        avatarUrl: profile.avatar_url,
        user: { email: profile.users?.email, phone: profile.users?.phone },
      });
    } else {
      const { data: profile, error } = await supabase
        .from('employer_profiles')
        .select('*, users!user_id(email, phone)')
        .eq('user_id', req.user.id)
        .maybeSingle();
      if (error) throw error;
      if (!profile) return res.status(404).json({ message: 'პროფილი ვერ მოიძებნა' });

      res.json({
        id: profile.id,
        userId: profile.user_id,
        companyName: profile.company_name,
        description: profile.description,
        website: profile.website,
        logoUrl: profile.logo_url,
        avatarUrl: profile.avatar_url,
        user: { email: profile.users?.email, phone: profile.users?.phone },
      });
    }
  } catch (err) { next(err); }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const { phone, ...profileData } = req.body;

    if (phone) {
      await supabase.from('users').update({ phone }).eq('id', req.user.id);
    }

    if (req.user.role === 'CANDIDATE') {
      // Map camelCase → snake_case
      const data = {};
      const map = { firstName: 'first_name', lastName: 'last_name', cvUrl: 'cv_url', avatarUrl: 'avatar_url' };
      for (const [k, v] of Object.entries(profileData)) data[map[k] || k] = v;

      const { data: profile, error } = await supabase
        .from('candidate_profiles')
        .update(data)
        .eq('user_id', req.user.id)
        .select()
        .single();
      if (error) throw error;

      res.json({
        id: profile.id,
        userId: profile.user_id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        headline: profile.headline,
        location: profile.location,
        cvUrl: profile.cv_url,
        avatarUrl: profile.avatar_url,
      });
    } else {
      const data = {};
      const map = { companyName: 'company_name', logoUrl: 'logo_url', avatarUrl: 'avatar_url' };
      for (const [k, v] of Object.entries(profileData)) data[map[k] || k] = v;

      const { data: profile, error } = await supabase
        .from('employer_profiles')
        .update(data)
        .eq('user_id', req.user.id)
        .select()
        .single();
      if (error) throw error;

      res.json({
        id: profile.id,
        userId: profile.user_id,
        companyName: profile.company_name,
        description: profile.description,
        website: profile.website,
        logoUrl: profile.logo_url,
        avatarUrl: profile.avatar_url,
      });
    }
  } catch (err) { next(err); }
};

module.exports = { getMyProfile, updateMyProfile };
