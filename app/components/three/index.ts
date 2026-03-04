/**
 * @file index.ts
 * @description Export de tous les composants Three.js
 * @author Agent 3 - Three.js Environment
 */

// Composant principal
// export { default as SecurityRoom } from './SecurityRoom';
// export type { SecurityRoomProps } from './SecurityRoom';
export { default as SecurityRoom } from './SecurityRoomV2';
export type { SecurityRoomV2Props as SecurityRoomProps } from './SecurityRoomV2';

// Pièce et environnement
export { default as Room } from './Room';
export type { RoomProps } from './Room';

// Éclairage
export { default as CeilingLights } from './CeilingLights';
export type { CeilingLightsProps } from './CeilingLights';

export { default as FlickeringLight } from './FlickeringLight';
export type { FlickeringLightProps } from './FlickeringLight';

// Écrans
export { default as SurveillanceScreens } from './SurveillanceScreens';
export type { SurveillanceScreensProps } from './SurveillanceScreens';

export { default as MainScreen } from './MainScreen';
export type { MainScreenProps } from './MainScreen';

export { default as ScreenMonitor } from './ScreenMonitor';
export type { ScreenMonitorProps } from './ScreenMonitor';

// Portails
export { default as DoorPortals } from './DoorPortals';
export type { DoorPortalsProps, PortalType } from './DoorPortals';

export { default as PortalDoor } from './PortalDoor';
export type { PortalDoorProps } from './PortalDoor';

// Mobilier
export { default as Desk } from './Desk';
export type { DeskProps } from './Desk';

// Contrôles
export { default as CameraController } from './CameraController';
export type { CameraControllerProps } from './CameraController';
