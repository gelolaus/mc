export default function Map(){const url=process.env.NEXT_PUBLIC_WORLD_MAP_URL;return <section className="section"><h1 style={{fontSize:'clamp(48px,8vw,72px)'}}>World Map</h1>{url?<iframe title="Interactive world map" src={url} style={{width:'100%',height:'70vh',border:'1px solid var(--line)'}}/>:<div className="empty">The interactive world map will appear here once connected.</div>}</section>}

