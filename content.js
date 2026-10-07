/**
 * Universal Controller Mapper - Manifest V3 Content Script
 * Author: Senior Chrome Extension Developer
 */

// Prevent duplicate injection in the same window/frame
if (window.__UNIVERSAL_CONTROLLER_MAPPER_LOADED__) {
  console.warn('[Universal Controller Mapper] Script already loaded on this frame.');
  throw new Error('Duplicate instance prevented.');
}
window.__UNIVERSAL_CONTROLLER_MAPPER_LOADED__ = true;

(function () {
  'use strict';

  // State arrays and constants
  const DEADZONE_THRESHOLD = 0.20;
  const TRIGGER_THRESHOLD = 0.15;
  const CAMERA_LOOK_SPEED = 12;

  // Active profile mappings
  let currentMappings = {};
  let currentLbAction = 'DEFAULT';
  let currentRbAction = 'DEFAULT';
  let isExtensionEnabled = true;

  // Mouse click state tracking
  let isLeftClicking = false;
  let isRightClicking = false;

  const activeKeyStates = new Map();
  let lastConnectedState = false;

  const DEFAULT_PRESET = {
    L_STICK_UP: { key: 'w', code: 'KeyW', keyCode: 87 },
    L_STICK_DOWN: { key: 's', code: 'KeyS', keyCode: 83 },
    L_STICK_LEFT: { key: 'a', code: 'KeyA', keyCode: 65 },
    L_STICK_RIGHT: { key: 'd', code: 'KeyD', keyCode: 68 },
    A: { key: ' ', code: 'Space', keyCode: 32 },
    B: { key: 'Shift', code: 'ShiftLeft', keyCode: 16 },
    X: { key: 'e', code: 'KeyE', keyCode: 69 },
    Y: { key: 'r', code: 'KeyR', keyCode: 82 },
    LB: { key: 'q', code: 'KeyQ', keyCode: 81 },
    RB: { key: 'f', code: 'KeyF', keyCode: 70 },
    LT: { key: 'Control', code: 'ControlLeft', keyCode: 17 },
    RT: { key: 'Alt', code: 'AltLeft', keyCode: 18 },
    DPAD_UP: { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38 },
    DPAD_DOWN: { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40 },
    DPAD_LEFT: { key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37 },
    DPAD_RIGHT: { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39 },
    BACK: { key: 'Escape', code: 'Escape', keyCode: 27 },
    START: { key: 'Enter', code: 'Enter', keyCode: 13 },
    L_STICK_BTN: { key: 'c', code: 'KeyC', keyCode: 67 },
    R_STICK_BTN: { key: 'v', code: 'KeyV', keyCode: 86 }
  };

  /**
   * Initialize profile from chrome.storage.sync
   */
  function loadProfileFromStorage() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get(['activeProfileId', 'profiles', 'enabled'], (data) => {
        const activeId = data.activeProfileId || 'profile1';
        const profiles = data.profiles || {};

        if (profiles[activeId]) {
          currentMappings = profiles[activeId].mappings || DEFAULT_PRESET;
          currentLbAction = profiles[activeId].lbAction || 'DEFAULT';
          currentRbAction = profiles[activeId].rbAction || 'DEFAULT';
        } else {
          currentMappings = DEFAULT_PRESET;
          currentLbAction = 'DEFAULT';
          currentRbAction = 'DEFAULT';
        }

        isExtensionEnabled = data.enabled !== false;
        console.log('[Universal Controller Mapper] Profile Loaded:', activeId, '| LB:', currentLbAction, '| RB:', currentRbAction);
      });
    } else {
      currentMappings = DEFAULT_PRESET;
      currentLbAction = 'DEFAULT';
      currentRbAction = 'DEFAULT';
    }
  }

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'sync') loadProfileFromStorage();
    });
  }

  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'GET_GAMEPAD_STATUS') {
        sendResponse({ connected: lastConnectedState });
        return true;
      }
      if (message.type === 'RELOAD_PROFILE') {
        loadProfileFromStorage();
        sendResponse({ success: true });
        return true;
      }
    });
  }

  function dispatchKeyboardEvent(type, mapping) {
    if (!mapping || !mapping.key) return;

    const eventInit = {
      key: mapping.key,
      code: mapping.code,
      keyCode: mapping.keyCode,
      which: mapping.keyCode,
      bubbles: true,
      cancelable: true,
      composed: true
    };

    const event = new KeyboardEvent(type, eventInit);
    Object.defineProperty(event, 'keyCode', { get: () => mapping.keyCode });
    Object.defineProperty(event, 'which', { get: () => mapping.keyCode });
    Object.defineProperty(event, 'charCode', { get: () => mapping.keyCode });

    const target = (document.activeElement && document.activeElement !== document.body)
      ? document.activeElement
      : document;

    target.dispatchEvent(event);
    if (target !== window) window.dispatchEvent(event);
  }

  function handleButtonStateChange(buttonName, isPressed) {
    const wasPressed = activeKeyStates.get(buttonName) || false;

    if (isPressed && !wasPressed) {
      activeKeyStates.set(buttonName, true);
      const mapping = currentMappings[buttonName];
      if (mapping && mapping.key) {
        dispatchKeyboardEvent('keydown', mapping);
      }
    } else if (!isPressed && wasPressed) {
      activeKeyStates.set(buttonName, false);
      const mapping = currentMappings[buttonName];
      if (mapping && mapping.key) {
        dispatchKeyboardEvent('keyup', mapping);
      }
    }
  }

  function pollGamepads() {
    if (!isExtensionEnabled) {
      requestAnimationFrame(pollGamepads);
      return;
    }

    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    let connectedController = null;

    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i] && gamepads[i].connected) {
        connectedController = gamepads[i];
        break;
      }
    }

    lastConnectedState = !!connectedController;

    if (connectedController) {
      const buttons = connectedController.buttons;
      const axes = connectedController.axes;

      // 1. Digital Face Buttons A, B, X, Y
      handleButtonStateChange('A', buttons[0] && buttons[0].pressed);
      handleButtonStateChange('B', buttons[1] && buttons[1].pressed);
      handleButtonStateChange('X', buttons[2] && buttons[2].pressed);
      handleButtonStateChange('Y', buttons[3] && buttons[3].pressed);

      // 2. Bumpers LB & RB logic
      const isLbPressed = !!(buttons[4] && buttons[4].pressed);
      const isRbPressed = !!(buttons[5] && buttons[5].pressed);

      // Check if LB/RB are assigned to mouse clicks based on profile selection
      const isLbLeft = currentLbAction === 'LEFT_CLICK';
      const isLbRight = currentLbAction === 'RIGHT_CLICK';
      const isRbLeft = currentRbAction === 'LEFT_CLICK';
      const isRbRight = currentRbAction === 'RIGHT_CLICK';

      const isLeftClickPressed = (isLbLeft && isLbPressed) || (isRbLeft && isRbPressed);
      const isRightClickPressed = (isLbRight && isLbPressed) || (isRbRight && isRbPressed);

      const clickTarget = document.pointerLockElement || document.querySelector('canvas') || document.activeElement || document.body;

      // Execute Left Click
      if (isLeftClickPressed && !isLeftClicking) {
        isLeftClicking = true;
        clickTarget.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window, button: 0, buttons: 1 }));
      } else if (!isLeftClickPressed && isLeftClicking) {
        isLeftClicking = false;
        clickTarget.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window, button: 0, buttons: 0 }));
        clickTarget.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window, button: 0 }));
      }

      // Execute Right Click
      if (isRightClickPressed && !isRightClicking) {
        isRightClicking = true;
        clickTarget.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window, button: 2, buttons: 2 }));
      } else if (!isRightClickPressed && isRightClicking) {
        isRightClicking = false;
        clickTarget.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window, button: 2, buttons: 0 }));
        clickTarget.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, view: window, button: 2 }));
      }

      // If LB or RB are NOT set to mouse clicks, handle them as regular keyboard key mappings
      if (!isLbLeft && !isLbRight) {
        handleButtonStateChange('LB', isLbPressed);
      }
      if (!isRbLeft && !isRbRight) {
        handleButtonStateChange('RB', isRbPressed);
      }

      // 3. Triggers LT & RT
      const ltValue = buttons[6] ? buttons[6].value : 0;
      const rtValue = buttons[7] ? buttons[7].value : 0;
      const isLtPressed = (buttons[6] && buttons[6].pressed) || ltValue >= TRIGGER_THRESHOLD;
      const isRtPressed = (buttons[7] && buttons[7].pressed) || rtValue >= TRIGGER_THRESHOLD;

      handleButtonStateChange('LT', isLtPressed);
      handleButtonStateChange('RT', isRtPressed);

      // 4. Menu & Stick Clicks
      handleButtonStateChange('BACK', buttons[8] && buttons[8].pressed);
      handleButtonStateChange('START', buttons[9] && buttons[9].pressed);
      handleButtonStateChange('L_STICK_BTN', buttons[10] && buttons[10].pressed);
      handleButtonStateChange('R_STICK_BTN', buttons[11] && buttons[11].pressed);

      // 5. D-Pad Camera Look
      const dpadUp = !!(buttons[12] && buttons[12].pressed);
      const dpadDown = !!(buttons[13] && buttons[13].pressed);
      const dpadLeft = !!(buttons[14] && buttons[14].pressed);
      const dpadRight = !!(buttons[15] && buttons[15].pressed);

      handleButtonStateChange('DPAD_UP', dpadUp);
      handleButtonStateChange('DPAD_DOWN', dpadDown);
      handleButtonStateChange('DPAD_LEFT', dpadLeft);
      handleButtonStateChange('DPAD_RIGHT', dpadRight);

      let deltaX = 0;
      let deltaY = 0;

      if (dpadRight) deltaX += CAMERA_LOOK_SPEED;
      if (dpadLeft) deltaX -= CAMERA_LOOK_SPEED;
      if (dpadDown) deltaY += CAMERA_LOOK_SPEED;
      if (dpadUp) deltaY -= CAMERA_LOOK_SPEED;

      if ((deltaX !== 0 || deltaY !== 0) && document.pointerLockElement) {
        document.pointerLockElement.dispatchEvent(new MouseEvent("mousemove", {
          bubbles: true,
          cancelable: true,
          view: window,
          movementX: deltaX,
          movementY: deltaY
        }));
      }

      // 6. Left Joystick
      const leftX = axes[0] || 0;
      const leftY = axes[1] || 0;

      handleButtonStateChange('L_STICK_LEFT', leftX <= -DEADZONE_THRESHOLD);
      handleButtonStateChange('L_STICK_RIGHT', leftX >= DEADZONE_THRESHOLD);
      handleButtonStateChange('L_STICK_UP', leftY <= -DEADZONE_THRESHOLD);
      handleButtonStateChange('L_STICK_DOWN', leftY >= DEADZONE_THRESHOLD);
    }

    requestAnimationFrame(pollGamepads);
  }

  loadProfileFromStorage();

  window.addEventListener("gamepadconnected", (e) => {
    if (!lastConnectedState) {
      console.log("[Universal Controller Mapper] Gamepad connected:", e.gamepad.id);
      lastConnectedState = true;
    }
  });

  window.addEventListener("gamepaddisconnected", (e) => {
    if (lastConnectedState) {
      console.log("[Universal Controller Mapper] Gamepad disconnected");
      lastConnectedState = false;
    }
  });

  requestAnimationFrame(pollGamepads);
  console.log('[Universal Controller Mapper] Active');
})();