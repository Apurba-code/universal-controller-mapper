/**
 * Universal Controller Mapper - Popup Script
 * Manages Profile 1 (3D Games) and Profile 2 (Soccer)
 */

document.addEventListener('DOMContentLoaded', () => {
  let activeProfileId = 'profile1';
  let profiles = {};
  let isRecordingButton = null;

  const defaultProfiles = {
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
        RT: { key: 'Alt', code: 'AltLeft', keyCode: 18, label: 'Alt' },
        DPAD_UP: { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38, label: 'Up' },
        DPAD_DOWN: { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40, label: 'Down' },
        DPAD_LEFT: { key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37, label: 'Left' },
        DPAD_RIGHT: { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39, label: 'Right' }
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
        A: { key: ' ', code: 'Space', keyCode: 32, label: 'Space (Shoot)' },
        B: { key: 'Shift', code: 'ShiftLeft', keyCode: 16, label: 'Shift (Sprint)' },
        X: { key: 'c', code: 'KeyC', keyCode: 67, label: 'C (Pass)' },
        Y: { key: 'v', code: 'KeyV', keyCode: 86, label: 'V (Skill)' },
        LB: { key: 'q', code: 'KeyQ', keyCode: 81, label: 'Q (Switch L)' },
        RB: { key: 'e', code: 'KeyE', keyCode: 69, label: 'E (Switch R)' },
        LT: { key: 'Control', code: 'ControlLeft', keyCode: 17, label: 'Control' },
        RT: { key: 'Alt', code: 'AltLeft', keyCode: 18, label: 'Alt' },
        DPAD_UP: { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38, label: 'Up' },
        DPAD_DOWN: { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40, label: 'Down' },
        DPAD_LEFT: { key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37, label: 'Left' },
        DPAD_RIGHT: { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39, label: 'Right' }
      }
    }
  };

  const lbSelect = document.getElementById('lbSelect');
  const rbSelect = document.getElementById('rbSelect');
  const bumperContainer = document.getElementById('bumperSelectContainer');

  function updateBumperDropdownVisibility() {
    if (activeProfileId === 'profile1') {
      bumperContainer.style.display = 'flex';
      const cur = profiles[activeProfileId] || defaultProfiles.profile1;
      lbSelect.value = cur.lbAction || 'DEFAULT';
      rbSelect.value = cur.rbAction || 'DEFAULT';
    } else {
      bumperContainer.style.display = 'none';
    }
  }

  function renderMappings() {
    updateBumperDropdownVisibility();

    const container = document.getElementById('mappingsContainer');
    if (!container) return;
    container.innerHTML = '';

    const currentProfile = profiles[activeProfileId] || defaultProfiles[activeProfileId];
    const mappings = currentProfile.mappings || {};

    const buttonLabels = {
      L_STICK_UP: 'Left Stick Up',
      L_STICK_DOWN: 'Left Stick Down',
      L_STICK_LEFT: 'Left Stick Left',
      L_STICK_RIGHT: 'Left Stick Right',
      A: 'A Button (Green)',
      B: 'B Button (Red)',
      X: 'X Button (Blue)',
      Y: 'Y Button (Yellow)',
      LB: 'LB (Bumper Left)',
      RB: 'RB (Bumper Right)',
      LT: 'LT (Trigger Left)',
      RT: 'RT (Trigger Right)',
      DPAD_UP: 'D-Pad Up',
      DPAD_DOWN: 'D-Pad Down',
      DPAD_LEFT: 'D-Pad Left',
      DPAD_RIGHT: 'D-Pad Right'
    };

    Object.keys(buttonLabels).forEach((btnKey) => {
      // HIDE LB and RB in Profile 1 since they are handled by the top dropdowns
      if (activeProfileId === 'profile1' && (btnKey === 'LB' || btnKey === 'RB')) {
        return;
      }

      const mapping = mappings[btnKey] || { label: 'Unassigned', key: '' };
      const item = document.createElement('div');
      item.className = 'mapping-item';

      const textCol = document.createElement('div');
      textCol.innerHTML = `<div class="mapping-label">${buttonLabels[btnKey]}</div><div class="mapping-desc">${btnKey}</div>`;

      const badge = document.createElement('div');
      badge.className = 'key-badge';
      badge.textContent = isRecordingButton === btnKey ? 'Press key...' : (mapping.label || mapping.key || 'None');

      badge.addEventListener('click', () => {
        isRecordingButton = btnKey;
        renderMappings();
      });

      item.appendChild(textCol);
      item.appendChild(badge);
      container.appendChild(item);
    });
  }

  // Handle dropdown changes for Profile 1
  lbSelect.addEventListener('change', (e) => {
    if (profiles[activeProfileId]) profiles[activeProfileId].lbAction = e.target.value;
  });

  rbSelect.addEventListener('change', (e) => {
    if (profiles[activeProfileId]) profiles[activeProfileId].rbAction = e.target.value;
  });

  // Key Recording Listener
  document.addEventListener('keydown', (e) => {
    if (isRecordingButton) {
      e.preventDefault();
      const currentProfile = profiles[activeProfileId] || defaultProfiles[activeProfileId];
      currentProfile.mappings[isRecordingButton] = {
        key: e.key,
        code: e.code,
        keyCode: e.keyCode,
        label: e.code.replace('Key', '').replace('Arrow', '') || e.key.toUpperCase()
      };
      isRecordingButton = null;
      renderMappings();
    }
  });

  // Profile Switching
  document.querySelectorAll('.profile-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.profile-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeProfileId = btn.getAttribute('data-profile');
      renderMappings();
    });
  });

  // Save Settings
  document.getElementById('saveBtn').addEventListener('click', () => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.set({ activeProfileId, profiles }, () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0] && tabs[0].id) {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'RELOAD_PROFILE' });
          }
        });
        const saveBtn = document.getElementById('saveBtn');
        saveBtn.textContent = 'Saved!';
        setTimeout(() => { saveBtn.textContent = 'Save Profile'; }, 1500);
      });
    }
  });

  // Reset Active Profile
  document.getElementById('resetBtn').addEventListener('click', () => {
    profiles[activeProfileId] = JSON.parse(JSON.stringify(defaultProfiles[activeProfileId]));
    renderMappings();
  });

  // Initialization
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get(['activeProfileId', 'profiles'], (data) => {
      activeProfileId = data.activeProfileId || 'profile1';
      profiles = data.profiles || JSON.parse(JSON.stringify(defaultProfiles));

      delete profiles.profile3;

      document.querySelectorAll('.profile-btn').forEach((btn) => {
        if (btn.getAttribute('data-profile') === activeProfileId) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
      renderMappings();
    });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_GAMEPAD_STATUS' }, (response) => {
          const badge = document.getElementById('controllerStatus');
          const statusText = document.getElementById('statusText');
          if (response && response.connected) {
            badge.className = 'status-badge status-connected';
            statusText.textContent = 'Xbox Connected';
          } else {
            badge.className = 'status-badge status-disconnected';
            statusText.textContent = 'Disconnected';
          }
        });
      }
    });
  } else {
    profiles = JSON.parse(JSON.stringify(defaultProfiles));
    renderMappings();
  }
});