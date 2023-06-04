import "./App.css";
import Header from "./components/Header";
import Swap from "./components/Swap";
import Portfolio from "./components/Portfolio";
import { Routes, Route } from "react-router-dom";
import { useConnect, useAccount } from "wagmi";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";




function App() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new MetaMaskConnector(),
  });

  return (
    
      <div className="App">
        <Header connect={connect} isConnected={isConnected} address={address} />
        <div className="mainWindow">
          <Routes>
            <Route path="/" element={<Swap isConnected={isConnected} address={address} />} />
            <Route path="/portfolio" element={<Portfolio />} />
          </Routes>
        </div>
      </div>
    
  );
}

export default App;
