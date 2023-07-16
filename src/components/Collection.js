import React, { useState, useEffect } from "react";
import { Alchemy } from "alchemy-sdk";
import { useAccount } from "wagmi";
import { TwitterOutlined, InfoCircleFilled, CloseCircleOutlined } from '@ant-design/icons';
import { Avatar, Card, Row, Col } from 'antd';
import '../Collection.css';
import config from "../configEth";
import debounce from 'lodash.debounce';
import etherscan from '../etherscan.svg';

const { Meta } = Card;

const Collection = () => {
  const alchemy = new Alchemy(config);
  const { isConnected, address } = useAccount();

  const [nftList, setNftList] = useState([]);

  useEffect(() => {
    if (isConnected) {
      const fetchData = async () => {
        try {
          const nfts = await alchemy.nft.getNftsForOwner(address);
          const ownedNfts = nfts.ownedNfts;

          const promises = ownedNfts.map(async (nft) => {
            const ContractAddress = nft.contract.address;
            const tokenId = nft.tokenId;

            if (ContractAddress && tokenId) {
              const metadata = await getNFTMetadata(ContractAddress, tokenId);

              if (metadata) {
                const nftFloorPrice = metadata?.contract?.openSea?.floorPrice;
                const nftImage = metadata?.media[0]?.gateway;
                const nftThumbnail = metadata?.media[0]?.thumbnail;
                const nftSymbol = metadata?.contract?.symbol;
                const nftContractAddress = metadata?.contract?.address;
                const nftName = metadata?.title;
                const nftUrl = metadata?.contract?.openSea?.externalUrl;
                const nftFormat = metadata?.media[0]?.format;
                const nftTwitter = metadata?.contract?.openSea?.twitterUsername;
                const nftImageUrl = metadata?.contract?.openSea?.imageUrl

                console.log(nftName + " " + nftImage);

                return {
                  ...nft,
                  metadata: {
                    nftFloorPrice,
                    nftImage,
                    nftThumbnail,
                    nftSymbol,
                    nftContractAddress,
                    nftName,
                    nftUrl,
                    nftFormat,
                    nftTwitter,
                    nftImageUrl,
                    tokenId
                  },
                };
              }
            }
          });

          const updatedNftList = await Promise.all(promises);

          setNftList(updatedNftList.filter(Boolean));
        } catch (error) {
          console.error("Error retrieving NFTs:", error);
        }
      };

      // Apply debounce to the fetchData function with a rate limit of 500ms
      const debouncedFetchData = debounce(fetchData, 500);
      debouncedFetchData();

      return () => {
        // Cleanup function to cancel any pending debounced function calls
        debouncedFetchData.cancel();
      };
    }
  }, []);

  const getNFTMetadata = async (ContractAddress, tokenId) => {
    try {
      const response = await alchemy.nft.getNftMetadata(
        ContractAddress,
        tokenId
      );
      return response;
    } catch (error) {
      console.error("Error retrieving NFT metadata:", error);
      return null;
    }
  };

  const handleInfoClick = (nftUrl) => {
    if (nftUrl) {
      window.open(nftUrl);
    }
  };

  const handleTwitterClick = (nftTwitter) => {
    if (nftTwitter) {
      const twitterUrl = `https://twitter.com/${nftTwitter}`;
      window.open(twitterUrl);
    }
  };

  const handleEtherClick = (nftContractAddress, tokenId) => {
    if (nftContractAddress && tokenId) {
      const etherscanUrl = `https://etherscan.io/nft/${nftContractAddress}/${tokenId}`;
      window.open(etherscanUrl);
    }
  };

  return (
    <div className="gallery-container">
      <h2>Collection</h2>
      {isConnected ? (
        <Row gutter={[16, 16]}>
          {nftList.map((nft, index) => (
            nft.metadata.nftImage && (
              <Col lg={6} md={8} xs={24} key={index}>
                <Card
                  className="card & actions"
                  cover={
                    ['mp4', 'webm', 'mkv', undefined].includes(nft.metadata.nftFormat) ? (
                      <video autoPlay loop
                        src={nft.metadata.nftImage}
                        alt={nft.title}
                        className="cover"
                      />
                    ) : (
                      <img
                        src={nft.metadata.nftImage}
                        alt={nft.title}
                        className="cover"
                      />
                    )
                  }
                  actions={[
                    <div className="icon" onClick={() => handleEtherClick(nft.metadata.nftContractAddress, nft.metadata.tokenId)}>
                      <div 
                      href={nft.metadata.nftContractAddress} 
                      target="_blank" 
                      rel="noopener noreferrer">
                        <img className="etherscan" src={etherscan} alt="Etherscan" />
                      </div>
                    </div>,

                    nft.metadata.nftTwitter ? (
                      <div className="icon" onClick={() => handleTwitterClick(nft.metadata.nftTwitter)}>
                        <div 
                        href={nft.metadata.nftTwitter} 
                        target="_blank" 
                        rel="noopener noreferrer">
                          <TwitterOutlined />
                        </div>
                      </div>
                    ) : (
                      <div className="icon">
                        <CloseCircleOutlined />
                      </div>
                    ),

                    nft.metadata.nftUrl ? (
                      <div className="icon" onClick={() => handleInfoClick(nft.metadata.nftUrl)}>
                        <div 
                        href={nft.metadata.nftUrl} 
                        target="_blank" 
                        rel="noopener noreferrer">
                          <InfoCircleFilled />
                        </div>
                      </div>
                    ) : (
                      <div className="icon">
                        <CloseCircleOutlined />
                      </div>
                    )
                  ]}
                >
                  <Meta
                    avatar={<Avatar src={nft.metadata.nftThumbnail || nft.metadata.nftImageUrl} />}
                    title={<span className="title">{nft.title}</span>}
                    description={<span className="description">Floor Price: {nft.metadata.nftFloorPrice || 0} ETH</span>}
                  />
                </Card>
              </Col>
            )
          ))}
        </Row>
      ) : (
        <div className="connect-wallet-text">
          Please connect your wallet
        </div>
      )}
    </div>
  );
};

export default Collection;
