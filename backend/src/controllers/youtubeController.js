import ytSearch from 'yt-search';

// @desc    Search YouTube videos
// @route   GET /api/youtube/search?q=query
// @access  Public
export const searchYouTube = async (req, res) => {
    const query = req.query.q;

    if (!query) {
        return res.status(400).json({ message: 'Search query is required' });
    }

    try {
        const r = await ytSearch(query);
        const videos = r.videos.slice(0, 10); // Limit to 10 results

        const formattedResults = videos.map(v => ({
            _id: `yt_${v.videoId}`,
            title: v.title,
            artist: v.author.name,
            coverUrl: v.image,
            // Format duration from seconds
            duration: v.seconds,
            formattedDuration: `${Math.floor(v.seconds / 60)}:${(v.seconds % 60).toString().padStart(2, '0')}`,
            // We NO LONGER need an audio proxy URL because playing will be handled securely by YouTube Iframe API on Frontend
            audioUrl: '',
            itemType: 'song',
            isYoutube: true
        }));

        res.json({ success: true, data: { songs: formattedResults } });
    } catch (error) {
        console.error('YOUTUBE_SEARCH_ERROR:', error);
        res.status(500).json({ message: 'Error searching YouTube' });
    }
};
