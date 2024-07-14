import React from "react";
import { createRoot } from "react-dom/client";
import App from "~/components/App/App";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { theme } from "~/theme";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios, { AxiosRequestConfig } from "axios";

const errorMessage = {
  "401": "Authorization header is not provided",
  "403": "Invalid Authorization Token",
};

// Set default authorization token if not present in localStorage
const defaultToken = "YmVrdHVyNzc3OlRFU1RfUEFTU1dPUkQ=";
if (!localStorage.getItem("authorization_token")) {
  localStorage.setItem("authorization_token", defaultToken);
}

// Add request interceptor to set the Authorization header
axios.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem("authorization_token");
    if (token) {
      if (!config.headers) {
        config.headers = {};
      }
      config.headers.Authorization = `Basic ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 and 403 errors
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const statusCode: number = error.response?.status;

    if (statusCode === 401 || statusCode === 403) {
      toast(`${errorMessage[statusCode]}, Status Code: ${statusCode}`);
    }
    return Promise.reject(error);
  }
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: false, staleTime: Infinity },
  },
});

if (import.meta.env.DEV) {
  const { worker } = await import("./mocks/browser");
  worker.start({ onUnhandledRequest: "bypass" });
}

const container = document.getElementById("app");
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
          <ToastContainer />
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
