import {createHmac, randomBytes, timingSafeEqual} from 'node:crypto';
import {db} from './db';

const settingKey = (userId:string) => `admin_2fa_recovery_${userId}`;
export function createRecoveryCodes() {
  return Array.from({length:10}, () => {
    const token = randomBytes(8).toString('hex').toUpperCase();
    return `${token.slice(0,4)}-${token.slice(4,8)}-${token.slice(8,12)}-${token.slice(12)}`;
  });
}
export function recoveryHash(code:string) {
  const secret=process.env.AUTH_SECRET;
  if(!secret || secret.length < 32) throw new Error('AUTH_SECRET must have at least 32 characters');
  return createHmac('sha256', secret).update(code.replace(/[-\s]/g,'').toUpperCase()).digest('hex');
}
export function hashedRecoveryCodes(codes:string[]) { return codes.map(recoveryHash); }
export async function consumeRecoveryCode(userId:string, code:string):Promise<boolean> {
  if(!/^(?:[a-fA-F0-9]{4}-?){4}$/.test(code))return false;
  const hash=recoveryHash(code);
  const client=await db.connect();
  try {
    await client.query('BEGIN');
    const result=await client.query<{setting_value:{hashes?:string[]}}>('SELECT setting_value FROM global_settings WHERE setting_key=$1 FOR UPDATE',[settingKey(userId)]);
    const hashes=result.rows[0]?.setting_value?.hashes;
    if(!Array.isArray(hashes)) {await client.query('ROLLBACK');return false;}
    const index=hashes.findIndex(value=>typeof value==='string' && value.length===hash.length && timingSafeEqual(Buffer.from(value,'hex'),Buffer.from(hash,'hex')));
    if(index<0) {await client.query('ROLLBACK');return false;}
    const remaining=hashes.filter((_,i)=>i!==index);
    await client.query('UPDATE global_settings SET setting_value=$2::jsonb,updated_at=NOW() WHERE setting_key=$1',[settingKey(userId),JSON.stringify({hashes:remaining})]);
    await client.query('COMMIT');
    return true;
  } catch(error) {await client.query('ROLLBACK').catch(()=>undefined);throw error;} finally {client.release();}
}
export async function recoveryCodeCount(userId:string):Promise<number> {
  const result=await db.query<{setting_value:{hashes?:string[]}}>('SELECT setting_value FROM global_settings WHERE setting_key=$1',[settingKey(userId)]);
  return Array.isArray(result.rows[0]?.setting_value?.hashes)?result.rows[0].setting_value.hashes.length:0;
}
export function recoverySettingKey(userId:string){return settingKey(userId);}
