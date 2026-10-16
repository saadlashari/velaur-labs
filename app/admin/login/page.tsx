'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, KeyRound, LoaderCircle, LockKeyhole, ShieldCheck } from 'lucide-react';

type Mode = 'login' | 'setup' | 'verify' | 'recovery';

export default function AdminLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [bootstrapSecret, setBootstrapSecret] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function post(url: string, body: object, headers?: Record<string, string>) {
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Request failed.');
    return result;
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError(''); setMessage('');
    try {
      await post('/api/auth/login', { email, password, code: otp });
      router.replace('/admin'); router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not sign in.';
      setError(msg);
      if (msg.includes('two-factor authentication must be enrolled')) setMessage('If this is your first setup, use “Set up first Super Admin” and follow the authenticator steps.');
    } finally { setLoading(false); }
  }

  async function handleBootstrap(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError(''); setMessage('');
    try {
      const result = await post('/api/auth/bootstrap', { email, displayName, password }, { 'x-bootstrap-secret': bootstrapSecret });
      setTotpSecret(result.totpSecret);
      setMode('verify');
      setMessage('Administrator created. Add this secret to an authenticator app, then enter its current six-digit code.');
    } catch (err) { setError(err instanceof Error ? err.message : 'Initial setup failed.'); }
    finally { setLoading(false); }
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError('');
    try {
      const result = await post('/api/auth/setup-2fa', { email, code: otp }, { 'x-bootstrap-secret': bootstrapSecret });
      setRecoveryCodes(Array.isArray(result.recoveryCodes) ? result.recoveryCodes : []);
      setMessage('Two-factor authentication enabled. Save your recovery codes before continuing.');
      setMode('recovery'); setOtp(''); setPassword(''); setBootstrapSecret(''); setTotpSecret('');
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not verify authenticator.'); }
    finally { setLoading(false); }
  }

  return <main className="admin-login-shell"><section className="admin-login-card">
    <div className="login-brand"><div className="brand-mark" aria-hidden="true"><span/><span/><span/><span/></div><div><strong>VELAUR <span>LABS</span></strong><small>ADMIN CONSOLE</small></div></div>
    <div className="login-heading"><span className="login-icon"><ShieldCheck size={21}/></span><span className="eyebrow">SECURE WORKSPACE</span><h1>{mode === 'setup' ? 'Create your Super Admin' : mode === 'verify' ? 'Secure your account' : mode === 'recovery' ? 'Save your recovery codes' : 'Welcome back.'}</h1><p>{mode === 'setup' ? 'One-time initial setup. You will need the server-side bootstrap secret.' : mode === 'verify' ? 'Super Admin accounts require authenticator-based two-factor authentication.' : mode === 'recovery' ? 'These ten codes appear only once. Keep them offline in a secure place.' : 'Sign in to manage the VELAUR LABS website and workspace.'}</p></div>

    {mode === 'login' && <form className="admin-login-form" onSubmit={handleLogin}>
      <label>Email address<input type="email" required autoComplete="username" maxLength={254} value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@velaurlabs.com"/></label>
      <label>Password<span className="password-field"><input required type={showPassword ? 'text' : 'password'} autoComplete="current-password" maxLength={200} value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password"/><button type="button" className="password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></span></label>
      <label>Authenticator or recovery code <input inputMode="numeric" maxLength={19} autoComplete="one-time-code" value={otp} onChange={e => setOtp(e.target.value.toUpperCase().replace(/[^0-9A-F-]/g, '').slice(0,19))} placeholder="6-digit code or recovery code"/></label>
      <button className="login-submit" type="submit" disabled={loading}>{loading ? <LoaderCircle className="spin-icon" size={17}/> : <>Sign in <ArrowRight size={16}/></>}</button>
      <button type="button" className="login-secondary" onClick={() => { setMode('setup'); setError(''); setMessage(''); }}>Set up first Super Admin</button>
    </form>}

    {mode === 'setup' && <form className="admin-login-form" onSubmit={handleBootstrap}>
      <label>Display name<input required maxLength={100} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name"/></label>
      <label>Admin email<input type="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@velaurlabs.com"/></label>
      <label>Password (minimum 12 characters)<span className="password-field"><input required minLength={12} maxLength={200} type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a strong password"/><button type="button" className="password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></span></label>
      <label>Bootstrap secret<input required type="password" autoComplete="off" value={bootstrapSecret} onChange={e => setBootstrapSecret(e.target.value)} placeholder="Set on server; never commit it"/></label>
      <button className="login-submit" type="submit" disabled={loading}>{loading ? <LoaderCircle className="spin-icon" size={17}/> : <>Create Super Admin <ArrowRight size={16}/></>}</button>
      <button type="button" className="login-secondary" onClick={() => { setMode('login'); setError(''); }}>Back to sign in</button>
    </form>}

    {mode === 'verify' && <form className="admin-login-form" onSubmit={handleVerify}>
      <div className="totp-secret-box"><KeyRound size={17}/><div><small>Authenticator setup key — shown once</small><strong>{totpSecret}</strong></div><button type="button" onClick={() => navigator.clipboard?.writeText(totpSecret)}>Copy</button></div>
      <p className="login-help">Open an authenticator app (for example, Google Authenticator, Microsoft Authenticator or 1Password) and add a new account using this key. Store it securely.</p>
      <label>Six-digit authenticator code<input required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000"/></label>
      <button className="login-submit" type="submit" disabled={loading || otp.length !== 6}>{loading ? <LoaderCircle className="spin-icon" size={17}/> : <>Verify and enable 2FA <ArrowRight size={16}/></>}</button>
    </form>}

    {mode === 'recovery' && <section className="admin-login-form" aria-label="One-time recovery codes">
      <p className="login-help"><strong>Save these codes now.</strong> Each can be used only once if your authenticator is unavailable. They cannot be recovered later.</p>
      <div className="totp-secret-box" style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:10}}>{recoveryCodes.map(code=><code key={code} style={{overflowWrap:'anywhere'}}>{code}</code>)}</div>
      <button type="button" className="login-secondary" onClick={()=>{
        const blob=new Blob([`VELAUR LABS recovery codes\nAccount: ${email}\nGenerated: ${new Date().toISOString()}\n\n${recoveryCodes.join('\n')}\n`],{type:'text/plain'});
        const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='velaur-recovery-codes.txt';a.click();URL.revokeObjectURL(url);
      }}>Save recovery codes as text</button>
      <button type="button" className="login-submit" onClick={()=>{setRecoveryCodes([]);setMode('login');setMessage('Sign in with your password and authenticator or one of your recovery codes.');}}>I have saved my codes — continue</button>
    </section>}

    {error && <p className="login-error" role="alert"><LockKeyhole size={15}/>{error}</p>}
    {message && <p className="login-message" role="status">{message}</p>}
    <div className="login-security-note"><LockKeyhole size={14}/><span>Protected admin area · HttpOnly sessions · Role-based access</span></div>
  </section><footer className="login-footer">© 2026 VELAUR LABS · Where Creativity Meets Technology</footer></main>;
}
