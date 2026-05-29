import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';

interface GravityPoint {
  x: number;
  y: number;
  strength: number;
}

export function PhysicsDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const bodiesRef = useRef<Matter.Body[]>([]);
  const gravityPointRef = useRef<GravityPoint | null>(null);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create engine
    const engine = Matter.Engine.create();
    engineRef.current = engine;

    // Set gravity to near zero - we'll use custom gravity
    engine.gravity.y = 0;
    engine.gravity.x = 0;

    // Create world
    const world = engine.world;

    // Create renderer
    const render = Matter.Render.create({
      canvas: canvas,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: '#1a1a2e',
      },
    });

    // Create boundaries
    const ground = Matter.Bodies.rectangle(
      window.innerWidth / 2,
      window.innerHeight - 10,
      window.innerWidth,
      20,
      { isStatic: true, friction: 0.8 }
    );

    const ceiling = Matter.Bodies.rectangle(
      window.innerWidth / 2,
      10,
      window.innerWidth,
      20,
      { isStatic: true }
    );

    const leftWall = Matter.Bodies.rectangle(10, window.innerHeight / 2, 20, window.innerHeight, {
      isStatic: true,
    });

    const rightWall = Matter.Bodies.rectangle(
      window.innerWidth - 10,
      window.innerHeight / 2,
      20,
      window.innerHeight,
      { isStatic: true }
    );

    Matter.World.add(world, [ground, ceiling, leftWall, rightWall]);

    // Create scatter objects
    bodiesRef.current = [];
    for (let i = 0; i < 50; i++) {
      const size = Math.random() * 8 + 4;
      const body = Matter.Bodies.circle(
        Math.random() * (window.innerWidth - 100) + 50,
        Math.random() * (window.innerHeight - 200) + 50,
        size,
        {
          friction: 0.5,
          restitution: 0.8,
          frictionAir: 0.02,
        }
      );

      // Random color
      const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9'];
      (body as any).label = colors[Math.floor(Math.random() * colors.length)];

      Matter.World.add(world, body);
      bodiesRef.current.push(body);
    }

    // Render loop
    Matter.Render.run(render);
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // Animation loop for custom gravity
    const animationFrame = setInterval(() => {
      if (gravityPointRef.current && isActive) {
        const gravity = gravityPointRef.current;

        bodiesRef.current.forEach((body) => {
          if (!body.isStatic) {
            const dx = gravity.x - body.position.x;
            const dy = gravity.y - body.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 500) {
              const strength = gravity.strength * (1 - distance / 500);
              const forceX = (dx / distance) * strength * 0.00005;
              const forceY = (dy / distance) * strength * 0.00005;

              Matter.Body.applyForce(body, body.position, {
                x: forceX,
                y: forceY,
              });
            }
          }
        });
      }
    }, 1000 / 60);

    // Handle canvas click
    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      gravityPointRef.current = {
        x,
        y,
        strength: 5,
      };

      // Fade out gravity after 3 seconds
      setTimeout(() => {
        gravityPointRef.current = null;
      }, 3000);
    };

    canvas.addEventListener('click', handleCanvasClick);

    // Handle window resize
    const handleResize = () => {
      Matter.Render.setSize(render, window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      canvas.removeEventListener('click', handleCanvasClick);
      window.removeEventListener('resize', handleResize);
      clearInterval(animationFrame);
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
    };
  }, [isActive]);

  return (
    <div className="physics-container">
      <canvas ref={canvasRef} className="physics-canvas" />
      <div className="physics-info">
        <h1>Physics Demo</h1>
        <p>Click anywhere on the canvas to create a gravity point!</p>
        <button onClick={() => setIsActive(!isActive)} className="toggle-btn">
          {isActive ? 'Pause' : 'Resume'}
        </button>
      </div>
      <style>{`
        .physics-container {
          width: 100vw;
          height: 100vh;
          margin: 0;
          padding: 0;
          overflow: hidden;
          position: relative;
          background: #1a1a2e;
        }

        .physics-canvas {
          display: block;
          width: 100%;
          height: 100%;
        }

        .physics-info {
          position: absolute;
          top: 20px;
          left: 20px;
          color: #ffffff;
          background: rgba(0, 0, 0, 0.7);
          padding: 20px;
          border-radius: 8px;
          font-family: Arial, sans-serif;
          z-index: 10;
        }

        .physics-info h1 {
          margin: 0 0 10px 0;
          font-size: 24px;
        }

        .physics-info p {
          margin: 0 0 15px 0;
          font-size: 14px;
          opacity: 0.8;
        }

        .toggle-btn {
          padding: 10px 20px;
          background: #ff6b6b;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          transition: background 0.3s;
        }

        .toggle-btn:hover {
          background: #ff5252;
        }
      `}</style>
    </div>
  );
}
