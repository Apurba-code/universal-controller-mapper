# Universal Controller Mapper (Manifest V3 Chrome Extension)

An enterprise-grade Chrome Extension for mapping Xbox Controller inputs—including analog Triggers (**LT/RT**) and Bumpers (**LB/RB**)—directly to synthetic Keyboard Keys on browser gaming sites like **Poki.com**, **CrazyGames.com**, and HTML5 arcade games.

---

## 🛠 Features & Architecture

### 1. High-Precision Keymapper Loop (`content.js`)
- **`requestAnimationFrame` Polling:** Polls `navigator.getGamepads()` at display refresh rate (60Hz / 144Hz / 240Hz) with zero DOM reflow lag.
- **Left Joystick Deadzone (`0.20`):** Ignores stick drift below `0.20` and maps clean orthogonal movement to WASD or Arrow Keys.
- **Bumper Support:** Maps **LB** (`buttons[4]`) and **RB** (`buttons[5]`) to custom digital button presses (default: `Q` / `F`).
- **Analog Trigger Threshold (`>= 0.15`):** Monitors **LT** (`buttons[6]`) and **RT** (`buttons[7]`) analog values (`0.0 - 1.0`). Fires synthetic keypresses the moment trigger pressure hits `0.15`.
- **State Deduplication:** Maintains a hashmap of active button states (`activeKeyStates`) so holding a trigger or button fires exactly **one** `keydown` event on press and **one** `keyup` event on release.
- **Full `KeyboardEvent` Spec:** Emits events with valid `key`, `code`, `keyCode`, and `which` properties targeted at `document.activeElement` or `window`.

### 2. 3-Profile Storage & UI (`popup.html` / `popup.js`)
- **3 Profile Slots:** Switch instantly between Profile 1 (FPS/WASD), Profile 2 (Platformer/Arcade), and Profile 3 (Racing).
- **Chrome Sync Storage:** Saves profiles directly to `chrome.storage.sync`.
- **Live Controller Status Indicator:** Displays green **"Xbox Connected"** badge or red **"Disconnected"** badge when clicking the extension icon.

---

## 📦 How to Load in Chrome

1. Click the **"Download Extension .ZIP (Load Unpacked)"** button in the studio header above.
2. Unzip the archive to a local folder on your computer.
3. Open Google Chrome and go to `chrome://extensions`.
4. Enable **Developer mode** in the top right corner.
5. Click **Load unpacked** and select the folder containing `manifest.json`.
6. Open any game on **poki.com** or **crazygames.com**, plug in your Xbox / Bluetooth controller, and start playing!
