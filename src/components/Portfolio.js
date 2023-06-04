import React, { useState, useEffect } from "react";
import { Table, Avatar, Button, Space, Modal, Form, Input, Select,message } from "antd";
import axios from "axios";
import { useAccount } from "wagmi";
import data from "../tokenList.json";
import "../Portfolio.css";

const { Option } = Select;

function Portfolio() {
  const [tableData, setTableData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editedHolding, setEditedHolding] = useState("");
  const [form] = Form.useForm();
  const [editIndex, setEditIndex] = useState(-1);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addFormValues, setAddFormValues] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const tokenData = await Promise.all(
        data.map(async (coin) => {
          const price = await fetchTokenPrice(`arbitrum:${coin.address}`);
          return {
            ...coin,
            price: price || 1,
            holding: 1,
          };
        })
      );

      setTableData(tokenData);
    };

    fetchData();
  }, []);

  async function fetchTokenPrice(tokenAddress) {
    const apiUrl = `https://coins.llama.fi/prices/current/${tokenAddress}`;

    try {
      const response = await axios.get(apiUrl);
      const data = response.data;
      const price = data.coins[tokenAddress].price;

      return price;
    } catch (error) {
      console.error("Error fetching token price:", error);
      return null;
    }
  }

  const { isConnected } = useAccount();

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
      render: (_, token, currentIndex) => {
        return (
          <Space size="middle">
            <Button
              className="Button"
              type="primary"
              onClick={() => handleEdit(currentIndex)}
            >
              Edit
            </Button>
            <Button
              className="Button"
              danger
              onClick={() => handleDelete(currentIndex)}
            >
              Delete
            </Button>
          </Space>
        );
      },
    },
  ];

  const handleEdit = (currentIndex) => {
    const token = tableData[currentIndex];
    setEditedHolding(token.holding);
    form.setFieldsValue({ holding: token.holding });
    setModalVisible(true);
    setEditIndex(currentIndex);
  };

  const handleDelete = (currentIndex) => {
    const updatedTableData = [...tableData];
    updatedTableData.splice(currentIndex, 1);
    setTableData(updatedTableData);
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      const updatedTableData = [...tableData];
      updatedTableData[editIndex].holding = values.holding;
      setTableData(updatedTableData);
      setModalVisible(false);
      setEditedHolding(""); // Reset editedHolding state
    });
  };
  

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  const handleAddModalOk = () => {
    form.validateFields().then(async (values) => {
      const selectedToken = data.find((coin) => coin.address === addFormValues.token);
  
      // Check if the token already exists in the table
      const tokenExists = tableData.some((token) => token.address === selectedToken.address);
  
      if (tokenExists) {
        // Display a message or perform an action to indicate that the token already exists
        message.error('Token already exists in the table');
                return;
      }
  
      const price = await fetchTokenPrice(`arbitrum:${selectedToken.address}`);
      const newToken = {
        address: addFormValues.token,
        holding: values.holding,
        img: selectedToken.img,
        name: selectedToken.name,
        ticker: selectedToken.ticker,
        price: price || 1,
      };
      const tokenData = [...tableData, newToken];
      setTableData(tokenData);
      setAddModalVisible(false);
      form.resetFields();
    });
  };
  

  const handleAddModalCancel = () => {
    setAddModalVisible(false);
    form.resetFields();
  };

  const handleTokenSelect = (value) => {
    const selectedToken = data.find((coin) => coin.address === value);
    setAddFormValues((prevValues) => ({
      ...prevValues,
      token: value,
      price: selectedToken.price || 1,
      img: selectedToken.img,
      name: selectedToken.name,
      ticker: selectedToken.ticker,
    }));
  };

  const handleAddFormChange = (field, value) => {
    setAddFormValues((prevValues) => ({
      ...prevValues,
      [field]: value,
    }));
  };

  const mainTable = () => (
    <>
      <Table
        className="portfolio-table"
        columns={columns}
        dataSource={tableData}
        pagination={false}
      />
      <Modal
        visible={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form form={form}>
          <Form.Item
            name="holding"
            label="Holding"
            rules={[
              { required: true, message: "Please enter the holding value" },
            ]}
          >
            <Input
              type="number"
              placeholder="Enter the holding value"
              value={editedHolding}
              onChange={(e) => setEditedHolding(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );

  return (
    <div>
      <h2 className="tradeBoxHeader">
        Portfolio Watchlist
        {isConnected && (
          <div className="Button" onClick={() => setAddModalVisible(true)}>
            Add
          </div>
        )}
      </h2>
      {!isConnected && <p>Please connect your wallet</p>}
      {isConnected && mainTable()}
      <Modal
        visible={addModalVisible}
        onOk={handleAddModalOk}
        onCancel={handleAddModalCancel}
      >
        <Form form={form}>
          <Form.Item
            name="token"
            label="Token"
            rules={[
              { required: true, message: "Please select a token" },
            ]}
          >
            <Select
              placeholder="Select a token"
              onChange={(value) => handleTokenSelect(value)}
            >
              {data.map((coin) => (
                <Option key={coin.address} value={coin.address}>
                  {coin.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="holding"
            label="Holding"
            rules={[
              { required: true, message: "Please enter the holding value" },
            ]}
          >
            <Input
              type="number"
              placeholder="Enter the holding value"
              value={addFormValues.holding}
              onChange={(e) => handleAddFormChange("holding", e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Portfolio;
