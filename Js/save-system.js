window.SaveSystem = (() => {
  const STORAGE_KEY='careerStory.saves.v1';
  const BACKUP_KEY='careerStory.saves.backup.v1';
  const SCHEMA_VERSION=1;
  const MAX_SLOTS=4;

  function emptyStore(){return {schemaVersion:SCHEMA_VERSION,updatedAt:new Date().toISOString(),slots:Array(MAX_SLOTS).fill(null)}}
  function normalize(store){
    if(!store||!Array.isArray(store.slots))return emptyStore();
    const slots=Array(MAX_SLOTS).fill(null).map((_,i)=>store.slots[i]||null);
    return {schemaVersion:SCHEMA_VERSION,updatedAt:store.updatedAt||new Date().toISOString(),slots};
  }
  function loadStore(){
    try{
      const raw=localStorage.getItem(STORAGE_KEY);
      if(!raw)return emptyStore();
      return normalize(JSON.parse(raw));
    }catch(err){
      console.warn('Primary save read failed, attempting backup.',err);
      try{return normalize(JSON.parse(localStorage.getItem(BACKUP_KEY)||''));}catch{return emptyStore();}
    }
  }
  function writeStore(store){
    const normalized=normalize(store);
    normalized.updatedAt=new Date().toISOString();
    try{
      const current=localStorage.getItem(STORAGE_KEY);
      if(current)localStorage.setItem(BACKUP_KEY,current);
      localStorage.setItem(STORAGE_KEY,JSON.stringify(normalized));
      return true;
    }catch(err){console.error('Save failed',err);return false;}
  }
  function list(){return loadStore().slots.map((career,index)=>career?{index,career}: {index,career:null})}
  function get(index){const s=loadStore();return s.slots[index]?GameUtils.deepClone(s.slots[index]):null}
  function save(index,career){
    if(index<0||index>=MAX_SLOTS||!career)return false;
    const s=loadStore();
    career.meta=career.meta||{};
    career.meta.schemaVersion=SCHEMA_VERSION;
    career.meta.lastSavedAt=new Date().toISOString();
    career.meta.slot=index;
    s.slots[index]=GameUtils.deepClone(career);
    return writeStore(s);
  }
  function remove(index){const s=loadStore();if(index<0||index>=MAX_SLOTS)return false;s.slots[index]=null;return writeStore(s)}
  function exportCareer(index){const c=get(index);return c?JSON.stringify(c,null,2):null}
  return {SCHEMA_VERSION,MAX_SLOTS,list,get,save,remove,exportCareer};
})();
