import { BrowserRouter, Route, Routes } from "react-router";
// import {
//   authenticationRoutePaths,
//   baseRoutePaths,
//   protectedRoutePaths,
// } from "./common/routes";
// import ProtectedRoute from "./protected.route";
// import AuthRoute from "./auth.route";
// import BaseLayout from "@/layout/base.layout";
import AppLayout from "@/layout/app.layout";
// import NotFound from "@/pages/error/NotFound";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />} />

        {/* <Route element={<BaseLayout />}>
          {baseRoutePaths.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>

        <Route path="/" element={<AuthRoute />}>
          <Route element={<BaseLayout />}>
            {authenticationRoutePaths.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
          </Route>
        </Route> */}

        {/* Protected Route */}
        {/* <Route path="/" element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {protectedRoutePaths.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
          </Route>
        </Route> */}

        {/* Catch-all for undefined routes */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;

// Complete
