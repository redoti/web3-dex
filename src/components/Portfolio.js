import React, { useState, useEffect } from "react";
import { Table, Avatar } from "antd";
import axios from "axios";
import { useAccount } from "wagmi";
import tokenList from "../tokenList.json";
import "../Portfolio.css";
import { Alchemy, Network } from "alchemy-sdk";

function Portfolio() {
  const { isConnected, address } = useAccount();
  const [tokenPrices, setTokenPrices] = useState({});
  const [balances, setBalances] = useState([]);

  const config = {
    apiKey: "PuCUG-mzhjx1W_n6WB0VRDNd_Rr0-TfC",
    network: Network.ARB_MAINNET,
  };
  const alchemy = new Alchemy(config);

  useEffect(() => {
    const fetchTokenPrices = async () => {
      try {
        const tokenPriceData = {};

        await Promise.all(
          tokenList.map(async (token) => {
            const response = await axios.get(`https://coins.llama.fi/prices/current/arbitrum:${token.address}`);
            const tokenPrice = response?.data?.coins?.[`arbitrum:${token.address}`]?.price;

            if (tokenPrice !== undefined) {
              tokenPriceData[`arbitrum:${token.address}`] = tokenPrice;
            } else {
              console.error(`Invalid response for token address: arbitrum:${token.address}`);
            }
          })
        );

        setTokenPrices(tokenPriceData);
      } catch (error) {
        console.error('Error fetching token prices:', error);
      }
    };

    fetchTokenPrices();
  }, []);

  useEffect(() => {
    const fetchTokenBalances = async () => {
      try {
        const tokenContractAddresses = tokenList.map((token) => token.address);
        const data = await alchemy.core.getTokenBalances(address, tokenContractAddresses);

        const tokenBalances = await Promise.all(
          tokenContractAddresses.map(async (tokenAddress, index) => {
            const metadata = await alchemy.core.getTokenMetadata(tokenAddress);
            const tokenName = metadata.name + "(" + metadata.symbol + ")";
            const tokenBalance = data["tokenBalances"][index]["tokenBalance"] / Math.pow(10, metadata.decimals);
            const roundedBalance = tokenBalance.toFixed(3);


            return {
              name: tokenName,
              balance: roundedBalance,
              decimals: metadata.decimals,
              address: tokenAddress,
              img: metadata.logo,
              ticker: metadata.symbol,
            };
          })
        );

        setBalances(tokenBalances);
      } catch (error) {
        console.error("Error fetching token balances:", error);
      }
    };

    if (isConnected) {
      fetchTokenBalances();
    }
  }, [isConnected, address]);

  const columns = [
    {
      title: "Icon",
      dataIndex: "img",
      key: "img",
      render: (_, token) => <Avatar src={token.img} />,
    },
    {
      title: "Token Name",
      dataIndex: "name",
      key: "name",
      align: "center",
      render: (_, token) => <span>{token.name}</span>,
    },
    {
      title: "Price",
      dataIndex: "address",
      key: "price",
      width: "100px",
      align: "center",
      render: (address) => {
        const tokenPrice = tokenPrices[`arbitrum:${address}`];
        return tokenPrice ? <span>${tokenPrice}</span> : null;
      },
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      width: "100px",
      align: "center",
      render: (balance) => <span>{balance}</span>,
    },
    {
      title: "Value",
      key: "value",
      width: "100px",
      align: "center",
      render: (_, token) => {
        const tokenPrice = tokenPrices[`arbitrum:${token.address}`];
        const value = tokenPrice ? (tokenPrice * token.balance).toFixed(3) : null;
        return value ? <span>${value}</span> : null;
      },
    },
  ];

  const mainTable = () => (
    <>
      <Table
        className="portfolio-table-container && portfolio-table"
        columns={columns}
        dataSource={balances}
        pagination={false}
      />
    </>
  );

  return (
    <div className="portfolio-container">
      <h2 className="tradeBoxHeader">
        Portfolio Watchlist
        {isConnected}
      </h2>
      {!isConnected && <p>Please connect your wallet</p>}
      {isConnected && mainTable()}
    </div>
  );
}

export default Portfolio;
