import { Assets, ProgressCallback, Texture } from "pixi.js";
import { SymbolID } from "./types";

export enum GameFont {
  DirtyHarold = 'DirtyHarold',
  Poppins = 'Poppins Bold',
};

export const GameAssets = {
  mainAtlas: 'main.json',
  background: 'back.jpg',
  buttonBase: 'button.png',
  buttonBasePressed: 'button.png',
  fireAtlas: 'fire_atlas.json',
  fog: 'fog1.png',
  fonts: [
    'fonts/DirtyHarold.woff2',
    'fonts/Poppins-Bold.ttf',
  ],
}

const SymbolAssetMap: Record<SymbolID, string> = {
  [SymbolID.Empty]: '',
  [SymbolID.Zombie]: 'cute.png',
  [SymbolID.Brain]: 'fist.png',
  [SymbolID.Skull]: 'girl.png',
  [SymbolID.Goblin]: 'master.png',
  [SymbolID.Eyes]: 'purple.png',
}

export function getSymbolTexture(symbolId: SymbolID): Texture | undefined {
  return Assets.get(GameAssets.mainAtlas).textures[SymbolAssetMap[symbolId]]
}

export async function loadAssets(onProgress: ProgressCallback): Promise<void> {
  await Assets.load([GameAssets.mainAtlas, GameAssets.fireAtlas, ...GameAssets.fonts], onProgress);
}

export function loadBackground(): Promise<Texture> {
  return Assets.load(GameAssets.background);
}
