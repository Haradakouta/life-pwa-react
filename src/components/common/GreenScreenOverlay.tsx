/**
 * グリーンバック動画のクロマキー合成コンポーネント
 */
import React, { useRef, useEffect } from 'react';
import styled from '@emotion/styled';

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  z-index: 2147483647;
  pointer-events: none;
`;

interface GreenScreenOverlayProps {
    videoSrc: string;
    isPlaying: boolean;
    opacity?: number;
}

export const GreenScreenOverlay: React.FC<GreenScreenOverlayProps> = ({
    videoSrc,
    isPlaying,
    opacity = 0.8
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number | null>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isPlaying) {
            video.play().catch(e => console.log('Video play failed:', e));
        } else {
            video.pause();
            video.currentTime = 0;
        }
    }, [isPlaying]);

    useEffect(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        const render = () => {
            if (video.paused || video.ended) {
                return;
            }

            try {
                // キャンバスサイズをウィンドウサイズに合わせる
                if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;
                }

                // 動画をキャンバスサイズに合わせて描画（cover相当の計算）
                const vRatio = video.videoWidth / video.videoHeight;
                const cRatio = canvas.width / canvas.height;
                let drawWidth, drawHeight, offsetX, offsetY;

                if (vRatio > cRatio) {
                    drawHeight = canvas.height;
                    drawWidth = canvas.height * vRatio;
                    offsetX = (canvas.width - drawWidth) / 2;
                    offsetY = 0;
                } else {
                    drawWidth = canvas.width;
                    drawHeight = canvas.width / vRatio;
                    offsetX = 0;
                    offsetY = (canvas.height - drawHeight) / 2;
                }

                ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);

                const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = frame.data;
                const len = data.length;

                // クロマキー処理
                for (let i = 0; i < len; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    // 緑透過判定
                    if (g > 100 && g > r * 1.5 && g > b * 1.5) {
                        data[i + 3] = 0;
                    }
                }

                ctx.putImageData(frame, 0, 0);
            } catch (err) {
                // エラー時はログを出さずに静かに失敗させる（頻出防止）
                // console.error('GreenScreen render error:', err);
            }

            requestRef.current = requestAnimationFrame(render);
        };

        const handlePlay = () => {
            requestRef.current = requestAnimationFrame(render);
        };

        video.addEventListener('play', handlePlay);

        return () => {
            video.removeEventListener('play', handlePlay);
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [videoSrc]);

    return (
        <>
            <video
                ref={videoRef}
                src={videoSrc}
                loop
                muted
                playsInline
                crossOrigin="anonymous"
                style={{ display: 'none' }}
            />
            <Canvas
                ref={canvasRef}
                style={{ opacity }}
            />
        </>
    );
};
