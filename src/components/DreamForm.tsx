
import { useState, useEffect } from "react";
import type { DreamEntry, Mood } from "../types";

const moods: Mood[] = ["happy","neutral","sad","scary","mystic"];

type Props = {
  onSubmit: (payload: Omit<DreamEntry,'id'>) => Promise<void> | void;
  onPickOnMap?: () => void;
};

export default function DreamForm({ onSubmit, onPickOnMap }: Props) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));
  const [mood, setMood] = useState<Mood>("neutral");
  const [tags, setTags] = useState<string>("");
  const [location, setLocation] = useState<{lat:number;lng:number;address?:string}>();

  // listen for custom 'pick-location' event dispatched from MapTab
  useEffect(()=>{
    function onPick(e: any){ setLocation({ lat: e.detail.lat, lng: e.detail.lng }); }
    window.addEventListener('pick-location', onPick as any);
    return () => window.removeEventListener('pick-location', onPick as any);
  },[]);

  function parseTags(s: string) {
    return s.split(",").map(t => t.trim()).filter(Boolean);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit({
      title, text,
      date: new Date(date).toISOString(),
      mood,
      tags: parseTags(tags),
      location
    });
    setTitle(""); setText(""); setTags(""); setLocation(undefined);
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="row">
        <div>
          <label>Title</label>
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="A vivid dream..." required/>
        </div>
        <div>
          <label>Date</label>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} required/>
        </div>
        <div>
          <label>Mood</label>
          <select value={mood} onChange={e=>setMood(e.target.value as Mood)}>
            {moods.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>
      <div style={{marginTop:12}}>
        <label>Details</label>
        <textarea rows={5} value={text} onChange={e=>setText(e.target.value)} placeholder="What happened in the dream?"/>
      </div>
      <div className="row" style={{marginTop:12}}>
        <div>
          <label>Tags (comma-separated)</label>
          <input value={tags} onChange={e=>setTags(e.target.value)} placeholder="water, flying, cat"/>
        </div>
        <div>
          <label>Location</label>
          <div className="row" style={{gap:8}}>
            <input value={location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : ""} readOnly placeholder="Pick from map"/>
            <button type="button" className="primary" onClick={onPickOnMap}>Pick on Map</button>
            <button type="button" onClick={()=>setLocation(undefined)}>Clear</button>
          </div>
        </div>
      </div>
      <div style={{display:'flex', gap:8, marginTop:12}}>
        <button className="primary" type="submit">Save</button>
      </div>
    </form>
  );
}
