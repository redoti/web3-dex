import React, { useState, useEffect } from "react";
import { Table, Avatar, Button, Space } from "antd";
import axios from "axios";
import { useAccount } from "wagmi";
import data from "../tokenList.json";
import "../Portfolio.css";


function Portfolio() {
  const columns = [
    {
      title: "Icon",
      dataIndex: "img",
      key: "img",
      render: (text, token) => <Avatar src={token.img} />,
    },
    {
      title: "Token Name",
      dataIndex: "name",
      key: "name",
      align: "center",
      render: (text, token) => (
        <a>
          {text} ({token.ticker})
        </a>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      width: "100px",
      align: "center",
      render: (text) => <span>${text}</span>,
    },
    {
      title: "Holding",
      dataIndex: "holding",
      key: "holding",
      width: "100px",
      align: "center",
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Value",
      key: "value",
      width: "100px",
      align: "center",
      render: (_, token) => (
        <span>${(token.price * token.holding).toFixed(2)}</span>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: "100px",
      align: "center",
      render: (_, token) => (
        <Space size="middle">
          <Button className="Button" type="primary">Edit</Button>
          <Button className="Button" danger>Delete</Button>
        </Space>
      ),
    },
  ];

  const [defaultData, setDefaultData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const tokenData = await Promise.all(
        data.map(async (coin) => {
          const price = await fetchTokenPrice(`arbitrum:${coin.address}`); // Prefix the address with "arbitrum:"

          return {
            ...coin,
            price: price || 1, // Set default price as 1 if fetching fails
            holding: 1,
          };
        })
      );

      setDefaultData(tokenData);
    };

    fetchData();
  }, []);

  async function fetchTokenPrice(tokenAddress) {
    const apiUrl = `https://coins.llama.fi/prices/current/${tokenAddress}`;

    try {
      const response = await axios.get(apiUrl);
      const data = response.data;

      // Assuming the price is available in the "price" field of the response
      const price = data.coins[tokenAddress].price;

      return price;
    } catch (error) {
      console.error("Error fetching token price:", error);
      return null;
    }
  }

  const { isConnected } = useAccount();


  const mainTable = () => (
    <Table
      className="portfolio-table"
      columns={columns}
      dataSource={defaultData}
      pagination={false}
      
    />
  );

    
  return (
    <div>
      <h2 className="tradeBoxHeader">
        Portfolio Watchlist
        {isConnected && <div className="Button">Add</div>}
      </h2>
      {!isConnected && <p>Please connect your wallet</p>}
      {isConnected && mainTable()}
    </div>
  );
  
  
  
}

export default Portfolio;
