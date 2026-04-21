const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const supabase = require('../supabase');

const register = async (req, res, next) => {
  try {
    const { email, password, role, firstName, lastName, companyName, phone } = req.body;

    const { data: exists } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    if (exists) return res.status(409).json({ message: 'ელ-ფოსტა უკვე გამოყენებულია' });

    const passwordHash = await bcrypt.hash(password, 12);
    const { data: user, error } = await supabase
      .from('users')
      .insert({ email, password_hash: passwordHash, role, phone: phone || null })
      .select()
      .single();
    if (error) throw error;

    if (role === 'EMPLOYER') {
      await supabase.from('employer_profiles').insert({ user_id: user.id, company_name: companyName });
    } else {
      await supabase.from('candidate_profiles').insert({ user_id: user.id, first_name: firstName, last_name: lastName });
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    const displayName = role === 'EMPLOYER' ? companyName : firstName + ' ' + lastName;
    res.status(201).json({ token, role: user.role, displayName });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      return res.status(401).json({ message: 'არასწორი ელ-ფოსტა ან პაროლი' });

    let displayName = '';
    if (user.role === 'EMPLOYER') {
      const { data: profile } = await supabase
        .from('employer_profiles')
        .select('company_name')
        .eq('user_id', user.id)
        .maybeSingle();
      displayName = profile?.company_name || '';
    } else {
      const { data: profile } = await supabase
        .from('candidate_profiles')
        .select('first_name, last_name')
        .eq('user_id', user.id)
        .maybeSingle();
      displayName = ((profile?.first_name || '') + ' ' + (profile?.last_name || '')).trim();
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role, isAdmin: user.is_admin });
    res.json({ token, role: user.role, displayName, isAdmin: user.is_admin });
  } catch (err) { next(err); }
};

module.exports = { register, login };
