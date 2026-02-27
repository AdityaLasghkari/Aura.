import fs from 'fs';
async function fetchPlay() {
    try {
        const r = await fetch('http://localhost:5000/api/playlists/699fc0dc67b00547857cb405');
        const data = await r.json();
        fs.writeFileSync('fetch_debug2.json', JSON.stringify(data.data.playlist.songs[0], null, 2), 'utf-8');
    } catch (e) {
        console.error(e);
    }
}
fetchPlay();
