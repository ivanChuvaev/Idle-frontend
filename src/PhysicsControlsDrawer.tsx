import * as Dialog from '@radix-ui/react-dialog';
import './PhysicsControlsDrawer.css';

interface PhysicsControlsDrawerProps {
  isActive: boolean;
  onToggleActive: () => void;
}

export function PhysicsControlsDrawer({
  isActive,
  onToggleActive,
}: PhysicsControlsDrawerProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button type="button" className="physics-drawer-open-btn" aria-label="Open controls">
          <svg
            className="physics-drawer-open-icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="physics-drawer-overlay" />
        <Dialog.Content className="physics-drawer-content">
          <div className="physics-drawer-handle" aria-hidden />
          <Dialog.Title className="physics-drawer-title">Physics Demo</Dialog.Title>
          <Dialog.Description className="physics-drawer-description">
            Tap or click the canvas to create a gravity point.
          </Dialog.Description>

          <button
            type="button"
            onClick={onToggleActive}
            className="physics-drawer-toggle"
          >
            {isActive ? 'Pause' : 'Resume'}
          </button>

          <Dialog.Close asChild>
            <button type="button" className="physics-drawer-close" aria-label="Close">
              Close
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
