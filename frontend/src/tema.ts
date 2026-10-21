import { alpha, createTheme } from '@mui/material';
import type { Theme } from '@mui/material';

export type ModoCor = 'light' | 'dark';

/** Paleta categórica validada (contraste e daltonismo) para cada modo, na mesma ordem de matiz. */
const PALETA_CATEGORICA: Record<ModoCor, string[]> = {
  dark: ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'],
  light: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'],
};
export const paletaCategorica = (modo: ModoCor) => PALETA_CATEGORICA[modo];

/** Cor de destaque para valores (primária clara no escuro, escura no claro, para manter o contraste). */
export const corDestaque = (tema: Theme) => (tema.palette.mode === 'dark' ? '#aab0ff' : tema.palette.primary.dark);

export function criarTema(modo: ModoCor) {
  const escuro = modo === 'dark';
  const tinta = escuro ? '255, 255, 255' : '16, 18, 26';
  const sobreposicao = (opacidade: number) => `rgba(${tinta}, ${opacidade})`;
  const linha = escuro ? 'rgba(255, 255, 255, 0.08)' : 'rgba(16, 18, 26, 0.1)';
  const primaria = escuro ? '#7c83ff' : '#4f57e6';

  return createTheme({
    palette: {
      mode: modo,
      primary: { main: primaria },
      secondary: { main: escuro ? '#5eead4' : '#0d9488' },
      success: { main: escuro ? '#4caf7a' : '#2e7d4f' },
      error: { main: escuro ? '#f06565' : '#d03d3d' },
      warning: { main: escuro ? '#f5a524' : '#b7701a' },
      background: escuro ? { default: '#10121a', paper: '#191c27' } : { default: '#f3f5fb', paper: '#ffffff' },
      text: escuro ? {} : { primary: '#171a26', secondary: 'rgba(23, 26, 38, 0.68)' },
      divider: linha,
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif',
      h1: { fontWeight: 800, letterSpacing: '-0.03em' },
      h2: { fontWeight: 800, letterSpacing: '-0.03em' },
      h3: { fontWeight: 800, letterSpacing: '-0.02em' },
      h4: { fontWeight: 800, letterSpacing: '-0.02em' },
      h5: { fontWeight: 700, letterSpacing: '-0.01em' },
      h6: { fontWeight: 700 },
      button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
      overline: { fontWeight: 700 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: (tema) => ({
          body: {
            colorScheme: modo,
            backgroundAttachment: 'fixed',
            background: `radial-gradient(900px 500px at 12% -10%, ${alpha(tema.palette.primary.main, escuro ? 0.14 : 0.1)}, transparent 60%), `
              + `radial-gradient(700px 420px at 95% 5%, ${alpha(tema.palette.secondary.main, escuro ? 0.07 : 0.08)}, transparent 60%), `
              + tema.palette.background.default,
          },
          '*::-webkit-scrollbar': { width: 10, height: 10 },
          '*::-webkit-scrollbar-thumb': { backgroundColor: sobreposicao(0.16), borderRadius: 8 },
          '*::-webkit-scrollbar-thumb:hover': { backgroundColor: sobreposicao(0.28) },
        }),
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${linha}`,
            borderRadius: 16,
            boxShadow: escuro
              ? '0 1px 2px rgba(0,0,0,.25), 0 8px 24px -12px rgba(0,0,0,.45)'
              : '0 1px 2px rgba(16,18,26,.05), 0 8px 24px -14px rgba(16,18,26,.2)',
          },
        },
      },
      MuiAppBar: { styleOverrides: { root: { borderRadius: 0, border: 0, boxShadow: 'none' } } },
      MuiDrawer: { styleOverrides: { paper: { borderRadius: 0, border: 0, borderLeft: `1px solid ${linha}` } } },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 10, paddingInline: 16, transition: 'transform .15s ease, background-color .15s ease, box-shadow .15s ease' },
          contained: ({ theme }) => ({
            '&:hover:not(.Mui-disabled)': { transform: 'translateY(-1px)', boxShadow: `0 6px 18px -6px ${alpha(theme.palette.primary.main, 0.7)}` },
          }),
        },
      },
      MuiIconButton: { styleOverrides: { root: { transition: 'background-color .15s ease, color .15s ease' } } },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            backgroundColor: sobreposicao(escuro ? 0.025 : 0.02),
            '& .MuiOutlinedInput-notchedOutline': { borderColor: sobreposicao(escuro ? 0.12 : 0.18) },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: sobreposicao(escuro ? 0.28 : 0.4) },
            '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(primaria, 0.18)}` },
          },
        },
      },
      MuiMenu: { styleOverrides: { paper: { borderRadius: 12, marginTop: 4 } } },
      MuiMenuItem: { styleOverrides: { root: { borderRadius: 8, marginInline: 6, paddingBlock: 8 } } },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 20, backgroundImage: 'none' },
          root: { '& .MuiBackdrop-root': { backdropFilter: 'blur(4px)', backgroundColor: escuro ? 'rgba(8,10,16,.65)' : 'rgba(16,18,26,.35)' } },
        },
      },
      MuiDialogTitle: { styleOverrides: { root: { fontWeight: 800, letterSpacing: '-0.01em' } } },
      MuiTableHead: {
        styleOverrides: {
          root: ({ theme }) => ({
            '& .MuiTableCell-root': {
              fontSize: '.72rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase',
              color: theme.palette.text.secondary, backgroundColor: sobreposicao(0.03),
            },
          }),
        },
      },
      MuiTableCell: { styleOverrides: { root: { borderColor: linha, paddingBlock: 14 } } },
      MuiTableRow: { styleOverrides: { root: { '&:last-child td': { borderBottom: 0 } } } },
      MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
      MuiAlert: { styleOverrides: { root: { borderRadius: 12, border: `1px solid ${linha}` } } },
      MuiLinearProgress: { styleOverrides: { root: { borderRadius: 999, backgroundColor: sobreposicao(0.08) }, bar: { borderRadius: 999 } } },
      MuiToggleButtonGroup: { styleOverrides: { root: { gap: 4 } } },
      MuiToggleButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            textTransform: 'none', fontWeight: 600, borderRadius: 999, paddingInline: 16, border: `1px solid ${linha}`,
            '&.MuiToggleButtonGroup-grouped': { borderRadius: 999, border: `1px solid ${linha}` },
            '&.Mui-selected': { backgroundColor: alpha(primaria, 0.18), color: corDestaque(theme), borderColor: alpha(primaria, 0.5) },
            '&.Mui-selected:hover': { backgroundColor: alpha(primaria, 0.26) },
          }),
        },
      },
      MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } },
      MuiTooltip: { styleOverrides: { tooltip: { borderRadius: 8, fontWeight: 500 } } },
    },
  });
}
