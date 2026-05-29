declare module 'matter-js' {
  namespace Matter {
    interface Engine {
      gravity: {
        x: number;
        y: number;
      };
      world: World;
    }

    interface World {
      bodies: Body[];
      [key: string]: any;
    }

    interface Body {
      position: {
        x: number;
        y: number;
      };
      isStatic: boolean;
      label?: string;
      [key: string]: any;
    }

    interface RenderOptions {
      width?: number;
      height?: number;
      wireframes?: boolean;
      background?: string;
      [key: string]: any;
    }

    interface Render {
      [key: string]: any;
    }

    interface Runner {
      [key: string]: any;
    }

    const Engine: {
      create: () => Engine;
      clear: (engine: Engine) => void;
    };

    const World: {
      add: (world: World, bodies: Body | Body[]) => void;
    };

    const Bodies: {
      rectangle: (x: number, y: number, width: number, height: number, options?: any) => Body;
      circle: (x: number, y: number, radius: number, options?: any) => Body;
      polygon: (
        x: number,
        y: number,
        sides: number,
        radius: number,
        options?: any
      ) => Body;
    };

    const Body: {
      applyForce: (body: Body, position: any, force: any) => void;
      setPosition: (body: Body, position: { x: number; y: number }) => void;
      setVertices: (body: Body, vertices: { x: number; y: number }[]) => void;
    };

    const Render: {
      create: (options: any) => Render;
      run: (render: Render) => void;
      stop: (render: Render) => void;
      setSize: (render: Render, width: number, height: number) => void;
    };

    const Runner: {
      create: () => Runner;
      run: (runner: Runner, engine: Engine) => void;
      stop: (runner: Runner) => void;
    };
  }

  const Matter: {
    Engine: typeof Matter.Engine;
    World: typeof Matter.World;
    Bodies: typeof Matter.Bodies;
    Body: typeof Matter.Body;
    Render: typeof Matter.Render;
    Runner: typeof Matter.Runner;
  };

  export default Matter;
}
