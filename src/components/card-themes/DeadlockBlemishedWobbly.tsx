'use client';

import React, { useRef, useEffect, useState } from 'react';
import DeadlockBlemishedCard from './DeadlockBlemishedCard';

interface DeadlockBlemishedWobblyProps {
  children: React.ReactNode;
  className?: string;
  allowedCorners?: ('top-right' | 'top-left' | 'bottom-right' | 'bottom-left')[];
  ripChance?: number;
  enableStaples?: boolean; // Toggle staple feature on/off
}

interface StaplePosition {
  x: number;
  y: number;
  rotation: number;
}

interface HolePosition {
  x: number;
  y: number;
}

/**
 * Deadlock Blemished Card with Wobbly Portrait Effect (Landing Page Version)
 * 
 * Adapted for the landing page. It specifically targets the logo image
 * inside the children for rotation, instead of a generic "portrait".
 */
export default function DeadlockBlemishedWobbly({
  children,
  className = '',
  allowedCorners = ['top-right', 'top-left', 'bottom-right', 'bottom-left'],
  ripChance = 0.25,
  enableStaples = false
}: DeadlockBlemishedWobblyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const portraitRef = useRef<HTMLElement | null>(null);
  const cardRef = useRef<HTMLElement | null>(null);
  
  // Card Wobble Refs
  const hasCardRotated = useRef(false);
  const uprightElsRef = useRef<HTMLElement[]>([]);
  const uprightOriginalTransformsRef = useRef<Map<HTMLElement, string>>(new Map());
  
  // Staple feature state
  const [currentStaples, setCurrentStaples] = useState<StaplePosition[]>([]);
  const [holes, setHoles] = useState<HolePosition[]>([]);
  const [showStaples, setShowStaples] = useState(true);
  const [cardRotation, setCardRotation] = useState(0); 
  const [cardScale, setCardScale] = useState(1);

  // Helper functions for staples
  const generateRandomStaplePosition = (forceSide?: 'left' | 'right'): StaplePosition => {
    const marginPercent = 15;
    const portraitExclusionLeft = 10; 
    const portraitExclusionRight = 60;
    
    let x: number;
    let y: number;
    
    // Determine which side to place staple
    let placeOnRight: boolean;
    
    if (forceSide === 'left') {
      placeOnRight = false;
    } else if (forceSide === 'right') {
      placeOnRight = true;
    } else {
      placeOnRight = Math.random() > 0.5;
    }
    
    if (placeOnRight) {
      x = portraitExclusionRight + Math.random() * (85 - portraitExclusionRight);
    } else {
      x = marginPercent + Math.random() * 5;
    }
    y = marginPercent + Math.random() * (25 - marginPercent);
    
    const rotation = Math.random() * 360; 
    
    return { x, y, rotation };
  };
  
  const generateTwoStaples = (): StaplePosition[] => {
    const staple1 = generateRandomStaplePosition('left');
    const staple2 = generateRandomStaplePosition('right');
    return [staple1, staple2];
  };

  // Initialize staples
  useEffect(() => {
    if (enableStaples && currentStaples.length === 0) {
      setCurrentStaples(generateTwoStaples());
    }
  }, [enableStaples, currentStaples.length]);

  // Setup Hover and Element finding
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Find the logo container
    const findPortraitContainer = () => {
        const divs = container.querySelectorAll('div');
        for(const div of Array.from(divs)) {
            if (div.classList.contains('w-24') && div.classList.contains('h-24')) {
                return div as HTMLElement;
            }
        }
        return null;
    };

    portraitRef.current = findPortraitContainer();
    cardRef.current = container;

    // Find upright elements
    uprightElsRef.current = Array.from(
      container.querySelectorAll('[data-keep-upright]')
    ) as HTMLElement[];

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [enableStaples, currentStaples]);

  // Hover Effects Logic
  useEffect(() => {
    if (isHovering) {
        // 1. Handle Staples
        if (enableStaples && currentStaples.length > 0) {
            setShowStaples(false);
            const legSpacing = 6;
            const newHoles: HolePosition[] = [];
            currentStaples.forEach(staple => {
              const angle = (staple.rotation * Math.PI) / 180;
              const cosAngle = Math.cos(angle);
              const sinAngle = Math.sin(angle);
              const halfSpacing = legSpacing / 2;
              newHoles.push(
                { x: staple.x - halfSpacing * cosAngle, y: staple.y - halfSpacing * sinAngle },
                { x: staple.x + halfSpacing * cosAngle, y: staple.y + halfSpacing * sinAngle }
              );
            });
            setHoles(prev => [...prev, ...newHoles]);
        }

        // 2. Wobbly Portrait Rotation Logic
        const applyRandomPortraitRotation = () => {
            if (portraitRef.current) {
                const rotation = (Math.random() - 0.5) * 40; // ±20 degrees
                const scale = 0.95 + Math.random() * 0.1; // 0.95 - 1.05
                portraitRef.current.style.transition = 'none';
                portraitRef.current.style.transform = `rotate(${rotation}deg) scale(${scale})`;
            }
        };

        applyRandomPortraitRotation();
        
        const scheduleNextPortraitRotation = () => {
            const delay = 500 + Math.random() * 1000;
            intervalRef.current = setTimeout(() => {
                if (isHovering) {
                    applyRandomPortraitRotation();
                    scheduleNextPortraitRotation();
                }
            }, delay);
        };
        scheduleNextPortraitRotation();

        // 3. Full Card Wobble Logic
        if (cardRef.current && !hasCardRotated.current) {
            const rotation = (Math.random() - 0.5) * 6; // Random between -3 and +3 degrees
            const scale = 1.02 + Math.random() * 0.03; // Random between 1.02 and 1.05
            setCardRotation(rotation);
            setCardScale(scale);
            
            const transformStr = `rotate(${rotation}deg) scale(${scale})`;
            cardRef.current.style.transition = 'none';
            cardRef.current.style.willChange = 'transform';
            cardRef.current.style.backfaceVisibility = 'hidden';
            cardRef.current.style.transform = transformStr;

            // Counter-rotate upright elements
            if (uprightElsRef.current.length > 0) {
                const inverseRotation = -rotation;
                const inverseScale = 1 / scale;
                const inverseTransform = `rotate(${inverseRotation}deg) scale(${inverseScale})`;
                
                uprightElsRef.current.forEach(el => {
                    if (!uprightOriginalTransformsRef.current.has(el)) {
                        uprightOriginalTransformsRef.current.set(el, el.style.transform || '');
                    }
                    const original = uprightOriginalTransformsRef.current.get(el) || '';
                    el.style.transition = 'none';
                    el.style.transform = original ? `${original} ${inverseTransform}` : inverseTransform;
                    el.style.transformOrigin = 'center center';
                    el.style.willChange = 'transform';
                });
            }
            hasCardRotated.current = true;
        }

    } else {
        // Reset Effects
        if (intervalRef.current) {
            clearTimeout(intervalRef.current);
            intervalRef.current = null;
        }

        // Reset Staples
        if (enableStaples) {
            setCurrentStaples(generateTwoStaples());
            setShowStaples(true);
        }

        // Reset Portrait
        if (portraitRef.current) {
            portraitRef.current.style.transition = 'none';
            portraitRef.current.style.transform = 'rotate(0deg) scale(1)';
        }

        // Reset Card Rotation
        if (cardRef.current) {
            cardRef.current.style.transition = 'none';
            cardRef.current.style.transform = 'rotate(0deg) scale(1)';
            cardRef.current.style.willChange = '';
            cardRef.current.style.backfaceVisibility = '';
            
            // Restore upright elements
            if (uprightOriginalTransformsRef.current.size > 0) {
                uprightOriginalTransformsRef.current.forEach((original, el) => {
                    el.style.transition = 'none';
                    el.style.transform = original;
                    el.style.willChange = '';
                });
                uprightOriginalTransformsRef.current.clear();
            }
            hasCardRotated.current = false;
            setCardRotation(0);
            setCardScale(1);
        }
    }

    return () => {
        if (intervalRef.current) {
            clearTimeout(intervalRef.current);
        }
    };
  }, [isHovering, enableStaples]); // Dependencies ensure this runs on hover state change

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative', overflow: 'visible' }}>
      <DeadlockBlemishedCard
        allowedCorners={allowedCorners}
        ripChance={ripChance}
        className="h-full"
      >
        {children}
      </DeadlockBlemishedCard>
      
      {/* Render staple holes */}
      {enableStaples && holes.map((hole, index) => (
         <div
           key={`hole-${index}`}
           style={{
             position: 'absolute',
             top: `${hole.y}%`,
             left: `${hole.x}%`,
             width: '4px',
             height: '4px',
             borderRadius: '50%',
             backgroundColor: 'rgba(0, 0, 0, 0.4)',
             boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.5)',
             transform: 'translate(-50%, -50%)',
             pointerEvents: 'none',
             zIndex: 20
           }}
         />
      ))}

      {/* Render staples */}
      {enableStaples && showStaples && currentStaples.map((staple, index) => (
        <div
          key={`staple-${index}`}
          style={{
            position: 'absolute',
            top: `${staple.y}%`,
            left: `${staple.x}%`,
            transform: `translate(-50%, -50%) rotate(${staple.rotation}deg)`,
            pointerEvents: 'none',
            zIndex: 20
          }}
        >
            <svg width="24" height="9" viewBox="0 0 24 9" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="24" height="2.2" fill="#888" />
            <rect x="0" y="0" width="2.2" height="9" fill="#888" />
            <rect x="21.8" y="0" width="2.2" height="9" fill="#888" />
            <rect x="0.6" y="0.4" width="22.8" height="1" fill="rgba(255, 255, 255, 0.3)" />
            <rect x="0.6" y="2.2" width="1.2" height="6.2" fill="rgba(0, 0, 0, 0.2)" />
            <rect x="22.2" y="2.2" width="1.2" height="6.2" fill="rgba(0, 0, 0, 0.2)" />
            </svg>
        </div>
      ))}
    </div>
  );
}
