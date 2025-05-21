
import React, { useEffect, useRef } from 'react';

const LoginBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Ajustar o canvas para cobrir toda a tela
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Definir partículas para criar o efeito de "análise de conteúdo"
    type Particle = {
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      text?: string;
    };
    
    const particles: Particle[] = [];
    const colors = ['#2563EB', '#4F46E5', '#818CF8', '#E0E7FF'];
    const textElements = ['A', 'B', 'C', '0', '1', '?', '!', '#', '@', '*'];
    
    // Criar partículas iniciais
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 4 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (Math.random() - 0.5) * 1,
        speedY: (Math.random() - 0.5) * 1,
        text: Math.random() > 0.7 ? textElements[Math.floor(Math.random() * textElements.length)] : undefined
      });
    }
    
    // Função de animação
    const animate = () => {
      // Criar um efeito de "rastro" com transparência
      ctx.fillStyle = 'rgba(240, 245, 255, 0.03)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Desenhar gradiente de fundo
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'rgba(240, 248, 255, 0.8)');
      gradient.addColorStop(1, 'rgba(224, 231, 255, 0.8)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Desenhar e atualizar partículas
      particles.forEach((particle) => {
        if (particle.text) {
          ctx.fillStyle = particle.color;
          ctx.font = `${particle.size * 8}px Arial`;
          ctx.fillText(particle.text, particle.x, particle.y);
        } else {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = particle.color;
          ctx.fill();
        }
        
        // Movimento das partículas
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Loop para as partículas que saem da tela
        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
      });
      
      // Conectar partículas próximas com linhas
      particles.forEach((particleA) => {
        particles.forEach((particleB) => {
          const dx = particleA.x - particleB.x;
          const dy = particleA.y - particleB.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.2 - distance / 500})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particleA.x, particleA.y);
            ctx.lineTo(particleB.x, particleB.y);
            ctx.stroke();
          }
        });
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full -z-10"
    />
  );
};

export default LoginBackground;
