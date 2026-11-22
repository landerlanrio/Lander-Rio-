import { CONFIG } from './config.js';
const key=k=>CONFIG.LOCAL_STORAGE_PREFIX+k;
export const save=(k,v)=>{try{localStorage.setItem(key(k),JSON.stringify(v));return true}catch{return false}};
export const load=(k,fallback=null)=>{try{return JSON.parse(localStorage.getItem(key(k)))??fallback}catch{return fallback}};
export const clearAll=()=>{try{Object.keys(localStorage).filter(k=>k.startsWith(CONFIG.LOCAL_STORAGE_PREFIX)).forEach(k=>{try{localStorage.removeItem(k)}catch{}});return true}catch{return false}};
