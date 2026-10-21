import {createHash} from 'node:crypto';

export class ImageStorageError extends Error {
  constructor(public readonly code:string, message:string, public readonly status=502) {
    super(message);this.name='ImageStorageError';
  }
}

function storageConfig() {
  const cloud=process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const key=process.env.CLOUDINARY_API_KEY?.trim();
  const secret=process.env.CLOUDINARY_API_SECRET?.trim();
  if(!cloud||!key||!secret)throw new ImageStorageError('STORAGE_NOT_CONFIGURED','Image storage is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in the Netlify Functions environment, then redeploy.',503);
  if(!/^[a-zA-Z0-9_-]+$/.test(cloud))throw new ImageStorageError('STORAGE_CONFIG_INVALID','CLOUDINARY_CLOUD_NAME must contain only the cloud name, not a URL. Check the Netlify Functions environment, then redeploy.',503);
  return {cloud,key,secret};
}

function storageRejection(status:number,message:string):ImageStorageError {
  // Classify the provider error, but never expose its raw text, API key or signature.
  if(/signature|timestamp|stale request/i.test(message))return new ImageStorageError('STORAGE_SIGNATURE_REJECTED','Cloudinary rejected upload authentication. Confirm that the API key and secret belong to the configured cloud, then redeploy.',503);
  if(status===401||/api[_ ]?key|unknown cloud|cloud.?name|credentials|authentication/i.test(message))return new ImageStorageError('STORAGE_CREDENTIALS_REJECTED','Cloudinary credentials were rejected. Check the cloud name, API key and API secret together in Netlify, then redeploy.',503);
  if(status===403)return new ImageStorageError('STORAGE_ACCESS_DENIED','Cloudinary denied this upload. Check that the configured API key has upload permission and that the cloud account is enabled.',503);
  if(status===429||/quota|limit exceeded|disabled|rate.?limit/i.test(message))return new ImageStorageError('STORAGE_LIMIT_REACHED','Image storage has reached an account or rate limit. Check Cloudinary usage and retry when uploads are available.',503);
  if(status===413||/file size|too large|maximum.*size/i.test(message))return new ImageStorageError('STORAGE_FILE_TOO_LARGE','Cloudinary rejected the image size. Try a smaller image.',400);
  if(/invalid image|unsupported.*(?:file|format)|image file|corrupt/i.test(message))return new ImageStorageError('STORAGE_IMAGE_REJECTED','Cloudinary could not read this image. Export it as JPG, PNG or WebP and try again.',400);
  return new ImageStorageError('STORAGE_UPLOAD_FAILED','Image storage could not accept the upload. Check the Cloudinary account status and retry.');
}

/** Server-only signed uploads; file validation and account authorization stay in the routes. */
export async function uploadImage(file:File,folder:'velaur-labs'|'velaur-labs/avatars') {
  const {cloud,key,secret}=storageConfig();
  const timestamp=String(Math.floor(Date.now()/1000));
  // The exact sorted fields sent below are signed. SHA-256 also supports SHA-256-only accounts.
  const signature=createHash('sha256').update(`folder=${folder}&timestamp=${timestamp}${secret}`).digest('hex');
  const payload=new FormData();payload.set('file',file);payload.set('api_key',key);payload.set('timestamp',timestamp);payload.set('folder',folder);payload.set('signature',signature);
  let response:Response;
  try { response=await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/image/upload`,{method:'POST',body:payload,cache:'no-store',signal:AbortSignal.timeout(15000)}); }
  catch(error){
    if(error instanceof Error&&['TimeoutError','AbortError'].includes(error.name))throw new ImageStorageError('STORAGE_TIMEOUT','Image storage took too long to respond. Please retry.',504);
    throw new ImageStorageError('STORAGE_UNREACHABLE','Image storage could not be reached. Please retry.');
  }
  const data=await response.json().catch(()=>null) as {secure_url?:unknown;public_id?:unknown;error?:{message?:unknown}}|null;
  if(!response.ok)throw storageRejection(response.status,typeof data?.error?.message==='string'?data.error.message:'');
  if(typeof data?.secure_url!=='string'||typeof data.public_id!=='string'||!data.public_id.trim())throw new ImageStorageError('STORAGE_INVALID_RESPONSE','Image storage returned an incomplete response. Your image has not been saved. Please retry.');
  try {const url=new URL(data.secure_url);if(url.protocol!=='https:'||url.username||url.password)throw Error('Invalid image URL');}
  catch {throw new ImageStorageError('STORAGE_INVALID_RESPONSE','Image storage returned an invalid image address. Your image has not been saved.');}
  return {secure_url:data.secure_url,public_id:data.public_id};
}
