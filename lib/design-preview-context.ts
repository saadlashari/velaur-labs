import {AsyncLocalStorage} from 'node:async_hooks';
export const designPreviewContext=new AsyncLocalStorage<Record<string,string>>();
