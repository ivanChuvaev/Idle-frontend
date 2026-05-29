import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { PhysicsControlsDrawer } from './PhysicsControlsDrawer';

interface GravityPoint {
  x: number;
  y: number;
  strength: number;
}

interface ViewportSize {
  width: number;
  height: number;
}

function getContainerSize(container: HTMLElement): ViewportSize {
  const { width, height } = container.getBoundingClientRect();
  return {
    width: Math.max(1, Math.round(width)),
    height: Math.max(1, Math.round(height)),
  };
}

function isMobileViewport(width: number): boolean {
  return width < 768;
}

function updateStaticWall(body: Matter.Body, template: Matter.Body) {
  Matter.Body.setPosition(body, template.position);
  Matter.Body.setVertices(body, template.vertices);
}

type ScatterShape = 'circle' | 'square' | 'triangle';

const SCATTER_SHAPES: ScatterShape[] = ['circle', 'square', 'triangle'];

function createScatterBody(
  x: number,
  y: number,
  shape: ScatterShape,
  size: number,
  color: string,
  mobile: boolean
): Matter.Body {
  const physics = {
    friction: 0.5,
    restitution: 0.8,
    frictionAir: mobile ? 0.03 : 0.02,
    render: { fillStyle: color },
  };

  switch (shape) {
    case 'square': {
      const side = size * 2;
      return Matter.Bodies.rectangle(x, y, side, side, physics);
    }
    case 'triangle':
      return Matter.Bodies.polygon(x, y, 3, size * 1.15, physics);
    default:
      return Matter.Bodies.circle(x, y, size, physics);
  }
}

function createWalls(width: number, height: number) {
  const wallThickness = 20;
  return {
    ground: Matter.Bodies.rectangle(width / 2, height - wallThickness / 2, width, wallThickness, {
      isStatic: true,
      friction: 0.8,
    }),
    ceiling: Matter.Bodies.rectangle(width / 2, wallThickness / 2, width, wallThickness, {
      isStatic: true,
    }),
    leftWall: Matter.Bodies.rectangle(
      wallThickness / 2,
      height / 2,
      wallThickness,
      height,
      { isStatic: true }
    ),
    rightWall: Matter.Bodies.rectangle(
      width - wallThickness / 2,
      height / 2,
      wallThickness,
      height,
      { isStatic: true }
    ),
  };
}

export function PhysicsDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bodiesRef = useRef<Matter.Body[]>([]);
  const gravityPointRef = useRef<GravityPoint | null>(null);
  const isActiveRef = useRef(true);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const { width, height } = getContainerSize(container);
    const mobile = isMobileViewport(width);
    const bodyCount = mobile ? 28 : 50;
    const gravityRange = Math.min(500, Math.max(width, height) * 0.55);

    const engine = Matter.Engine.create();
    engine.gravity.y = 0;
    engine.gravity.x = 0;

    const world = engine.world;

    const render = Matter.Render.create({
      canvas,
      engine,
      options: {
        width,
        height,
        wireframes: false,
        background: '#1a1a2e',
      },
    });

    const walls = createWalls(width, height);
    Matter.World.add(world, [
      walls.ground,
      walls.ceiling,
      walls.leftWall,
      walls.rightWall,
    ]);

    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9'];
    const margin = mobile ? 40 : 50;
    bodiesRef.current = [];

    for (let i = 0; i < bodyCount; i++) {
      const size = Math.random() * (mobile ? 6 : 8) + (mobile ? 5 : 4);
      const shape = SCATTER_SHAPES[i % SCATTER_SHAPES.length];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const body = createScatterBody(
        Math.random() * (width - margin * 2) + margin,
        Math.random() * (height - margin * 3) + margin,
        shape,
        size,
        color,
        mobile
      );

      Matter.World.add(world, body);
      bodiesRef.current.push(body);
    }

    Matter.Render.run(render);
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    const animationFrame = setInterval(() => {
      const gravity = gravityPointRef.current;
      if (!gravity || !isActiveRef.current) return;

      bodiesRef.current.forEach((body) => {
        if (body.isStatic) return;

        const dx = gravity.x - body.position.x;
        const dy = gravity.y - body.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < gravityRange && distance > 0) {
          const strength = gravity.strength * (1 - distance / gravityRange);
          const forceScale = mobile ? 0.00006 : 0.00005;
          Matter.Body.applyForce(body, body.position, {
            x: (dx / distance) * strength * forceScale,
            y: (dy / distance) * strength * forceScale,
          });
        }
      });
    }, 1000 / 60);

    const setGravityAt = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = render.options.width / rect.width;
      const scaleY = render.options.height / rect.height;

      gravityPointRef.current = {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
        strength: mobile ? 6 : 5,
      };

      setTimeout(() => {
        gravityPointRef.current = null;
      }, 3000);
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        e.preventDefault();
      }
      setGravityAt(e.clientX, e.clientY);
    };

    canvas.addEventListener('pointerdown', handlePointerDown);

    const applySize = (nextWidth: number, nextHeight: number) => {
      Matter.Render.setSize(render, nextWidth, nextHeight);
      render.canvas.width = nextWidth;
      render.canvas.height = nextHeight;
      render.options.width = nextWidth;
      render.options.height = nextHeight;

      const nextWalls = createWalls(nextWidth, nextHeight);
      updateStaticWall(walls.ground, nextWalls.ground);
      updateStaticWall(walls.ceiling, nextWalls.ceiling);
      updateStaticWall(walls.leftWall, nextWalls.leftWall);
      updateStaticWall(walls.rightWall, nextWalls.rightWall);
    };

    const handleResize = () => {
      const { width: nextWidth, height: nextHeight } = getContainerSize(container);
      if (nextWidth === render.options.width && nextHeight === render.options.height) {
        return;
      }
      applySize(nextWidth, nextHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    const visualViewport = window.visualViewport;
    visualViewport?.addEventListener('resize', handleResize);
    visualViewport?.addEventListener('scroll', handleResize);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      resizeObserver.disconnect();
      visualViewport?.removeEventListener('resize', handleResize);
      visualViewport?.removeEventListener('scroll', handleResize);
      clearInterval(animationFrame);
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
    };
  }, []);

  return (
    <div ref={containerRef} className="physics-container">
      <canvas ref={canvasRef} className="physics-canvas" />
      <PhysicsControlsDrawer
        isActive={isActive}
        onToggleActive={() => setIsActive((active) => !active)}
      />
      <style>{`
        .physics-container {
          width: 100%;
          height: 100vh;
          height: 100dvh;
          margin: 0;
          padding: 0;
          overflow: hidden;
          position: fixed;
          inset: 0;
          background: #1a1a2e;
          touch-action: none;
          -webkit-user-select: none;
          user-select: none;
        }

        .physics-canvas {
          display: block;
          width: 100%;
          height: 100%;
          touch-action: none;
        }

      `}</style>
    </div>
  );
}
