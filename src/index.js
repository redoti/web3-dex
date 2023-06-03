import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { configureChains, WagmiConfig, createClient } from "wagmi";
import { arbitrum } from 'wagmi/chains'
import { publicProvider } from "wagmi/providers/public";

const { provider, webSocketProvider } = configureChains(
  [arbitrum], // Use Arbitrum chain configuration instead of Ethereum mainnet
  [publicProvider()]
);

const client = createClient({
  autoConnect: true,
  provider,
  webSocketProvider,
});

ReactDOM.render(
  <React.StrictMode>
    <WagmiConfig client={client}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </WagmiConfig>
  </React.StrictMode>,
  document.getElementById("root")
);
