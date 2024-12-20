export function generateColor(): string {
  const colors: { [key: string]: string[] } = {
    purple: [
      '#4B0082', '#301934', '#1C0B1A', '#3A0D54', '#260238', '#3B0C50', '#2E1A47', '#472D59', '#5E3A73', '#4A2B5E',
      '#330D39', '#29092B', '#3F0E4F', '#56106B', '#421856', '#51204A', '#3B1145', '#341134', '#4D205B', '#542B6E'
    ],
    blue: [
      '#00008B', '#000080', '#191970', '#0C1445', '#101C58', '#1C245C', '#1A2B6C', '#213372', '#253A78', '#2A417E',
      '#002366', '#003366', '#003399', '#000066', '#0A0A45', '#1A1A7E', '#001F5B', '#00305B', '#1B3A72', '#1D2951'
    ],
    red: [
      '#8B0000', '#800000', '#7F0000', '#730000', '#660000', '#550000', '#450000', '#360000', '#280000', '#1A0000',
      '#4B0000', '#560000', '#600000', '#6A0000', '#5B0000', '#7C0000', '#5A0D0D', '#7F1A1A', '#5E0202', '#640000'
    ]
  };

  const colorNames = Object.keys(colors) as (keyof typeof colors)[];
  const randomColorName = colorNames[Math.floor(Math.random() * colorNames.length)];
  const colorOptions = colors[randomColorName];
  const randomColor = colorOptions[Math.floor(Math.random() * colorOptions.length)];

  return randomColor;
}