import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    typography: {
        fontFamily: '"Montserrat", "sans-serif"',
    },
    components: {
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    fontWeight: 500,
                    fontFamily: '"Montserrat", "sans-serif"',
                },
            },
        },
        MuiTypography: {
            styleOverrides: {
                root: {
                    fontFamily: '"Montserrat", "sans-serif"',
                },
            },
        },
    },
});

export default theme;