/**
 * Universal Controller Mapper - Background Service Worker
 */

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    const initialProfiles = {
      profile1: {
        id: 'profile1',
        name: '3D Games',
        lbAction: 'RIGHT_CLICK',
        rbAction: 'LEFT_CLICK',
        mappings: {
          L_STICK_UP: { key: 'w', code: 'KeyW', keyCode: 87, label: 'W' },
          L_STICK_DOWN: { key: 's', code: 'KeyS', keyCode: 83, label: 'S' },
          L_STICK_LEFT: { key: 'a', code: 'KeyA', keyCode: 65, label: 'A' },
          L_STICK_RIGHT: { key: 'd', code: 'KeyD', keyCode: 68, label: 'D' },
          A: { key: ' ', code: 'Space', keyCode: 32, label: 'Space' },
          B: { key: 'Shift', code: 'ShiftLeft', keyCode: 16, label: 'Shift' },
          X: { key: 'e', code: 'KeyE', keyCode: 69, label: 'E' },
          Y: { key: 'r', code: 'KeyR', keyCode: 82, label: 'R' },
          LB: { key: 'q', code: 'KeyQ', keyCode: 81, label: 'Q' },
          RB: { key: 'f', code: 'KeyF', keyCode: 70, label: 'F' },
          LT: { key: 'Control', code: 'ControlLeft', keyCode: 17, label: 'Control' },
          RT: { key: 'Alt', code: 'AltLeft', keyCode: 18, label: 'Alt' }
        }
      },
      profile2: {
        id: 'profile2',
        name: 'Soccer',
        lbAction: 'DEFAULT',
        rbAction: 'DEFAULT',
        mappings: {
          L_STICK_UP: { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38, label: 'Up' },
          L_STICK_DOWN: { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40, label: 'Down' },
          L_STICK_LEFT: { key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37, label: 'Left' },
          L_STICK_RIGHT: { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39, label: 'Right' },
          A: { key: ' ', code: 'Space', keyCode: 32, label: 'Space' },
          B: { key: 'Shift', code: 'ShiftLeft', keyCode: 16, label: 'Shift' },
          X: { key: 'c', code: 'KeyC', keyCode: 67, label: 'C' },
          Y: { key: 'v', code: 'KeyV', keyCode: 86, label: 'V' },
          LB: { key: 'q', code: 'KeyQ', keyCode: 81, label: 'Q' },
          RB: { key: 'e', code: 'KeyE', keyCode: 69, label: 'E' },
          LT: { key: 'Control', code: 'ControlLeft', keyCode: 17, label: 'Control' },
          RT: { key: 'Alt', code: 'AltLeft', keyCode: 18, label: 'Alt' }
        }
      }
    };

    chrome.storage.sync.set({
      activeProfileId: 'profile1',
      profiles: initialProfiles,
      enabled: true
    });
  }
});