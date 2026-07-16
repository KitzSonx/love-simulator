import dynamic from 'next/dynamic';

export const TEMPLATES = {
  'retro-8bit': dynamic(() => import('@/components/templates/Retro8Bit/Retro8Bit'), {
    loading: () => <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>
  }),
  'recipe-of-love': dynamic(() => import('@/components/templates/RecipeOfLove/RecipeOfLove'), {
    loading: () => <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>
  }),
  // Future templates will be added here
  // 'minimal-romantic': dynamic(() => import('@/components/templates/MinimalRomantic/MinimalRomantic'))
};
