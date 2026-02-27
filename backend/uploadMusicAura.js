/**
 * ============================================================
 *  MusicAura — CSV-Driven Bulk Upload Script
 * ============================================================
 *  Features:
 *  ✅ Live upload progress bar per file (bytes + %)
 *  ✅ Cover deduplication — same cover file uploaded ONCE,
 *     reused for all songs on same album
 *  ✅ CSV as authoritative source (title, album, artist, genre,
 *     duration, release date)
 *  ✅ Idempotent — already-uploaded songs skipped instantly
 *
 *  Run from D:\Aura\backend:
 *    node uploadMusicAura.js
 * ============================================================
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createReadStream } from 'fs';
import { parse } from 'csv-parse/sync';
import mongoose from 'mongoose';
import { google } from 'googleapis';

// ─── Paths ────────────────────────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SONGS_DIR = 'D:\\MusicAura\\Songs';
const COVERS_DIR = 'D:\\MusicAura\\Covers';
const ARTISTS_DIR = 'D:\\MusicAura\\Artists';
const CSV_PATH = 'D:\\MusicAura\\playlist.csv';
const TOKEN_PATH = path.join(__dirname, 'tokens.json');

const SONGS_FOLDER_ID = process.env.GOOGLE_DRIVE_SONGS_FOLDER_ID;
const COVERS_FOLDER_ID = process.env.GOOGLE_DRIVE_COVERS_FOLDER_ID;
const ARTISTS_FOLDER_ID = process.env.GOOGLE_DRIVE_ARTISTS_FOLDER_ID;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

const FALLBACK_USER_ID = new mongoose.Types.ObjectId('000000000000000000000001');

// ─── Google OAuth2 ────────────────────────────────────────────────────────────
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/oauth2callback'
);

function loadCredentials() {
    if (!fs.existsSync(TOKEN_PATH))
        throw new Error(`tokens.json not found at ${TOKEN_PATH}. Run the OAuth flow first.`);
    oauth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8')));
    oauth2Client.on('tokens', (t) => {
        const existing = fs.existsSync(TOKEN_PATH)
            ? JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8')) : {};
        fs.writeFileSync(TOKEN_PATH, JSON.stringify({ ...existing, ...t }, null, 2));
    });
}

const drive = google.drive({ version: 'v3', auth: oauth2Client });

// ─── Progress Bar ─────────────────────────────────────────────────────────────
const BAR_WIDTH = 25;

function renderBar(loaded, total, label, fileName) {
    const pct = total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0;
    const filled = Math.round((pct / 100) * BAR_WIDTH);
    const bar = '█'.repeat(filled) + '░'.repeat(BAR_WIDTH - filled);
    const mbDone = (loaded / 1024 / 1024).toFixed(2);
    const mbTot = (total / 1024 / 1024).toFixed(2);
    // \r overwrites current line — no newline until upload is done
    process.stdout.write(
        `\r      ⬆  [${label}] ${bar} ${String(pct).padStart(3)}%  ${mbDone}/${mbTot} MB  "${fileName.substring(0, 28)}"`
    );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getMime(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return {
        '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.flac': 'audio/flac',
        '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp'
    }[ext]
        || 'application/octet-stream';
}

function stripVariants(str) {
    return str.replace(/\s*[-–]\s*(slowed|reverb|lofi|lo-fi|speed\s?up|sped\s?up|edit|remix|mix|version|live|acoustic|instrumental|karaoke|cover|radio|extended|clean|dirty|explicit|bonus|remaster(ed)?|deluxe|mono|stereo|vinyl|reissue|original|official)[\w\s.,()[\]!?]*$/gi, '').trim();
}

function norm(s) {
    return s.toLowerCase()
        .replace(/['''""]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function looseMatch(a, b) {
    const na = norm(a), nb = norm(b);
    if (na === nb) return true;
    if (na.length > 6 && (nb.startsWith(na.substring(0, Math.min(na.length, 30))) ||
        na.startsWith(nb.substring(0, Math.min(nb.length, 30))))) return true;
    return false;
}

// ─── Upload to Drive (with live progress bar) ─────────────────────────────────
/**
 * @param {string} localPath   - absolute local file path
 * @param {string} folderId    - Google Drive folder ID
 * @param {string} label       - label shown in the progress bar (AUDIO/COVER/ARTIST)
 * @returns {{ id, url, coverUrl, size, mimeType }}
 */
async function uploadToDrive(localPath, folderId, label) {
    const fileName = path.basename(localPath);
    const mimeType = getMime(localPath);
    const fileSize = fs.statSync(localPath).size;

    // Show initial bar at 0%
    renderBar(0, fileSize, label, fileName);

    const res = await drive.files.create(
        {
            requestBody: {
                name: `${Date.now()}-${fileName}`,
                parents: [folderId],
            },
            media: { mimeType, body: createReadStream(localPath) },
            fields: 'id,size,mimeType',
        },
        {
            // Live progress callback from googleapis
            onUploadProgress: (evt) => {
                renderBar(evt.bytesRead, fileSize, label, fileName);
            },
        }
    );

    // Move to next line after bar completes
    process.stdout.write('\n');

    await drive.permissions.create({
        fileId: res.data.id,
        requestBody: { role: 'reader', type: 'anyone' },
    });

    return {
        id: res.data.id,
        size: parseInt(res.data.size) || fileSize,
        mimeType: res.data.mimeType || mimeType,
        url: `${BACKEND_URL}/api/songs/stream/${res.data.id}`,
        coverUrl: `https://lh3.googleusercontent.com/d/${res.data.id}`,
    };
}

// ─── Genre mapping ────────────────────────────────────────────────────────────
function mapGenre(genresStr) {
    const g = (genresStr || '').toLowerCase();
    if (g.includes('classical') || g.includes('opera')) return 'Classical';
    if (g.includes('jazz')) return 'Jazz';
    if (g.includes('ambient') || g.includes('dark ambient')) return 'Ambient';
    if (g.includes('techno')) return 'Techno';
    if (g.includes('drum') && g.includes('bass')) return 'Drum & Bass';
    if (g.includes('experimental') || g.includes('art rock')) return 'Experimental';
    if (g.includes('electronic') || g.includes('electro')) return 'Electronic';
    if (g.includes('rap') || g.includes('hip hop') || g.includes('hip-hop') ||
        g.includes('trap') || g.includes('g-funk') || g.includes('phonk') ||
        g.includes('desi hip hop') || g.includes('breakcore')) return 'Hip Hop';
    if (g.includes('r&b') || g.includes('r\u0026b') || g.includes('rnb')) return 'R&B';
    if (g.includes('folk') || g.includes('singer-songwriter')) return 'Folk';
    if (g.includes('country')) return 'Country';
    if (g.includes('rock') || g.includes('garage') || g.includes('indie') ||
        g.includes('alternative') || g.includes('punk') || g.includes('new wave') ||
        g.includes('grunge')) return 'Rock';
    if (g.includes('pop') || g.includes('soft pop') || g.includes('bollywood') ||
        g.includes('hindi pop') || g.includes('punjabi pop') ||
        g.includes('desi pop') || g.includes('bhangra') ||
        g.includes('k-pop') || g.includes('j-pop') || g.includes('afrobeat') ||
        g.includes('europop') || g.includes('sufi') || g.includes('bhajan') ||
        g.includes('qawwali') || g.includes('devotional')) return 'Pop';
    return 'Other';
}

// ─── Mongoose Models ──────────────────────────────────────────────────────────
const artistSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, unique: true },
    photoUrl: { type: String, default: 'https://placehold.co/600/000000/FFF?text=Artist' },
    bio: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    cloudinaryPhotoId: { type: String },
}, { timestamps: true });

const songSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    artist: { type: String, required: true, trim: true },
    artistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist' },
    album: { type: String, trim: true },
    genre: { type: String, default: 'Other' },
    audioUrl: { type: String, required: true },
    coverUrl: { type: String, default: 'https://placehold.co/500/f5f5f5/000?text=Album+Cover' },
    audioSize: { type: Number },
    audioMimeType: { type: String },
    coverSize: { type: Number },
    coverMimeType: { type: String },
    duration: { type: Number, required: true, min: 1 },
    plays: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cloudinaryAudioId: { type: String },
    cloudinaryCoverId: { type: String },
    releaseDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
}, { timestamps: true });

const Artist = mongoose.models.Artist || mongoose.model('Artist', artistSchema);
const Song = mongoose.models.Song || mongoose.model('Song', songSchema);

// ─── File Index Builders ──────────────────────────────────────────────────────
function buildSongIndex(dir) {
    const index = new Map();
    for (const f of fs.readdirSync(dir).filter(f => /\.(mp3|m4a|flac|wav|ogg)$/i.test(f))) {
        const abs = path.join(dir, f);
        const base = path.basename(f, path.extname(f));
        index.set(norm(base), abs);
        index.set(norm(stripVariants(base)), abs);
    }
    return index;
}

function buildImageIndex(dir) {
    const index = new Map();
    for (const f of fs.readdirSync(dir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f)))
        index.set(norm(path.basename(f, path.extname(f))), path.join(dir, f));
    return index;
}

function findSongFile(songIndex, artistName, trackName) {
    for (const c of [`${artistName} - ${trackName}`, `${artistName} - ${stripVariants(trackName)}`]) {
        const hit = songIndex.get(norm(c));
        if (hit) return hit;
    }
    const target = norm(`${artistName} - ${trackName}`);
    for (const [key, val] of songIndex)
        if (looseMatch(key, target)) return val;
    return null;
}

function findCoverFile(coverIndex, artistName, albumName) {
    if (!albumName) return null;
    for (const c of [`${artistName} - ${albumName}`, `${artistName} - ${stripVariants(albumName)}`]) {
        const hit = coverIndex.get(norm(c));
        if (hit) return hit;
    }
    const normArtist = norm(artistName).substring(0, 15);
    for (const [key, val] of coverIndex)
        if (key.startsWith(normArtist)) return val;
    return null;
}

function findArtistPhoto(artistIndex, artistName) {
    return artistIndex.get(norm(artistName))
        || artistIndex.get(norm(artistName.split(';')[0].trim()))
        || null;
}

// ─── Overall progress header  ─────────────────────────────────────────────────
function printOverallProgress(current, total, success, skipped, errors) {
    const pct = Math.round((current / total) * 100);
    const filled = Math.round((pct / 100) * 30);
    const bar = '▓'.repeat(filled) + '░'.repeat(30 - filled);
    process.stdout.write(
        `\r  📊 Overall [${bar}] ${pct}%  (${current}/${total})` +
        `  ✅${success}  ⏭️${skipped}  ❌${errors}   `
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║   MusicAura — CSV-Driven Bulk Upload (Sequential)  ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    loadCredentials();
    console.log('✅ Google Drive credentials loaded.\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected.\n');

    let uploadedBy = FALLBACK_USER_ID;
    try {
        const { default: UserModel } = await import('./src/models/User.js').catch(() => ({ default: null }));
        if (UserModel) {
            const u = await UserModel.findOne().select('_id').lean();
            if (u) {
                uploadedBy = u._id;
                console.log(`ℹ️  Uploader: ${uploadedBy}\n`);
            }
        }
    } catch { /* use fallback */ }

    // Read CSV
    console.log(`📋 Reading CSV: ${CSV_PATH}`);
    const rows = parse(fs.readFileSync(CSV_PATH, 'utf8'), {
        columns: true, skip_empty_lines: true, trim: true, relax_column_count: true,
    });
    console.log(`   Found ${rows.length} rows.\n`);

    // Build indices
    console.log('🔍 Indexing local files…');
    const songIndex = buildSongIndex(SONGS_DIR);
    const coverIndex = buildImageIndex(COVERS_DIR);
    const artistIndex = buildImageIndex(ARTISTS_DIR);
    console.log(`   Songs: ${songIndex.size / 2 | 0}  Covers: ${coverIndex.size}  Artists: ${artistIndex.size}\n`);

    // ── Caches ────────────────────────────────────────────────────────────────
    const artistCache = new Map();  // artistName.lower → Artist doc

    /**
     * Cover deduplication cache
     * Key:   absolute local path of cover image
     * Value: { id, coverUrl, size, mimeType }  (Drive upload result)
     *
     * If the SAME physical file has already been uploaded this session,
     * we reuse the Drive ID instead of uploading again.
     */
    const coverCache = new Map();   // localPath → driveResult

    let successCount = 0;
    let skipDB = 0;
    let skipNoFile = 0;
    let errorCount = 0;

    console.log('─'.repeat(55));

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        const trackName = (row['Track Name'] || '').trim();
        const albumName = (row['Album Name'] || '').trim();
        const artistNamesRaw = (row['Artist Name(s)'] || '').trim();
        const genresStr = (row['Genres'] || '').trim();
        const durationMs = parseInt(row['Duration (ms)'] || '0', 10);
        const releaseDate = (row['Release Date'] || '').trim();
        const recordLabel = (row['Record Label'] || '').trim();

        // Print overall progress before each song
        printOverallProgress(i, rows.length, successCount, skipDB + skipNoFile, errorCount);
        process.stdout.write('\n');

        if (!trackName || !artistNamesRaw || trackName === 'undefined') {
            console.log(`[${i + 1}/${rows.length}] ⚠️  Empty row — skipping.\n`);
            skipNoFile++;
            continue;
        }

        const primaryArtist = artistNamesRaw.split(';')[0].trim();
        const duration = durationMs > 0 ? Math.round(durationMs / 1000) : 180;

        console.log(`[${i + 1}/${rows.length}] 🎵 "${primaryArtist} - ${trackName}"`);

        // Skip if already in DB
        const existing = await Song.findOne({ title: trackName, artist: primaryArtist }).lean();
        if (existing) {
            console.log(`  ⏭️  Already in DB — skipping.\n`);
            skipDB++;
            continue;
        }

        // Find local files
        const songFilePath = findSongFile(songIndex, primaryArtist, trackName);
        const coverFilePath = findCoverFile(coverIndex, primaryArtist, albumName);

        if (!songFilePath) {
            console.log(`  🚫 No local MP3 found — skipping.\n`);
            skipNoFile++;
            continue;
        }

        console.log(`  📂 Audio  : ${path.basename(songFilePath)}`);
        console.log(`  🖼  Cover  : ${coverFilePath ? path.basename(coverFilePath) : '(placeholder)'}`);
        if (coverFilePath && coverCache.has(coverFilePath))
            console.log(`  ♻️  Cover already uploaded this session — reusing Drive ID.`);

        try {
            // ── Artist ───────────────────────────────────────────────────────
            const artistKey = primaryArtist.toLowerCase();
            let artistDoc = artistCache.get(artistKey);

            if (!artistDoc) {
                artistDoc = await Artist.findOne({ name: primaryArtist });

                if (!artistDoc) {
                    console.log(`  🎤 New artist: "${primaryArtist}"`);
                    const artistPhotoPath = findArtistPhoto(artistIndex, primaryArtist);
                    let photoUrl = 'https://placehold.co/600/000000/FFF?text=Artist';
                    let photoDriveId = null;

                    if (artistPhotoPath) {
                        console.log(`     Photo: ${path.basename(artistPhotoPath)}`);
                        const up = await uploadToDrive(artistPhotoPath, ARTISTS_FOLDER_ID, 'ARTIST');
                        photoUrl = up.coverUrl;
                        photoDriveId = up.id;
                        console.log(`     ✅ Artist photo → ${photoDriveId}`);
                    } else {
                        console.log(`     ⚠️  No artist photo — using placeholder.`);
                    }

                    artistDoc = new Artist({ name: primaryArtist, photoUrl, cloudinaryPhotoId: photoDriveId });
                    await artistDoc.save();
                    console.log(`     ✅ Artist saved: ${artistDoc._id}`);
                } else {
                    console.log(`  🎤 Artist in DB: "${primaryArtist}"`);
                }
                artistCache.set(artistKey, artistDoc);
            }

            // ── Audio ─────────────────────────────────────────────────────────
            const audioUp = await uploadToDrive(songFilePath, SONGS_FOLDER_ID, 'AUDIO');
            console.log(`  ✅ Audio → Drive ID: ${audioUp.id}`);

            // ── Cover (deduplicated) ──────────────────────────────────────────
            let coverUrl = 'https://placehold.co/500/f5f5f5/000?text=Album+Cover';
            let coverDriveId = null;
            let coverSize = 0;
            let coverMime = 'image/jpeg';

            if (coverFilePath) {
                let coverUp;

                if (coverCache.has(coverFilePath)) {
                    // ♻️  Reuse existing Drive upload — no re-upload
                    coverUp = coverCache.get(coverFilePath);
                } else {
                    // 🆕 First time seeing this cover — upload and cache
                    coverUp = await uploadToDrive(coverFilePath, COVERS_FOLDER_ID, 'COVER');
                    coverCache.set(coverFilePath, coverUp);
                    console.log(`  ✅ Cover → Drive ID: ${coverUp.id}`);
                }

                coverUrl = coverUp.coverUrl;
                coverDriveId = coverUp.id;
                coverSize = coverUp.size;
                coverMime = coverUp.mimeType;
            }

            // ── Save Song ─────────────────────────────────────────────────────
            const relDate = releaseDate
                ? new Date(releaseDate.replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$2-$1'))
                : new Date();

            const song = new Song({
                title: trackName,
                artist: primaryArtist,
                artistId: artistDoc._id,
                album: albumName || undefined,
                genre: mapGenre(genresStr),
                audioUrl: audioUp.url,
                coverUrl,
                audioSize: audioUp.size,
                audioMimeType: audioUp.mimeType,
                coverSize,
                coverMimeType: coverMime,
                duration,
                uploadedBy,
                cloudinaryAudioId: audioUp.id,
                cloudinaryCoverId: coverDriveId,
                releaseDate: relDate,
                recordLabel: recordLabel || undefined,
            });
            await song.save();
            console.log(`  ✅ Song saved: ${song._id}\n`);
            successCount++;

        } catch (err) {
            console.error(`  ❌ Error: ${err.message}\n`);
            errorCount++;
        }
    }

    // Final overall bar at 100%
    printOverallProgress(rows.length, rows.length, successCount, skipDB + skipNoFile, errorCount);
    process.stdout.write('\n');

    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║                  Upload Complete!                  ║');
    console.log('╠════════════════════════════════════════════════════╣');
    console.log(`║  ✅ Uploaded successfully  : ${String(successCount).padEnd(21)}║`);
    console.log(`║  ⏭️  Skipped (already in DB): ${String(skipDB).padEnd(21)}║`);
    console.log(`║  🚫 Skipped (no local file): ${String(skipNoFile).padEnd(21)}║`);
    console.log(`║  ❌ Errors                : ${String(errorCount).padEnd(21)}║`);
    console.log(`║  ♻️  Cover cache hits      : ${String(coverCache.size).padEnd(21)}║`);
    console.log('╚════════════════════════════════════════════════════╝\n');

    await mongoose.disconnect();
    console.log('MongoDB disconnected. Done! 👋\n');
}

main().catch(err => {
    console.error('\n💥 Fatal error:', err);
    process.exit(1);
});
