import { useEffect, useState } from "react";
import { geocodeSearch } from "../lib/api";


export default function GeocoderSearch(
  { onSelect }: { onSelect: (lat:number, lng:number, label:string)=>void }
){
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Array<{lat:number;lng:number;label:string}>>([]);

  useEffect(()=>{
    if(!q){ setResults([]); return; }
    const t = setTimeout(async ()=>{
      try{ setResults(await geocodeSearch(q)); } catch(e){ console.error(e); }
    }, 350);
    return ()=>clearTimeout(t);
  }, [q]);

  return (
    <div className="card" style={{marginTop:12}}>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search place (city, address)…" />
      {!!results.length && (
        <ul style={{marginTop:8, listStyle:'none', padding:0, maxHeight:220, overflow:'auto'}}>
          {results.map((it,i)=>(
            <li key={i}
                style={{padding:'8px', border:'1px solid #2a2a44', borderRadius:8, marginTop:6, cursor:'pointer'}}
                onClick={()=>{ onSelect(it.lat, it.lng, it.label); setResults([]); }}>
              {it.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
