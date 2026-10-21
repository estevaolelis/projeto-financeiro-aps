import { alpha, createTheme } from '@mui/material';

const PRIMARIA = '#7c83ff';
const BORDA = 'rgba(255, 255, 255, 0.08)';

export const tema = createTheme({
  cssVariables: true,
  palette: {
    mode: 'dark',
    primary: { main: PRIMARIA },
    secondary: { main: '#5eead4' },
    success: { main: '#4caf7a' },
    error: { main: '#f06565' },
    warning: { main: '#f5a524' },
    background: { default: '#10121a', paper: '#191c27' },
    divider: BORDA,
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
      styleOverrides: {
        body: { backgroundAttachment: 'fixed' },
        '*::-webkit-scrollbar': { width: 10, height: 10 },
        '*::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255,255,255,.14)', borderRadius: 8 },
        '*::-webkit-scrollbar-thumb:hover': { backgroundColor: 'rgba(255,255,255,.24)' },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `1px solid ${BORDA}`,
          borderRadius: 16,
          boxShadow: '0 1px 2px rgba(0,0,0,.25), 0 8px 24px -12px rgba(0,0,0,.45)',
        },
      },
    },
    MuiAppBar: { styleOverrides: { root: { borderRadius: 0, border: 0, boxShadow: 'none' } } },
    MuiDrawer: { styleOverrides: { paper: { borderRadius: 0, border: 0, borderLeft: `1px solid ${BORDA}` } } },
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
          backgroundColor: 'rgba(255,255,255,.025)',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,.12)' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,.28)' },
          '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(PRIMARIA, 0.18)}` },
        },
      },
    },
    MuiMenu: { styleOverrides: { paper: { borderRadius: 12, marginTop: 4 } } },
    MuiMenuItem: { styleOverrides: { root: { borderRadius: 8, marginInline: 6, paddingBlock: 8 } } },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 20, backgroundImage: 'none' },
        root: { '& .MuiBackdrop-root': { backdropFilter: 'blur(4px)', backgroundColor: 'rgba(8,10,16,.65)' } },
      },
    },
    MuiDialogTitle: { styleOverrides: { root: { fontWeight: 800, letterSpacing: '-0.01em' } } },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            fontSize: '.72rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,.55)', backgroundColor: 'rgba(255,255,255,.03)',
          },
        },
      },
    },
    MuiTableCell: { styleOverrides: { root: { borderColor: BORDA, paddingBlock: 14 } } },
    MuiTableRow: { styleOverrides: { root: { '&:last-child td': { borderBottom: 0 } } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
    MuiAlert: { styleOverrides: { root: { borderRadius: 12, border: `1px solid ${BORDA}` } } },
    MuiLinearProgress: { styleOverrides: { root: { borderRadius: 999, backgroundColor: 'rgba(255,255,255,.08)' }, bar: { borderRadius: 999 } } },
    MuiToggleButtonGroup: { styleOverrides: { root: { gap: 4 } } },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', fontWeight: 600, borderRadius: 999, paddingInline: 16, border: `1px solid ${BORDA}`,
          '&.MuiToggleButtonGroup-grouped': { borderRadius: 999, border: `1px solid ${BORDA}` },
          '&.Mui-selected': { backgroundColor: alpha(PRIMARIA, 0.18), color: '#aab0ff', borderColor: alpha(PRIMARIA, 0.5) },
          '&.Mui-selected:hover': { backgroundColor: alpha(PRIMARIA, 0.26) },
        },
      },
    },
    MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } },
    MuiTooltip: { styleOverrides: { tooltip: { borderRadius: 8, fontWeight: 500 } } },
  },
});
