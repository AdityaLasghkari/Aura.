import axios from 'axios';

/**
 * Recursively find a continuation token in a nested object.
 */
function findToken(obj) {
    if (!obj || typeof obj !== 'object') return null;
    if (obj.token && typeof obj.token === 'string' && obj.token.length > 20) return obj.token;
    for (const key of Object.keys(obj)) {
        const result = findToken(obj[key]);
        if (result) return result;
    }
    return null;
}

/**
 * Fetch ALL videos from a YouTube playlist (handles pagination beyond 100).
 * Returns { title, videos[] } where each video has: videoId, title, author, lengthSeconds, thumbnail
 */
export async function fetchFullYouTubePlaylist(listId) {
    const url = `https://www.youtube.com/playlist?list=${listId}`;
    const res = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        timeout: 15000
    });
    const html = res.data;

    const m = html.match(/var ytInitialData = (.+?);<\/script>/);
    if (!m) throw new Error('Could not parse YouTube playlist page');

    const data = JSON.parse(m[1]);
    const apiKey = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1];
    const playlistTitle = data?.metadata?.playlistMetadataRenderer?.title || 'YouTube Playlist';

    const playlistRenderer = data?.contents?.twoColumnBrowseResultsRenderer
        ?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer
        ?.contents?.[0]?.itemSectionRenderer?.contents?.[0]?.playlistVideoListRenderer;

    if (!playlistRenderer) throw new Error('Playlist not found or is private');

    let allContents = playlistRenderer.contents || [];

    const parseVideos = (items) => items
        .filter(c => c.playlistVideoRenderer)
        .map(c => {
            const v = c.playlistVideoRenderer;
            return {
                videoId: v.videoId,
                title: v.title?.runs?.[0]?.text || 'Untitled',
                author: v.shortBylineText?.runs?.[0]?.text || 'Unknown',
                lengthSeconds: parseInt(v.lengthSeconds) || 0,
                thumbnail: v.thumbnail?.thumbnails?.[v.thumbnail?.thumbnails?.length - 1]?.url || ''
            };
        });

    let videos = parseVideos(allContents);

    // Paginate through continuation tokens
    let contItem = allContents.find(c => c.continuationItemRenderer);

    while (contItem && apiKey) {
        const token = findToken(contItem);
        if (!token) break;

        try {
            const r2 = await axios.post(
                `https://www.youtube.com/youtubei/v1/browse?key=${apiKey}&prettyPrint=false`,
                {
                    context: { client: { clientName: 'WEB', clientVersion: '2.20241001.00.00', hl: 'en', gl: 'US' } },
                    continuation: token
                },
                {
                    timeout: 15000,
                    headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
                }
            );

            let items = [];
            const actions = r2.data?.onResponseReceivedActions || [];
            for (const a of actions) {
                if (a.appendContinuationItemsAction?.continuationItems) {
                    items = a.appendContinuationItemsAction.continuationItems;
                }
            }

            videos = videos.concat(parseVideos(items));
            contItem = items.find(i => i.continuationItemRenderer);
        } catch (err) {
            console.error('YT_PAGINATION_ERROR:', err.message);
            break; // Return what we have so far
        }
    }

    // Get playlist thumbnail
    const playlistImage = data?.microformat?.microformatDataRenderer?.thumbnail?.thumbnails?.[0]?.url
        || videos[0]?.thumbnail || '';

    return {
        title: playlistTitle,
        image: playlistImage,
        videos
    };
}
