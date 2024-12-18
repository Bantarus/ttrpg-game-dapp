import { useEffect, useRef } from 'react';
import { Game } from 'phaser';
import { gameConfig } from '../game/config';

export const GameComponent = () => {
  const gameRef = useRef<Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && containerRef.current) {
      const container = containerRef.current;
      const width = container.clientWidth;
      const height = container.clientHeight;

      const config = {
        ...gameConfig,
        scale: {
          ...gameConfig.scale,
          width,
          height,
          parent: container
        }
      };

      gameRef.current = new Game(config);

      const handleResize = () => {
        if (gameRef.current) {
          gameRef.current.scale.resize(
            container.clientWidth,
            container.clientHeight
          );
          
          const gameScene = gameRef.current.scene.getScene('GameScene') as any;
          if (gameScene?.cameras?.main) {
            gameScene.centerCameraOnPlayer();
          }
        }
      };

      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
        gameRef.current?.destroy(true);
        gameRef.current = null;
      };
    }
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative bg-black"
      style={{ 
        minHeight: '100vh',
        touchAction: 'none'
      }}
    />
  );
}; 