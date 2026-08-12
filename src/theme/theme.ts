import { createTheme } from "@mui/material/styles";

import { breakpoints } from "./breakpoints";
import { components } from "./components";
import { layout } from "./layout";
import { palette } from "./palette";
import { radii, shape } from "./shape";
import { shadows } from "./shadows";
import { spacing } from "./spacing";
import { transitions } from "./transitions";
import { typography } from "./typography";

const theme = createTheme({
  cssVariables: {
    cssVarPrefix: "mrje",
  },
  palette,
  typography,
  breakpoints,
  spacing,
  shape,
  shadows,
  transitions,
  layout,
  radii,
  components,
});

export default theme;
