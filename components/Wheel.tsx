
import React, { useEffect, useRef, useState } from 'react';
import { Student } from '../types';
import { audioService } from '../services/audioService';

interface WheelProps {
  students: Student[];
  onFinish: (student: Student) => void;
  isSpinning: boolean;
}

const PAINT_COLORS = [
  '#FF595E', '#FF924C', '#FFCA3A', '#C5CA30', '#8AC926', 
  '#52A675', '#1982C4', '#4267AC', '#6A4C93', '#9B5DE5', 
  '#F15BB5', '#FEE440', '#00BBF9', '#00F5D4'
];

const Wheel: React.FC<WheelProps> = ({ students, onFinish, isSpinning }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [pointerJitter, setPointerJitter] = useState(0);
  const lastSliceRef = useRef<number>(-1);
  
  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = size / 2 - 20;
    const sliceAngle = (2 * Math.PI) / students.length;

    ctx.clearRect(0, 0, size, size);

    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, radius + 5, 0, 2 * Math.PI);
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.restore();

    students.forEach((student, i) => {
      const angle = i * sliceAngle + rotation;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, angle, angle + sliceAngle);
      
      const gradient = ctx.createRadialGradient(center, center, radius * 0.2, center, center, radius);
      const baseColor = PAINT_COLORS[i % PAINT_COLORS.length];
      gradient.addColorStop(0, baseColor);
      gradient.addColorStop(1, adjustColor(baseColor, -30));
      
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.translate(center, center);
      ctx.rotate(angle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = 'white';
      ctx.shadowBlur = 4;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      
      const fontSize = students.length > 20 ? '12px' : students.length > 10 ? '16px' : '20px';
      ctx.font = `bold ${fontSize} Quicksand`;
      ctx.fillText(student.name, radius - 30, 7);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 8;
    ctx.stroke();

    const gemGradient = ctx.createRadialGradient(center - 5, center - 5, 2, center, center, 20);
    gemGradient.addColorStop(0, '#fff');
    gemGradient.addColorStop(0.3, '#facc15');
    gemGradient.addColorStop(1, '#a16207');
    
    ctx.beginPath();
    ctx.arc(center, center, 20, 0, 2 * Math.PI);
    ctx.fillStyle = gemGradient;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 3;
    ctx.stroke();
  };

  const adjustColor = (hex: string, amt: number) => {
    let usePound = false;
    if (hex[0] === "#") { hex = hex.slice(1); usePound = true; }
    const num = parseInt(hex, 16);
    let r = (num >> 16) + amt; r = Math.max(0, Math.min(255, r));
    let b = ((num >> 8) & 0x00FF) + amt; b = Math.max(0, Math.min(255, b));
    let g = (num & 0x0000FF) + amt; g = Math.max(0, Math.min(255, g));
    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
  }

  useEffect(() => { drawWheel(); }, [students, rotation]);

  useEffect(() => {
    if (isSpinning) {
      const extraSpins = 8 + Math.random() * 5;
      const targetRotation = rotation + extraSpins * 2 * Math.PI;
      const startTime = performance.now();
      const duration = 5000;
      lastSliceRef.current = -1;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 4);
        const currentRot = rotation + (targetRotation - rotation) * easeOut;
        
        setRotation(currentRot);

        const sliceAngle = (2 * Math.PI) / students.length;
        // Calculate current slice relative to pointer (at -90deg)
        const currentSlice = Math.floor(((currentRot + Math.PI/2) % (2 * Math.PI)) / sliceAngle);
        
        if (currentSlice !== lastSliceRef.current && progress < 0.98) {
          audioService.playTick();
          lastSliceRef.current = currentSlice;
          setPointerJitter(-15); // Quick snap
          setTimeout(() => setPointerJitter(0), 50);
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          const pointerOffset = Math.PI / 2;
          const finalRotation = currentRot % (2 * Math.PI);
          const index = Math.floor((2 * Math.PI - (finalRotation + pointerOffset) % (2 * Math.PI)) / sliceAngle) % students.length;
          onFinish(students[index]);
          setPointerJitter(0);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [isSpinning]);

  return (
    <div className="relative w-full max-w-md aspect-square mx-auto">
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 z-20"
        style={{ transform: `translateX(-50%) translateY(-10px) rotate(${pointerJitter}deg)`, transition: 'transform 0.05s ease-out' }}
      >
        <svg width="40" height="60" viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-xl">
          <path d="M20 60L40 0H0L20 60Z" fill="#FACC15" />
          <path d="M20 45L30 5H10L20 45Z" fill="white" fillOpacity="0.5" />
        </svg>
      </div>
      <canvas ref={canvasRef} width={600} height={600} className="w-full h-full rounded-full" />
      <div className="absolute inset-[-10px] border-[12px] border-white/5 rounded-full pointer-events-none"></div>
      <div className="absolute inset-[-20px] border-[2px] border-white/10 rounded-full pointer-events-none animate-pulse"></div>
    </div>
  );
};

export default Wheel;
