import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { GreenScreenOverlay } from './GreenScreenOverlay';

const move = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(12px);
  z-index: 2147483647;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  pointer-events: all; /* Force capture clicks */
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

const LoadingBar = styled.div`
  width: 200px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 24px;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0; left: 0; bottom: 0; width: 50%;
    background: #22c55e;
    animation: ${move} 1s infinite linear;
    border-radius: 2px;
  }
`;

interface GalileoLoadingScreenProps {
  isVisible: boolean;
  title?: string;
  subtitle?: string;
}

export const GalileoLoadingScreen: React.FC<GalileoLoadingScreenProps> = ({
  isVisible,
  title = "解析中...",
  subtitle = "データを分析しています..."
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll Lock & Portal Mounting
  useEffect(() => {
    if (isVisible && mounted) {
      document.body.style.overflow = 'hidden';

      // Prevent touch move on mobile to stop rubber-banding
      const preventDefault = (e: Event) => e.preventDefault();
      document.body.addEventListener('touchmove', preventDefault, { passive: false });

      return () => {
        document.body.style.overflow = '';
        document.body.removeEventListener('touchmove', preventDefault);
      };
    }
  }, [isVisible, mounted]);

  if (!isVisible || !mounted) return null;

  return createPortal(
    <Container>
      <LoadingOverlay>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔮</div>
        <div style={{ fontWeight: 600, fontSize: '18px' }}>{title}</div>
        <div style={{ fontSize: '13px', opacity: 0.7, marginTop: '8px' }}>{subtitle}</div>
        <LoadingBar />
      </LoadingOverlay>
      <GreenScreenOverlay videoSrc="/assets/galileo.mp4" isPlaying={true} />
    </Container>,
    document.body
  );
};
