
import { Manager } from './Manager';
import { LobbyScene } from './scenes/LobbyScene';
import { loadAssets } from './scripts/assetLoad';

async function loadGame(): Promise<void> {
  const loading = document.getElementById('loading');
  const barFill = document.getElementById('bar-fill');
  const updateProgress = (progress: number) => {
    barFill.style.width = `${progress * 100}%`;
  }
  await loadAssets(updateProgress);
  setTimeout(() => {
    loading.style.display = 'none';
  }, 200);
}

(async function () {
  const app = await Manager.initialize();
  
  (globalThis as any).__PIXI_APP__ = app;

  await loadGame();
  Manager.changeScene(new LobbyScene());
})();
