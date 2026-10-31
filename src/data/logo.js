/* Brand mark, traced from logo-ghost.png (900x731). Pixel coordinates, y down.
   One source for every place the logo appears: Logo.astro (nav, footer),
   public/favicon.svg and the 3D emblem in scripts/stage.js.
   `accent: true` is the crown. Recolour it with --logo-accent in styles/global.css
   (the nav mark follows the chapter accent via --accent). */
export const LOGO = {
  viewBox: '7.5 4.6 885.4 719.6',
  bbox: [7.5, 4.6, 892.9, 724.2],
  pieces: [
    {
      id: 'crown',
      accent: true,
      points: [[161.4, 125.4], [254, 4.6], [648.2, 4.6], [740.8, 125.4], [488.4, 125.4], [528.5, 177.6], [450.3, 274.4], [336.3, 125.4]],
    },
    {
      id: 'body',
      points: [[854.9, 405.2], [610, 724.2], [545.8, 724.2], [236.2, 324.4], [7.5, 324.4], [100.2, 203.3], [294.3, 203.3], [577.4, 568.7], [702.9, 405.2]],
    },
    {
      id: 'wing',
      points: [[501, 339.1], [605.4, 203.3], [800.1, 203.3], [892.9, 324.4], [664.4, 324.4], [577.3, 437.7]],
    },
    {
      id: 'blade',
      points: [[443.7, 724.2], [291.6, 724.2], [46.6, 405.2], [198.6, 405.2]],
    },
  ],
};
