declare module 'matter-js' {
  export interface Engine {
    gravity: {
      x: number;
      y: number;
    };
    world: World;
  }

  export interface World {
    bodies: Body[];
    [key: string]: any;
  }

  export interface Body {
    position: {
      x: number;
      y: number;
    };
    isStatic: boolean;
    label?: string;
    [key: string]: any;
  }

  export interface RenderOptions {
    width?: number;
    height?: number;
    wireframes?: boolean;
    background?: string;
    [key: string]: any;
  }

  export interface Render {
    [key: string]: any;
  }

  export interface Runner {
    [key: string]: any;
  }

  export const Engine: {
    create: () => Engine;
    clear: (engine: Engine) => void;
  };

  export const World: {
    add: (world: World, bodies: Body | Body[]) => void;
  };

  export const Bodies: {
    rectangle: (x: number, y: number, width: number, height: number, options?: any) => Body;
    circle: (x: number, y: number, radius: number, options?: any) => Body;
  };

  export const Body: {
    applyForce: (body: Body, position: any, force: any) => void;
  };

  export const Render: {
    create: (options: any) => Render;
    run: (render: Render) => void;
    stop: (render: Render) => void;
    setSize: (render: Render, width: number, height: number) => void;
  };

  export const Runner: {
    create: () => Runner;
    run: (runner: Runner, engine: Engine) => void;
    stop: (runner: Runner) => void;
  };

  const Matter: {
    Engine: typeof Engine;
    World: typeof World;
    Bodies: typeof Bodies;
    Body: typeof Body;
    Render: typeof Render;
    Runner: typeof Runner;
  };

  export default Matter;
}
