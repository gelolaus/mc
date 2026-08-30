import { api, type Player } from '../../lib/api'; import { PlayerDirectory } from './player-directory';
export default async function PlayersPage(){const players=await api<Player[]>('/players');return <section className="section"><h1 style={{fontSize:'clamp(48px,8vw,72px)'}}>Players</h1><p className="lede">{players?.length??0} people have joined the world.</p><PlayerDirectory initial={players??[]}/></section>}

