import { useRef, useEffect } from 'react';

const Visualizer = ({ analyser, isPlaying, color = '#000', barCount = 64 }) => {
    const canvasRef = useRef(null);
    const requestRef = useRef(null);

    const animate = () => {
        if (!analyser || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / barCount);
        let x = 0;

        for (let i = 0; i < barCount; i++) {
            // Focus on lower to mid frequencies for better visual impact
            const index = Math.floor((i / barCount) * (bufferLength / 2));
            const barHeight = (dataArray[index] / 255) * canvas.height;

            ctx.fillStyle = color;
            // Rounded bars for premium feel
            const radius = 2;
            ctx.beginPath();
            ctx.roundRect(x + 2, canvas.height - barHeight, barWidth - 4, barHeight, [radius, radius, 0, 0]);
            ctx.fill();

            x += barWidth;
        }

        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        if (isPlaying) {
            requestRef.current = requestAnimationFrame(animate);
        } else {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
            // Clear canvas when stopped
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }

        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [isPlaying, analyser]);

    return (
        <canvas
            ref={canvasRef}
            width={800}
            height={150}
            className="w-full h-full opacity-30"
        />
    );
};

export default Visualizer;
